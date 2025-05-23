'use client'

/**
 * This configuration is used to for the Sanity Studio that's mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './src/sanity/env'
import {schema} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'
import {documentActions} from './src/sanity/documentActions' // Ensure this path is correct

// Get token from environment variables
const token = process.env.SANITY_WRITE_TOKEN || process.env.NEXT_PUBLIC_SANITY_WRITE_TOKEN

// Log configuration (without exposing the token)
console.log('Sanity Studio configuration:', {
  projectId,
  dataset,
  apiVersion,
  hasToken: !!token
})

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  plugins: [
    structureTool({structure}),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({defaultApiVersion: apiVersion}),
  ],
  document: {
    actions: documentActions // Make sure this is wired up
  },
  api: {
    projectId,
    dataset,
    apiVersion,
    useCdn: false, // Set to false to ensure we're always using the latest data
    token: process.env.SANITY_API_WRITE_TOKEN
  }
})
