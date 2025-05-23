// src/sanity/actions/updateOrderStatus.ts
import { DocumentActionProps, SanityDocument, ToastParams } from 'sanity'
import { restoreStock } from '@/app/actions/order'
import { createClient } from '@sanity/client'

// ... (interfaces remain the same) ...
interface CheckoutDocument extends SanityDocument {
    _id: string;
    _type: string;
    status?: string;
    orderNumber?: string;
    items?: Array<{
      product?: {
        _ref: string;
      };
      quantity: number;
    }>;
}

interface ExtendedDocumentActionProps extends DocumentActionProps {
  toast?: {
    push: (params: ToastParams) => void;
  };
}

export const updateOrderStatus = (props: ExtendedDocumentActionProps) => {
  const { published, onComplete } = props;
  const doc = published as CheckoutDocument | null;
  
  if (!doc) {
    return null;
  }

  return {
    label: `Process Status: ${doc.status || 'N/A'}`,
    onHandle: async () => {
      if (!doc.status) {
        props.toast?.push({ status: 'error', title: 'Order status is not set.'} as ToastParams);
        onComplete();
        return;
      }
      
      try {
        let stockRestoredMessage = '';
        if (doc.status === 'cancelled' || doc.status === 'refunded') {
          props.toast?.push({ status: 'info', title: `Order ${doc.orderNumber} is ${doc.status}. Attempting to restore stock...`} as ToastParams);
          
          const restoreResult = await restoreStock(doc._id);
          
          if (restoreResult.success) {
            stockRestoredMessage = 'Stock restored successfully.';
            props.toast?.push({ status: 'success', title: 'Stock Restored', description: `For order ${doc.orderNumber}.`} as ToastParams);
          } else {
            stockRestoredMessage = `Stock restoration failed: ${restoreResult.message}`;
            props.toast?.push({ status: 'error', title: 'Stock Restoration Failed', description: restoreResult.message } as ToastParams);
          }
        }

        // Update the document
        const client = createClient({
          projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
          dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
          apiVersion: '2024-05-23',
          useCdn: false,
        });

        await client
          .patch(doc._id)
          .set({ updatedAt: new Date().toISOString() })
          .commit();

        props.toast?.push({ status: 'success', title: `Order ${doc.orderNumber} status processed. ${stockRestoredMessage}`.trim()} as ToastParams);
        
      } catch (error) {
        console.error('Update Order Status Action - Error:', error);
        props.toast?.push({ status: 'error', title: 'Failed to process order status', description: error instanceof Error ? error.message : String(error)} as ToastParams);
      } finally {
        onComplete();
      }
    }
  };
}