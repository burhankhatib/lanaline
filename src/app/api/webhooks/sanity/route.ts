import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

interface WebhookBody {
    _type: string
    _id: string
    status?: string
}

export async function POST(req: Request) {
    try {
        const body = await req.json() as WebhookBody
        const { _type, _id } = body

        // Only process checkout documents
        if (_type !== 'checkout') {
            return NextResponse.json({ message: 'Not a checkout document' }, { status: 200 })
        }

        // Get the user document
        const userDoc = await client.fetch(`*[_type == "user" && references($id)][0]`, {
            id: _id
        })

        if (!userDoc) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        // Get all non-cancelled orders for the user
        const orders = await client.fetch(`
            *[_type == "checkout" && references($userId) && status != "cancelled"] {
                totalAmount
            }
        `, {
            userId: userDoc._id
        })

        // Calculate new total spent
        const newTotalSpent = orders.reduce((sum: number, order: { totalAmount: number }) => {
            return sum + (order.totalAmount || 0)
        }, 0)

        // Update user's total spent
        await client
            .patch(userDoc._id)
            .set({
                totalSpent: newTotalSpent,
                updatedAt: new Date().toISOString()
            })
            .commit()

        return NextResponse.json({ message: 'Success' }, { status: 200 })
    } catch (error) {
        console.error('Error processing webhook:', error)
        return NextResponse.json({ message: 'Error processing webhook' }, { status: 500 })
    }
} 