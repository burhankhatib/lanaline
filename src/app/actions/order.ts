// src/app/actions/order.ts
'use server'

import { client } from '@/sanity/lib/client'
import { getUserByClerkId } from './user'

interface ShippingAddress {
    country: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
}

interface OrderData {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    shippingAddress: ShippingAddress;
    items: Array<{
        _key?: string;
        product: {
            _id: string;
            sku?: string;
        };
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    paymentMethod: string;
}

interface OrderItem {
    product: {
        _id: string;
    };
    quantity: number;
}

interface ApiResponse {
    message?: string;
    success?: boolean;
    data?: unknown;
}

export async function createOrder(orderData: OrderData) {
    try {
        let userDoc = await getUserByClerkId(orderData.userId);

        if (!userDoc) {
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
            });
        }

        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // REMOVE THE CALL TO /api/manage-stock for 'decrement'
        // const productIds = orderData.items.map(item => item.product._id);
        // const quantities = orderData.items.map(item => item.quantity);
        // const stockResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/manage-stock`, {
        //     method: 'POST',
        //     // ... body for decrement
        // });
        // if (!stockResponse.ok) {
        //     const errorData = await stockResponse.json() as ApiErrorResponse;
        //     throw new Error(`Failed to update stock: ${errorData.message}`);
        // }

        const orderDoc = await client.create({
            _type: 'checkout',
            orderNumber,
            user: { _type: 'reference', _ref: userDoc._id },
            items: orderData.items.map((item: { _key?: string; product: { _id: string; sku?: string }; quantity: number; price: number }) => ({
                _key: item._key || Math.random().toString(36).substring(7),
                product: { _type: 'reference', _ref: item.product._id },
                quantity: item.quantity,
                price: item.price,
                sku: item.product.sku || `SKU_AUTO_${item.product._id.substring(0,5)}`,
                // Removed 'stock: item.product.stock || 0' from here,
                // as line item stock snapshot might not be what you mean.
                // The product document's stock is the source of truth.
            })),
            totalAmount: orderData.totalAmount,
            status: 'pending', // Initial status
            shippingAddress: orderData.shippingAddress,
            paymentMethod: orderData.paymentMethod,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        await client
            .patch(userDoc._id)
            .setIfMissing({ orders: [] })
            .append('orders', [{ 
                _type: 'reference', 
                _ref: orderDoc._id,
                _key: Math.random().toString(36).substring(7)
            }])
            // Total spent should be updated upon payment confirmation / order completion,
            // not just creation of a 'pending' order.
            // .inc({ totalSpent: orderData.totalAmount }) 
            .set({ updatedAt: new Date().toISOString() })
            .commit({ autoGenerateArrayKeys: true });

        return orderDoc;
    } catch (error) {
        console.error('Error creating order:', error);
        if (error instanceof Error) throw new Error(`Failed to create order: ${error.message}`);
        throw new Error('An unknown error occurred while creating the order.');
    }
}

// restoreStock function remains as is, as it's called by a Studio action
// and correctly calls the /api/manage-stock route.
export async function restoreStock(orderId: string) {
    // ... (keep existing implementation, ensure NEXT_PUBLIC_APP_URL is correctly set for this call from a server action)
    // You might want to add better logging or error handling here based on your needs.
    try {
        const order = await client.fetch(`*[_id == $id][0]{_id, items[]{product->{_id}, quantity}}`, { id: orderId });
        if (!order || !order.items) throw new Error(`Order or items not found for ID: ${orderId}`);

        const productIds = order.items.map((item: OrderItem) => item.product?._id).filter(Boolean);
        const quantities = order.items.map((item: OrderItem) => item.quantity).filter(Boolean);

        if (productIds.length === 0) return { success: true, message: "No products to restore."};

        const appURL = process.env.NEXT_PUBLIC_APP_URL;
        if (!appURL) {
            console.error("restoreStock: NEXT_PUBLIC_APP_URL is not defined.");
            throw new Error("Application URL is not configured for stock restoration.");
        }

        const stockResponse = await fetch(`${appURL}/api/manage-stock`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIds, quantities, action: 'increment' }),
        });
        const responseData = await stockResponse.json() as ApiResponse;
        if (!stockResponse.ok) throw new Error(responseData.message || 'Failed to restore stock via API');
        
        console.log('Stock restored successfully for order:', orderId, responseData);
        return { success: true, data: responseData };
    } catch (error) {
        console.error('Error in restoreStock:', error);
        if (error instanceof Error) return { success: false, message: error.message };
        return { success: false, message: 'Unknown error during stock restoration.' };
    }
}