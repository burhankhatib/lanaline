import { createClient } from '@sanity/client'

// Get environment variables
const token = process.env.SANITY_WRITE_TOKEN || process.env.NEXT_PUBLIC_SANITY_WRITE_TOKEN
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

// Log configuration (without exposing the token)
console.log('Sanity configuration:', {
  hasToken: !!token,
  projectId,
  dataset,
  apiVersion: '2024-03-19'
})

if (!token) {
  console.error('SANITY_WRITE_TOKEN is not set in environment variables')
  console.error('Please add SANITY_WRITE_TOKEN to your .env.local file')
  console.error('You can get your token from: https://www.sanity.io/manage/project/[your-project-id]/api')
}

if (!projectId) {
  console.error('NEXT_PUBLIC_SANITY_PROJECT_ID is not set in environment variables')
}

if (!dataset) {
  console.error('NEXT_PUBLIC_SANITY_DATASET is not set in environment variables')
}

// Create client with fallback values
export const studioClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-03-19',
  useCdn: true,
  token: process.env.NEXT_PUBLIC_SANITY_WRITE_TOKEN || '',
  perspective: 'published'
}) 