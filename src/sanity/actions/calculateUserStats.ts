import { SanityClient } from '@sanity/client'
import { DocumentActionComponent, DocumentActionProps } from 'sanity'
import { createClient } from '@sanity/client'

interface Order {
  _id: string
  status: string
  amount: number
}

interface UserStats {
  totalOrders: number
  totalSpent: number
}

interface UserDocument {
  _id: string
  userId: string
  totalSpent: number
}

export async function calculateUserStats(
  client: SanityClient,
  userId: string
): Promise<UserStats> {
  // Fetch all orders for the user
  const orders = await client.fetch<Order[]>(`
    *[_type == "checkout" && user._ref == $userId] {
      _id,
      status,
      amount
    }
  `, { userId })

  // Calculate statistics
  const stats = orders.reduce<UserStats>((acc, order) => {
    // Skip cancelled or refunded orders
    if (order.status === 'cancelled' || order.status === 'refunded') {
      return acc
    }

    return {
      totalOrders: acc.totalOrders + 1,
      totalSpent: acc.totalSpent + (order.amount || 0)
    }
  }, { totalOrders: 0, totalSpent: 0 })

  return stats
}

export const calculateUserStatsAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const published = props.published as UserDocument | null
  
  if (!published?.userId) {
    return null
  }

  return {
    label: 'Calculate User Stats',
    onHandle: async () => {
      try {
        const client = createClient({
          projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
          dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
          apiVersion: '2024-07-11',
          useCdn: false,
          token: process.env.SANITY_WRITE_TOKEN
        })
        
        const stats = await calculateUserStats(client, published.userId)
        
        // Update the user document with new stats
        await client
          .patch(published._id)
          .set({
            totalSpent: stats.totalSpent,
            // You can add more fields here as needed
          })
          .commit()

        return {
          message: `Updated user stats: ${stats.totalOrders} orders, Total spent: ${stats.totalSpent}`
        }
      } catch (error) {
        throw new Error(`Failed to calculate user stats: ${error.message}`)
      }
    }
  }
} 