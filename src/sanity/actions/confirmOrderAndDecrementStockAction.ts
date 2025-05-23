// src/sanity/actions/confirmOrderAndDecrementStockAction.ts
import { DocumentActionProps, SanityDocument, useDocumentOperation } from 'sanity'
import { CheckmarkCircleIcon } from '@sanity/icons' // Example icons

interface CheckoutItem {
  product?: {
    _ref: string
  }
  quantity: number
}

interface CheckoutDocument extends SanityDocument {
  orderNumber?: string;
  status?: string
  items?: CheckoutItem[]
  // Optional: Add a flag to prevent multiple stock decrements
  // stockDecremented?: boolean; 
}

interface ExtendedDocumentActionProps extends DocumentActionProps {
  toast?: {
    push: (params: { status: 'error' | 'success' | 'warning' | 'info'; title: string; description?: string }) => void;
  };
}

export function ConfirmOrderAndDecrementStockAction(props: ExtendedDocumentActionProps) {
  const { id, type, published, onComplete } = props;
  const { patch } = useDocumentOperation(id, type);

  const doc = published as CheckoutDocument | null;

  // Only show if status is 'pending' (or your initial order status)
  // And optionally, if stock hasn't been decremented yet (if you add such a flag)
  if (!doc || doc.status !== 'pending' /* || doc.stockDecremented */) {
    return null;
  }

  return {
    label: 'Confirm Order & Update Stock',
    icon: CheckmarkCircleIcon,
    onHandle: async () => {
      if (!doc?.items || doc.items.length === 0) {
        // Use Sanity's built-in toast system
        props.toast?.push({
          status: 'error',
          title: 'No items in order.',
        });
        console.error('No items in order to update stock for.');
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
          title: 'No valid product references in order items.',
        });
        onComplete();
        return;
      }

      // Construct the absolute URL to your API route
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (!appUrl) {
        console.error("NEXT_PUBLIC_APP_URL is not set. Cannot call API route.");
        props.toast?.push({
          status: 'error',
          title: 'Configuration error: App URL not set.',
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
            // If you add an API key for your /api/manage-stock route:
            // 'Authorization': `Bearer ${process.env.SANITY_STUDIO_STOCK_API_KEY}` // Needs SANITY_STUDIO_... env var
          },
          body: JSON.stringify({
            productIds,
            quantities,
            action: 'decrement',
          }),
        });

        const responseData = await response.json() as { message?: string };

        if (!response.ok) {
          throw new Error(responseData.message || `Failed to update stock (status: ${response.status})`);
        }

        // If stock update is successful, update the order status in Sanity
        patch.execute([
          { set: { 
              status: 'processing', // Or 'confirmed_stock_ok', etc.
              // stockDecremented: true, // If using a flag
              updatedAt: new Date().toISOString() 
            } 
          }
        ]);
        
        props.toast?.push({
          status: 'success',
          title: 'Stock Decremented',
          description: `Order ${doc.orderNumber || doc._id} processed.`,
        });

      } catch (error) {
        console.error('Error decrementing stock via API:', error);
        props.toast?.push({
          status: 'error',
          title: 'Stock Update Failed',
          description: error instanceof Error ? error.message : String(error),
        });
      } finally {
        onComplete();
      }
    },
  };
}