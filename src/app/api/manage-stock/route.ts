// src/app/api/manage-stock/route.ts
import { NextResponse } from 'next/server';
import { createClient, SanityClient } from '@sanity/client';

interface StockUpdateRequest {
  productIds: string[];
  quantities: number[];
  action: 'decrement' | 'increment';
}

interface UpdatedDocDetail {
  id: string;
  operation: string;
}

interface SanityError {
  statusCode?: number;
  response?: {
    body?: {
      message?: string;
    };
  };
  message?: string;
}

// Use a server-only token. THIS IS CRITICAL FOR SECURITY.
const sanityToken = process.env.SANITY_API_WRITE_TOKEN;

if (!sanityToken) {
  console.error(
    "CRITICAL: SANITY_API_WRITE_TOKEN is not defined in environment variables for the manage-stock API route. Stock updates will fail."
  );
}

const sanityClient: SanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-05-23', // Use a current UTC date string
  token: sanityToken, // USE THE SERVER-ONLY TOKEN HERE
  useCdn: false,
});

export async function POST(request: Request): Promise<NextResponse> {
  if (!sanityToken) {
    // This check ensures that if the token is missing, the API doesn't proceed.
    return NextResponse.json(
      { message: 'Configuration error: API token is missing for stock management.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json() as StockUpdateRequest;
    const { productIds, quantities, action } = body;

    if (!Array.isArray(productIds) || !Array.isArray(quantities) || productIds.length !== quantities.length) {
      return NextResponse.json({ message: 'Invalid productIds or quantities. They must be arrays of the same length.' }, { status: 400 });
    }

    if (!['decrement', 'increment'].includes(action)) {
      return NextResponse.json({ message: 'Invalid action. Must be "decrement" or "increment".' }, { status: 400 });
    }

    const transaction = sanityClient.transaction();

    for (let i = 0; i < productIds.length; i++) {
        const productId = productIds[i];
        const quantity = quantities[i];

        if (!productId || typeof quantity !== 'number' || quantity <= 0) {
            return NextResponse.json({ message: `Invalid productId or quantity for item at index ${i}.` }, { status: 400 });
        }

        if (action === 'decrement') {
            const product = await sanityClient.getDocument(productId);
            if (!product) {
                return NextResponse.json({ message: `Product with ID ${productId} not found.` }, { status: 404 });
            }
            // Ensure product.stock is treated as a number, defaulting to 0 if undefined or null
            const currentStock = typeof product.stock === 'number' ? product.stock : 0;
            const productName = (product as { title?: { en?: string }, name?: string }).title?.en || (product as { title?: { en?: string }, name?: string }).name || productId; // Attempt to get a product name for error message
            if (currentStock < quantity) {
                return NextResponse.json({ message: `Insufficient stock for product: ${productName}. Available: ${currentStock}, Requested: ${quantity}` }, { status: 400 });
            }
            transaction.patch(productId, (p) => p.dec({ stock: quantity }));
        } else if (action === 'increment') {
            transaction.patch(productId, (p) => p.inc({ stock: quantity }));
        }
    }

    const result = await transaction.commit({ returnDocuments: false });
    const updatedDocDetails: UpdatedDocDetail[] = result && result.results ? result.results.map(r => ({ id: r.id, operation: r.operation })) : [];

    return NextResponse.json({ message: `Stock ${action}ed successfully for ${productIds.length} products.`, details: updatedDocDetails }, { status: 200 });

  } catch (error: unknown) {
    console.error('Error updating stock:', error);
    const sanityError = error as SanityError;
    if (sanityError.statusCode === 409 || (sanityError.response?.body?.message?.includes("Cannot decrement"))) {
        return NextResponse.json({ message: 'Insufficient stock to perform decrement. The operation failed due to stock constraints.' }, { status: 400 });
    }
    const errorMessage = sanityError.message || 'Unknown error updating stock.';
    return NextResponse.json({ message: 'Error updating stock.', error: errorMessage }, { status: 500 });
  }
}