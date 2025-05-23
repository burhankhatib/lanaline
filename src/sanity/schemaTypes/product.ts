import { defineField, defineType } from 'sanity'

export const product = defineType({
    name: 'product',
    title: 'Product',
    type: 'document',
    groups: [
        {
            name: 'basic',
            title: 'Basic Information',
            default: true
        },
        {
            name: 'content',
            title: 'Content & Media'
        },
        {
            name: 'pricing',
            title: 'Pricing & Stock'
        },
        {
            name: 'status',
            title: 'Status & Visibility'
        }
    ],
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'object',
            group: 'basic',
            fields: [
                {
                    name: 'en',
                    title: 'English',
                    type: 'string',
                    validation: Rule => Rule.required()
                },
                {
                    name: 'ar',
                    title: 'Arabic',
                    type: 'string',
                    validation: Rule => Rule.required()
                }
            ]
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            group: 'basic',
            options: {
                source: 'title.en',
                maxLength: 96
            },
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'sku',
            title: 'SKU',
            type: 'string',
            group: 'basic',
            validation: Rule => Rule.required().max(100)
        }),
        defineField({
            name: 'key',
            title: 'Key',
            type: 'string',
            group: 'basic',
            initialValue: ({ sku }) => sku,
            validation: Rule => Rule.required().max(100)
        }),
        defineField({
            name: 'category',
            title: 'Categories',
            type: 'array',
            group: 'basic',
            of: [{
                type: 'reference',
                to: [{ type: 'category' }]
            }],
            validation: Rule => Rule.required().min(1)
        }),
        defineField({
            name: 'categoryAr',
            title: 'Categories Arabic',
            type: 'array',
            group: 'basic',
            of: [{
                type: 'reference',
                to: [{ type: 'categoryAr' }]
            }]
        }),
        defineField({
            name: 'body',
            title: 'Description',
            type: 'object',
            group: 'content',
            fields: [
                {
                    name: 'en',
                    title: 'English',
                    type: 'blockContent',
                    validation: Rule => Rule.required()
                },
                {
                    name: 'ar',
                    title: 'Arabic',
                    type: 'blockContent',
                    validation: Rule => Rule.required()
                }
            ]
        }),
        defineField({
            name: 'images',
            title: 'Images',
            type: 'array',
            group: 'content',
            of: [{
                type: 'image',
                options: {
                    hotspot: true
                }
            }],
            validation: Rule => Rule.required().min(1)
        }),
        defineField({
            name: 'video',
            title: 'Video',
            type: 'file',
            group: 'content',
            options: {
                accept: 'video/*'
            },
            description: 'Upload a product video file'
        }),
        defineField({
            name: 'regularPrice',
            title: 'Regular Price',
            type: 'number',
            group: 'pricing',
            validation: Rule => Rule.required().min(0)
        }),
        defineField({
            name: 'globalDiscount',
            title: 'Global Discount',
            type: 'number',
            group: 'pricing',
            description: 'Global discount percentage (0-100)',
            validation: Rule => Rule.min(0).max(100)
        }),
        defineField({
            name: 'specialPrice',
            title: 'Special Price',
            type: 'object',
            group: 'pricing',
            fields: [
                {
                    name: 'price',
                    title: 'Price',
                    type: 'number',
                    validation: Rule => Rule.min(0)
                },
                {
                    name: 'startDate',
                    title: 'Start Date',
                    type: 'datetime'
                },
                {
                    name: 'endDate',
                    title: 'End Date',
                    type: 'datetime'
                }
            ]
        }),
        defineField({
            name: 'stock',
            title: 'Stock',
            type: 'number',
            group: 'pricing',
            initialValue: 0,
            validation: Rule => Rule.min(0).integer().error('Stock cannot be negative.') // Added validation
        }),
        defineField({
            name: 'isFeatured',
            title: 'Featured',
            type: 'boolean',
            group: 'status',
            initialValue: false
        }),
        defineField({
            name: 'isNew',
            title: 'New',
            type: 'boolean',
            group: 'status',
            initialValue: false
        }),
        defineField({
            name: 'isBestSeller',
            title: 'Best Seller',
            type: 'boolean',
            group: 'status',
            initialValue: false
        }),
        defineField({
            name: 'visibility',
            title: 'Visibility',
            type: 'string',
            group: 'status',
            options: {
                list: [
                    { title: 'Visible', value: 'visible' },
                    { title: 'Hidden', value: 'hidden' }
                ],
                layout: 'radio'
            },
            initialValue: 'visible'
        }),
    ],
    preview: {
        select: {
            title: 'title.en',
            price: 'regularPrice', 
            stock: 'stock',
            media: 'images.0.asset'
        },
        prepare({ title, price, stock, media }) {
            return {
                title: `${title}`,
                subtitle: `Price: ${price} - Stock: ${stock}`,
                media: media
            }
        }
    }
})
