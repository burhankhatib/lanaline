import { defineField, defineType } from 'sanity'
import { ArrayOfObjectsInputProps } from 'sanity'

interface ReferenceItem {
    _key?: string
    _type?: string
    _ref?: string
    key?: string
}

export const user = defineType({
    name: 'user',
    title: 'User',
    type: 'document',
    preview: {
        select: {
            firstName: 'firstName',
            lastName: 'lastName',
            totalSpent: 'totalSpent',
            media: 'orders.0.items.0.product.images.0.asset'
        },
        prepare(selection) {
            const { firstName = '', lastName = '', totalSpent = 0, media } = selection
            const formattedTotal = typeof totalSpent === 'number' ? totalSpent.toFixed(2) : '0.00'
            return {
                title: `${firstName} ${lastName}`,
                subtitle: `Total Spent: AED${formattedTotal}`,
                media: media
            }
        }
    },
    fields: [
        defineField({
            name: 'userId',
            title: 'Clerk User ID',
            description: 'The unique identifier from Clerk authentication',
            type: 'string',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'firstName',
            title: 'First Name',
            type: 'string',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'lastName',
            title: 'Last Name',
            type: 'string',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'email',
            title: 'Email',
            type: 'string',
            validation: Rule => Rule.required().email()
        }),
        defineField({
            name: 'phone',
            title: 'Phone Number',
            type: 'string',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'address',
            title: 'Address',
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
            name: 'orders',
            title: 'Orders',
            type: 'array',
            of: [{
                type: 'reference',
                to: [{ type: 'checkout' }],
                options: {
                    disableNew: true
                }
            }],
            options: {
                layout: 'grid'
            },
            validation: Rule => Rule.unique(),
            initialValue: () => [],
            components: {
                input: (props: ArrayOfObjectsInputProps) => {
                    if (!props.value) return props.renderDefault(props)
                    
                    // Ensure each item has a unique _key
                    const items = props.value.map((item: ReferenceItem) => ({
                        _type: 'reference',
                        _ref: item._ref,
                        _key: item._key || Math.random().toString(36).substring(7)
                    }))
                    
                    return props.renderDefault({ ...props, value: items })
                }
            }
        }),
        defineField({
            name: 'totalSpent',
            title: 'Total Amount Spent',
            type: 'number',
            readOnly: true,
            initialValue: 0,
            validation: Rule => Rule.custom(async (value, context) => {
                const orders = (context.document?.orders || []) as Array<{ _ref: string; status?: string }>
                
                // Get all order references
                const orderRefs = orders.map(order => order._ref)
                
                // Fetch all orders in parallel
                const orderDocs = await Promise.all(
                    orderRefs.map(ref => context.getClient({apiVersion: '2024-03-19'}).fetch(`*[_id == $ref][0]`, { ref }))
                )
                
                // Calculate total from fetched orders
                const total = orderDocs.reduce((sum: number, order) => {
                    if (order?.status === 'cancelled') return sum
                    return sum + (order?.amount || 0)
                }, 0)
                
                if (value !== total) {
                    return `Total must be ${total} (sum of non-cancelled orders)`
                }
                return true
            })
        }),
        defineField({
            name: 'country',
            title: 'Country',
            type: 'string',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'currency',
            title: 'Currency',
            type: 'string',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'createdAt',
            title: 'Created At',
            type: 'datetime',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'updatedAt',
            title: 'Updated At',
            type: 'datetime',
            validation: Rule => Rule.required()
        }),
      
    ]
}) 