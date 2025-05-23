import { createClient } from '@sanity/client'
import { SanityClient } from '@sanity/client'

interface OrderReference {
    _type: 'reference'
    _ref: string
}

// Initialize the Sanity client
const client: SanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2024-03-19',
    token: process.env.SANITY_API_WRITE_TOKEN, // You'll need to create a token with write access
    useCdn: false
})

async function forceDeleteOrder(orderId: string) {
    try {
        // First, find all users that reference this order
        const users = await client.fetch(`
            *[_type == "user" && references($orderId)]{
                _id,
                orders
            }
        `, { orderId })

        // Remove the order reference from all users
        for (const user of users) {
            await client
                .patch(user._id)
                .set({
                    orders: user.orders.filter((order: OrderReference) => order._ref !== orderId)
                })
                .commit()
        }

        // Now delete the order
        await client.delete(orderId)
        console.log(`Successfully deleted order ${orderId}`)
    } catch (error) {
        console.error('Error deleting order:', error)
        throw error
    }
}

async function forceDeleteUser(userId: string) {
    try {
        // First, find all orders that reference this user
        const orders = await client.fetch(`
            *[_type == "checkout" && references($userId)]{
                _id
            }
        `, { userId })

        // Delete all orders associated with this user
        for (const order of orders) {
            await client.delete(order._id)
        }

        // Now delete the user
        await client.delete(userId)
        console.log(`Successfully deleted user ${userId} and their ${orders.length} orders`)
    } catch (error) {
        console.error('Error deleting user:', error)
        throw error
    }
}

// Example usage:
// To delete an order:
// forceDeleteOrder('order-id-here')

// To delete a user:
// forceDeleteUser('user-id-here')

// Export the functions
export { forceDeleteOrder, forceDeleteUser } 