// src/sanity/actions/processOrderAndDecrementStockAction.ts
import { DocumentActionProps, SanityDocument, useDocumentOperation } from 'sanity'
import { CheckmarkCircleIcon } from '@sanity/icons' // Or any appropriate icon

interface CheckoutItem {
  product?: {
    _ref: string; // Product ID
  };
  quantity: number;
}

interface CheckoutDocumentForAction extends SanityDocument {
  orderNumber?: string;
  status?: string;
  items?: CheckoutItem[];
  // Optional flag: stockDecremented?: boolean;
}

interface ExtendedDocumentActionProps extends DocumentActionProps {
  toast?: {
    push: (params: { status: 'error' | 'success' | 'warning' | 'info'; title: string; description?: string }) => void;
  };
}

export function ProcessOrderAndDecrementStockAction(props: ExtendedDocumentActionProps) {
  const { id, type, published, onComplete } = props;
  const { patch } = useDocumentOperation(id, type);

  const doc = published as CheckoutDocumentForAction | null;

  // This action should appear if the order is 'pending' (or your initial state)
  // and if you implement a flag like `stockDecremented`, check that too.
  if (!doc || doc.status !== 'pending' /* || doc.stockDecremented */) {
    return null;
  }

  return {
    label: 'Process Order & Decrement Stock',
    icon: CheckmarkCircleIcon, // Example icon
    onHandle: async () => {
      if (!doc?.items || doc.items.length === 0) {
        props.toast?.push({
          status: 'error',
          title: 'No items in order.'
        });
        onComplete();
        return;
      }

      const productIds = doc.items
        .map(item => item.product?._ref)
        .filter((ref): ref is string => !!ref);
      const quantities = doc.items
        .filter(item => !!item.product?._ref)
        .map(item => item.quantity);

      if (productIds.length === 0) {
        props.toast?.push({
          status: 'error',
          title: 'No valid product references in order items.'
        });
        onComplete();
        return;
      }

      // IMPORTANT: Your Sanity Studio needs to know the URL of your Next.js app
      // Ensure NEXT_PUBLIC_APP_URL is set in your Sanity Studio's environment variables if it's separate
      // or accessible if the Studio is embedded in your Next.js app.
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (!appUrl) {
        console.error("ProcessOrderAction: NEXT_PUBLIC_APP_URL is not set. Cannot call API route.");
        props.toast?.push({
          status: 'error',
          title: 'Configuration error: App URL not set for API call.'
        });
        onComplete();
        return;
      }
      const apiRouteUrl = `${appUrl.replace(/\/$/, '')}/api/manage-stock`;

      try {
        const response = await fetch(apiRouteUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // If your API route requires an API key for calls from the Studio:
            // 'Authorization': `Bearer ${process.env.SANITY_STUDIO_STOCK_API_KEY}`
          },
          body: JSON.stringify({
            productIds,
            quantities,
            action: 'decrement',
          }),
        });

        const responseData = await response.json() as { message?: string };

        if (!response.ok) {
          throw new Error(responseData.message || `Failed to update stock via API (status: ${response.status})`);
        }

        // If stock update via API is successful, update the order status in Sanity
        patch.execute([
          { set: { 
              status: 'processing', // Or 'shipped', or whatever your next status is
              // stockDecremented: true, // If you add this flag
              updatedAt: new Date().toISOString() 
            }
          }
        ]);
        
        props.toast?.push({
          status: 'success',
          title: 'Order Processed & Stock Decremented',
          description: `Stock updated for order ${doc.orderNumber || doc._id}. Status set to 'processing'.`,
        });

      } catch (error) {
        console.error('Error processing order and decrementing stock:', error);
        props.toast?.push({
          status: 'error',
          title: 'Processing Failed',
          description: error instanceof Error ? error.message : String(error),
        });
      } finally {
        onComplete(); // Close the action dialog in the Studio
      }
    },
  };
}