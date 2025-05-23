import { DocumentActionComponent, DocumentActionProps } from 'sanity'
import { studioClient } from '../lib/studioClient'
import { restoreStock } from '@/app/actions/order'

interface CheckoutDocument {
  _id: string
  _type: string
  status?: string
  items?: Array<{
    product?: {
      _ref: string
    }
    quantity: number
  }>
}

export const updateOrderStatus: DocumentActionComponent = (props: DocumentActionProps) => {
  const published = props.published as CheckoutDocument | null
  
  console.log('Update Order Status Action - Document:', published)
  
  if (!published) {
    console.warn('Update Order Status Action - No published document found')
    return null
  }

  return {
    label: 'Update Status',
    onHandle: async () => {
      try {
        // Get the current status
        const currentStatus = published.status || 'pending'
        console.log('Update Order Status Action - Current status:', currentStatus)
        
        // First update the order status
        console.log('Update Order Status Action - Updating order status to:', currentStatus)
        await studioClient
          .patch(published._id)
          .set({ 
            status: currentStatus,
            updatedAt: new Date().toISOString()
          })
          .commit()

        // Then restore stock if the status is cancelled or refunded
        if (currentStatus === 'cancelled' || currentStatus === 'refunded') {
          console.log(`Update Order Status Action - Order ${published._id} is ${currentStatus}, restoring stock...`)
          
          // Get the items before restoring stock
          const items = published.items || []
          console.log('Update Order Status Action - Items to restore:', items)
          
          if (items.length === 0) {
            console.warn('Update Order Status Action - No items found in order')
            return {
              message: `Order status updated to ${currentStatus} (no items to restore)`
            }
          }

          try {
            await restoreStock(published._id)
            console.log('Update Order Status Action - Stock restored successfully')
          } catch (error) {
            console.error('Update Order Status Action - Error restoring stock:', error)
            // Continue even if stock restoration fails
          }
        }

        console.log('Update Order Status Action - Order status updated successfully')
        return {
          message: `Order status updated to ${currentStatus}`
        }
      } catch (error) {
        console.error('Update Order Status Action - Error:', error)
        throw new Error(`Failed to update order status: ${error.message}`)
      }
    }
  }
} 