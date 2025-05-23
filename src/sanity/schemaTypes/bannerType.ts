import { defineField, defineType } from 'sanity'

export const bannerType = defineType({
  name: 'bannerType',
  title: 'Banner',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'object',
      description: 'The title of the banner',
      fields: [
        defineField({
          name: 'en',
          title: 'English',
          type: 'string',
        }),
        defineField({
          name: 'ar',
          title: 'Arabic',
          type: 'string',
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'object',
      description: 'A brief description of the banner content',
      fields: [
        defineField({
          name: 'en',
          title: 'English',
          type: 'text',
        }),
        defineField({
          name: 'ar',
          title: 'Arabic',
          type: 'text',
        }),
      ],
    }),
    defineField({
      name: 'desktopImage',
      title: 'Desktop Image',
      type: 'image',
      description: 'Banner image for desktop/large screens (recommended size: 1920x600px)',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mobileImage',
      title: 'Mobile Image',
      type: 'image',
      description: 'Banner image for mobile/small screens (recommended size: 750x1000px)',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'object',
      description: 'URL where the banner should link to',
      fields: [
        defineField({
          name: 'en',
          title: 'English',
          type: 'string',
        }),
        defineField({
          name: 'ar',
          title: 'Arabic',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Whether this banner is currently active',
      initialValue: true,
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'datetime',
      description: 'When this banner should start being displayed',
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
      description: 'When this banner should stop being displayed',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'desktopImage',
    },
    prepare(selection) {
      const { title, media } = selection
      return {
        title: title.en,
        media: media,
      }
    },
  },
})
