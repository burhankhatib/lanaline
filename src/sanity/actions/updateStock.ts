import { DocumentActionComponent, DocumentActionProps } from 'sanity'
import { studioClient } from '../lib/studioClient'

interface CheckoutItem {
  product?: {
    _ref: string
  }
  quantity: number
}

interface CheckoutDocument {
  _id: string
  _type: string
  status?: string
  items?: CheckoutItem[]
}

export const updateStock: DocumentActionComponent = (props: DocumentActionProps) => {
  const published = props.published as CheckoutDocument | null
  
  console.log('Update Stock Action - Document:', published)
  
  if (!published) {
    console.warn('Update Stock Action - No published document found')
    return null
  }
  
  if (published.status !== 'processing') {
    console.log('Update Stock Action - Status is not processing:', published.status)
    return null
  }

  return {
    label: 'Update Stock',
    onHandle: async () => {
      try {
        console.log('Update Stock Action - Starting stock update')
        
        // Get all items from the checkout
        const items = published.items || []
        console.log('Update Stock Action - Items:', items)

        if (items.length === 0) {
          throw new Error('No items found in the order')
        }

        // Start a transaction for all stock updates
        const transaction = studioClient.transaction()

        // First, verify all products have sufficient stock
        for (const item of items) {
          if (!item.product?._ref) {
            console.warn('Skipping item due to missing product reference:', item)
            continue
          }

          const product = await studioClient.fetch(`*[_id == $id][0]`, { id: item.product._ref })
          
          if (!product) {
            throw new Error(`Product not found for ID: ${item.product._ref}`)
          }

          const currentStock = product.stock || 0
          if (currentStock < item.quantity) {
            throw new Error(`Insufficient stock for product ${product.title?.en || product._id}. Available: ${currentStock}, Requested: ${item.quantity}`)
          }
        }

        // Then update stock for each product
        for (const item of items) {
          if (!item.product?._ref) continue

          try {
            // Get the current product
            const product = await studioClient.fetch(`*[_id == $id][0]`, { id: item.product._ref })
            
            if (!product) {
              throw new Error(`Product not found for ID: ${item.product._ref}`)
            }

            // Calculate new stock
            const currentStock = product.stock || 0
            const newStock = currentStock - item.quantity

            // Add stock update to transaction
            transaction.patch(item.product._ref, (p) => p.set({ stock: newStock }))
            
            console.log(`Update Stock Action - Preparing stock update for product ${product._id}: ${currentStock} -> ${newStock} (quantity: ${item.quantity})`)
          } catch (error) {
            console.error(`Error preparing stock update for product ${item.product._ref}:`, error)
            throw new Error(`Failed to prepare stock update: ${error.message}`)
          }
        }

        // Commit all stock updates
        await transaction.commit()
        console.log('Update Stock Action - Successfully committed stock updates')

        // Update checkout status to shipped
        console.log('Update Stock Action - Updating order status to shipped')
        await studioClient
          .patch(published._id)
          .set({ status: 'shipped' })
          .commit()

        console.log('Update Stock Action - Successfully completed')
        return {
          message: 'Stock updated successfully'
        }
      } catch (error) {
        console.error('Update Stock Action - Error:', error)
        throw new Error(`Failed to update stock: ${error.message}`)
      }
    }
  }
} 