// src/sanity/actions/updateStock.ts
import { DocumentActionProps, SanityDocument, ToastParams } from 'sanity'
import { createClient } from '@sanity/client'

interface ProductDocument extends SanityDocument {
  _id: string;
  _type: string;
  title?: string;
  stock?: number;
}

interface ExtendedDocumentActionProps extends DocumentActionProps {
  toast?: {
    push: (params: ToastParams) => void;
  };
}

export const updateStock = (props: ExtendedDocumentActionProps) => {
  const { published, onComplete } = props;
  const doc = published as ProductDocument | null;
  
  if (!doc) {
    return null;
  }

  return {
    label: `Update Stock: ${doc.stock || 0}`,
    onHandle: async () => {
      try {
        const client = createClient({
          projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
          dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
          apiVersion: '2024-05-23',
          useCdn: false,
        });

        // Get current stock value
        const currentStock = doc.stock || 0;
        
        // Update the document with new stock value
        await client
          .patch(doc._id)
          .set({ 
            stock: currentStock,
            updatedAt: new Date().toISOString() 
          })
          .commit();

        props.toast?.push({ 
          status: 'success', 
          title: 'Stock Updated', 
          description: `Stock for ${doc.title || 'Product'} is now ${currentStock}` 
        } as ToastParams);
        
      } catch (error) {
        console.error('Update Stock Action - Error:', error);
        props.toast?.push({ 
          status: 'error', 
          title: 'Failed to update stock', 
          description: error instanceof Error ? error.message : String(error)
        } as ToastParams);
      } finally {
        onComplete();
      }
    }
  };
} 