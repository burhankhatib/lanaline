// src/app/actions/order.ts
'use server'

import { client } from '@/sanity/lib/client' // This client should be configured with a server-side write token
import { getUserByClerkId } from './user'
// restoreStock function will remain, as it's used by Studio actions to call the API

interface OrderItemProduct {
    _id: string;
    _type: string;
    sku?: string;
    // stock?: number; // Not needed here, current stock is on the product doc
    _ref?: string; // If only sending ref
    // Add any other product details you want to store on the line item itself
    name?: string; // Example: Store product name at time of order
}

interface OrderItem {
    product: OrderItemProduct;
    quantity: number;
    price: number; // Price at the time of purchase
    _key: string;
}

interface ShippingAddress {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

interface OrderData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    items: OrderItem[];
    totalAmount: number;
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    userId: string; // Clerk user ID
}

interface StockApiResponse {
    message: string;
    details?: Array<{ id: string; operation: string }>;
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
                address: orderData.shippingAddress, // Full address object for user profile
                country: orderData.shippingAddress.country,
                currency: 'AED', // Consider making this dynamic
                orders: [],
                totalSpent: 0, // Initialize totalSpent
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }

        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // STOCK DECREMENT IS REMOVED FROM HERE.
        // It will be handled by a Sanity Document Action in the Studio.

        const orderDoc = await client.create({
            _type: 'checkout',
            orderNumber,
            user: {
                _type: 'reference',
                _ref: userDoc._id
            },
            items: orderData.items.map((item) => ({
                _key: item._key || Math.random().toString(36).substring(7),
                product: {
                    _type: 'reference',
                    _ref: item.product._id
                },
                quantity: item.quantity,
                price: item.price, // Price at time of purchase
                // Storing SKU and name on the line item can be useful for historical data
                sku: item.product.sku || `SKU_FOR_${item.product._id.substring(0,5)}`,
                // You might want to pass product name in orderData.items[n].product.name
                // name: item.product.name || `Product ${item.product._id.substring(0,5)}`, 
            })),
            totalAmount: orderData.totalAmount,
            status: 'pending', // Initial status, to be updated in Studio
            shippingAddress: orderData.shippingAddress,
            paymentMethod: orderData.paymentMethod,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        // Update user with new order reference.
        // Total spent should ideally be updated when payment is confirmed/order shipped.
        await client
            .patch(userDoc._id)
            .setIfMissing({ orders: [] })
            .append('orders', [{ 
                _type: 'reference', 
                _ref: orderDoc._id,
                _key: Math.random().toString(36).substring(7)
            }])
            // .inc({ totalSpent: orderData.totalAmount }) // Consider moving this logic
            .set({ updatedAt: new Date().toISOString() })
            .commit({ autoGenerateArrayKeys: true }); // autoGenerateArrayKeys is useful here

        return orderDoc;
    } catch (error) {
        console.error('Error creating order:', error);
        if (error instanceof Error) {
          throw new Error(`Failed to create order: ${error.message}`);
        }
        throw new Error('An unknown error occurred while creating the order.');
    }
}

// restoreStock function (used for cancellations/refunds from Studio)
export async function restoreStock(orderId: string) {
    try {
        console.log('Restore Stock Action - Starting stock restoration for order:', orderId);
        
        // Fetch only necessary fields. Ensure product references are included.
        const order = await client.fetch<{
            _id: string;
            items?: Array<{ product?: { _ref: string }; quantity: number }>;
          }>(`*[_id == $id][0]{_id, items[]{product{_ref}, quantity}}`, { id: orderId });
        
        if (!order) {
            console.error('Restore Stock Action - Order not found:', orderId);
            throw new Error(`Order not found: ${orderId}`);
        }

        const items = order.items || [];
        if (items.length === 0) {
            console.warn('Restore Stock Action - No items found in order to restore stock.');
            return { success: true, message: 'No items to restore stock for.' };
        }

        const productIds = items
            .map(item => item.product?._ref)
            .filter((ref): ref is string => !!ref);
        const quantities = items
            .filter(item => !!item.product?._ref)
            .map(item => item.quantity || 1);

        if (productIds.length === 0) {
            console.warn('Restore Stock Action - No valid product references found in items.');
            return { success: true, message: 'No valid product references to restore stock for.' };
        }
        
        const apiRouteUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/manage-stock`;
        if (!process.env.NEXT_PUBLIC_APP_URL) {
            console.warn("NEXT_PUBLIC_APP_URL is not set for restoreStock. API call might fail if the Studio is on a different domain or port during development.");
        }

        const stockResponse = await fetch(apiRouteUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                 // Add any necessary auth headers if your API is secured
            },
            body: JSON.stringify({
                productIds,
                quantities,
                action: 'increment'
            })
        });

        const responseData = await stockResponse.json() as StockApiResponse;
        if (!stockResponse.ok) {
            console.error('Failed to restore stock via API:', responseData.message);
            throw new Error(`Failed to restore stock: ${responseData.message || `HTTP ${stockResponse.status}`}`);
        }

        console.log('Restore Stock Action - Successfully called stock increment API', responseData);
        return { success: true, data: responseData };
    } catch (error) {
        console.error('Restore Stock Action - Error:', error);
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: 'Unknown error during stock restoration.' };
    }
}