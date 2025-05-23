import { defineField, defineType } from 'sanity'
import { ArrayOfObjectsInputProps } from 'sanity'
import { PreviewValue } from 'sanity'

interface ReferenceItem {
    _key?: string
    _type?: string
    _ref?: string
    key?: string
    quantity?: number
}

export const checkout = defineType({
    name: 'checkout',
    title: 'Checkout',
    type: 'document',
    fields: [
        defineField({
            name: 'orderNumber',
            title: 'Order Number',
            type: 'string',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'user',
            title: 'User',
            type: 'reference',
            to: [{ type: 'user' }],
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'items',
            title: 'Order Items',
            type: 'array',
            of: [{
                type: 'object',
                fields: [
                    defineField({
                        name: 'sku',
                        title: 'SKU',
                        type: 'string',
                        validation: Rule => Rule.required().max(100)
                    }),
                    defineField({
                        name: 'key',
                        title: 'Key',
                        type: 'string',
                        validation: Rule => Rule.required().max(100)
                    }),
                    defineField({
                        name: 'product',
                        title: 'Product',
                        type: 'reference',
                        to: [{ type: 'product' }],
                        validation: Rule => Rule.required()
                    }),
                    {
                        name: 'quantity',
                        title: 'Quantity',
                        type: 'number',
                        validation: Rule => Rule.required().min(1)
                    },
                    {
                        name: 'price',
                        title: 'Price at Purchase',
                        type: 'number',
                        validation: Rule => Rule.required().min(0)
                    },
                  
                ]
            }],
            components: {
                input: (props: ArrayOfObjectsInputProps) => {
                    if (!props.value) return props.renderDefault(props)

                    const items = props.value.map((item: ReferenceItem) => ({
                        ...item,
                        quantity: item.quantity || 1,
                        _key: item._key || Math.random().toString(36).substring(7)
                    }))

                    return props.renderDefault({ ...props, value: items })
                }
            }
        }),
        defineField({
            name: 'totalAmount',
            title: 'Total Amount',
            type: 'number',
            validation: Rule => Rule.required().min(0)
        }),
        defineField({
            name: 'status',
            title: 'Order Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Pending', value: 'pending' },
                    { title: 'Processing', value: 'processing' },
                    { title: 'Shipped', value: 'shipped' },
                    { title: 'Delivered', value: 'delivered' },
                    { title: 'Cancelled', value: 'cancelled' }
                ]
            },
            initialValue: 'pending'
        }),
        defineField({
            name: 'shippingAddress',
            title: 'Shipping Address',
            type: 'object',
            fields: [
                {
                    name: 'street',
                    title: 'Street Address',
                    type: 'string',
                    validation: Rule => Rule.required()
                },
                {
                    name: 'city',
                    title: 'City',
                    type: 'string',
                    validation: Rule => Rule.required()
                },
                {
                    name: 'state',
                    title: 'State/Province',
                    type: 'string',
                    validation: Rule => Rule.required()
                },
                {
                    name: 'postalCode',
                    title: 'Postal Code',
                    type: 'string',
                    validation: Rule => Rule.required()
                },
                {
                    name: 'country',
                    title: 'Country',
                    type: 'string',
                    validation: Rule => Rule.required()
                }
            ]
        }),
        defineField({
            name: 'paymentMethod',
            title: 'Payment Method',
            type: 'string',
            options: {
                list: [
                    { title: 'Credit Card', value: 'credit_card' },
                    { title: 'PayPal', value: 'paypal' },
                    { title: 'Bank Transfer', value: 'bank_transfer' }
                ]
            }
        }),
        defineField({
            name: 'createdAt',
            title: 'Created At',
            type: 'datetime',
            initialValue: () => new Date().toISOString()
        }),
        defineField({
            name: 'updatedAt',
            title: 'Updated At',
            type: 'datetime',
            initialValue: () => new Date().toISOString()
        })
    ],
    preview: {
        select: {
            orderNumber: 'orderNumber',
            firstName: 'user.firstName',
            lastName: 'user.lastName',
            total: 'totalAmount',
            status: 'status',
            items: 'items',
            media: 'items.0.product.image'
        },
        prepare({
            orderNumber,
            firstName,
            lastName,
            total,
            status,
            items,
            media
        }: {
            orderNumber?: string;
            firstName?: string;
            lastName?: string;
            total?: number;
            status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
            items?: Array<{ quantity?: number }>;
            media?: PreviewValue['media'];
        }): PreviewValue {
            const itemCount = Array.isArray(items)
                ? items.map(item => item.quantity || 1).reduce((a, b) => (a || 0) + (b || 0), 0)
                : 0;

            const displayName = firstName && lastName ? `${firstName} ${lastName}` : 'Unknown User';
            const displayOrderNumber = orderNumber || 'Unknown Order';

            const statusEmoji = {
                cancelled: '🔴',
                delivered: '🟢',
                pending: '🟠',
                processing: '🔵',
                shipped: '📦'
            }[status || 'pending'] || '🟠';

            return {
                title: `${displayOrderNumber}`,
                subtitle: `${statusEmoji} ${displayName} - ${itemCount} items - AED${total || 0}`,
                media: media || undefined
            };
        }
    }
})
