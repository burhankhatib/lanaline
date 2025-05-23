'use server'

import { client } from '@/sanity/lib/client'
import { getUserByClerkId } from './user'

interface OrderItem {
    product: {
        _id: string
        _type: string
        sku?: string
        stock?: number
        _ref?: string
    }
    quantity: number
    price: number
    _key: string
}

interface ShippingAddress {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
}

interface ApiErrorResponse {
    message: string
}

interface OrderData {
    firstName: string
    lastName: string
    email: string
    phone: string
    items: OrderItem[]
    totalAmount: number
    shippingAddress: ShippingAddress
    paymentMethod: string
    userId: string // Add Clerk user ID
    stock: number
}

// Function to restore stock when order is cancelled or refunded
export async function restoreStock(orderId: string) {
    try {
        console.log('Restore Stock - Starting stock restoration for order:', orderId)
        
        // Get the order document
        const order = await client.fetch(`*[_id == $id][0]`, { id: orderId })
        console.log('Restore Stock - Order document:', order)
        
        if (!order) {
            throw new Error(`Order not found: ${orderId}`)
        }

        // Get all items from the order
        const items = order.items || []
        console.log(`Restore Stock - Found ${items.length} items to restore`)

        if (items.length === 0) {
            console.warn('Restore Stock - No items found in order')
            return true
        }

        // Prepare data for stock update
        const productIds = items
            .filter((item: OrderItem) => item.product?._ref)
            .map((item: OrderItem) => item.product._ref)
        const quantities = items
            .filter((item: OrderItem) => item.product?._ref)
            .map((item: OrderItem) => item.quantity || 1)

        if (productIds.length === 0) {
            console.warn('Restore Stock - No valid product references found')
            return true
        }

        // Call manage-stock API to increment stock
        const stockResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/manage-stock`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productIds,
                quantities,
                action: 'increment'
            })
        })

        if (!stockResponse.ok) {
            const errorData = await stockResponse.json() as ApiErrorResponse
            throw new Error(`Failed to restore stock: ${errorData.message}`)
        }

        console.log('Restore Stock - Successfully restored stock')
        return true
    } catch (error) {
        console.error('Restore Stock - Error:', error)
        throw error
    }
}

export async function createOrder(orderData: OrderData) {
    try {
        // Check if user exists
        let userDoc = await getUserByClerkId(orderData.userId)

        if (!userDoc) {
            // Create new user if doesn't exist
            userDoc = await client.create({
                _type: 'user',
                userId: orderData.userId,
                firstName: orderData.firstName,
                lastName: orderData.lastName,
                email: orderData.email,
                phone: orderData.phone,
                address: orderData.shippingAddress,
                country: orderData.shippingAddress.country,
                currency: 'AED',
                orders: [],
                totalSpent: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })
        }

        // Generate a unique order number
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

        // Prepare data for stock update
        const productIds = orderData.items.map(item => item.product._id)
        const quantities = orderData.items.map(item => item.quantity)

        // Call manage-stock API to decrement stock
        const stockResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/manage-stock`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productIds,
                quantities,
                action: 'decrement'
            })
        })

        if (!stockResponse.ok) {
            const errorData = await stockResponse.json() as ApiErrorResponse
            throw new Error(`Failed to update stock: ${errorData.message}`)
        }

        // Create the order document
        const orderDoc = await client.create({
            _type: 'checkout',
            orderNumber,
            user: {
                _type: 'reference',
                _ref: userDoc._id
            },
            items: orderData.items.map((item) => ({
                _key: Math.random().toString(36).substring(7),
                product: {
                    _type: 'reference',
                    _ref: item.product._id
                },
                quantity: item.quantity,
                price: item.price,
                sku: item.product.sku || Math.random().toString(36).substring(7),
                key: Math.random().toString(36).substring(7),
                stock: item.product.stock || 0
            })),
            totalAmount: orderData.totalAmount,
            status: 'pending',
            shippingAddress: orderData.shippingAddress,
            paymentMethod: orderData.paymentMethod,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })

        // Update user with new order and total spent
        await client
            .patch(userDoc._id)
            .set({
                orders: [...(userDoc.orders || []), { 
                    _type: 'reference', 
                    _ref: orderDoc._id,
                    _key: Math.random().toString(36).substring(7)
                }],
                totalSpent: (userDoc.totalSpent || 0) + orderData.totalAmount,
                updatedAt: new Date().toISOString()
            })
            .commit()

        return orderDoc
    } catch (error) {
        console.error('Error creating order:', error)
        throw error
    }
} 