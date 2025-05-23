import { createClient } from 'next-sanity'

const token = process.env.SANITY_WRITE_TOKEN
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

console.log('Sanity token configuration:', {
  hasToken: !!token,
  projectId,
  dataset,
  apiVersion: '2024-07-11',
})

export const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-07-11',
  useCdn: false,
  token,
  perspective: 'published',
  stega: {
    enabled: false,
    studioUrl: process.env.NEXT_PUBLIC_VERCEL_URL
      ? `${process.env.NEXT_PUBLIC_VERCEL_URL}/studio`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/studio`,
  },
})
