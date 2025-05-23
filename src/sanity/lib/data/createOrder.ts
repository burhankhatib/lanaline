import { client } from '../client'
import { Product } from '../../../../sanity.types'

interface OrderItem {
    product: Product
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

interface OrderData {
    firstName: string
    lastName: string
    email: string
    phone: string
    items: OrderItem[]
    totalAmount: number
    shippingAddress: ShippingAddress
    paymentMethod: string
    _id: string
    _type: string
    _createdAt: string
    _updatedAt: string
    _rev: string
    _createdBy: string
    _updatedBy: string
    _publishedAt: string
    _status: string
    _order: number
    _slug: string
}

export const createOrder = async (orderData: OrderData) => {
    try {
        // First create a user record
        const userDoc = await client.create({
            _type: 'user',
            firstName: orderData.firstName,
            lastName: orderData.lastName,
            email: orderData.email,
            phone: orderData.phone,
            address: orderData.shippingAddress,
            country: orderData.shippingAddress.country,
            currency: 'AED', // You might want to make this dynamic based on user's location
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })

        // Generate a unique order number (you might want to implement a more sophisticated system)
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

        // Create the order document
        const orderDoc = await client.create({
            _type: 'checkout',
            orderNumber,
            user: {
                _type: 'reference',
                _ref: userDoc._id
            },
            items: orderData.items.map(item => ({
                product: {
                    _type: 'reference',
                    _ref: item.product._id,
                    media: item.product.images?.[0]?.asset
                },
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount: orderData.totalAmount,
            status: 'pending',
            shippingAddress: orderData.shippingAddress,
            paymentMethod: orderData.paymentMethod,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })

        return orderDoc
    } catch (error) {
        console.error('Error creating order:', error)
        throw error
    }
} 