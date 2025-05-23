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

const sanityClient: SanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-05-23', // Use a current UTC date string
  token: process.env.NEXT_PUBLIC_SANITY_WRITE_TOKEN,
  useCdn: false,
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json() as StockUpdateRequest;
    const { productIds, quantities, action } = body;
    // productIds and quantities should be arrays of the same length for multiple items in an order

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
            // Pre-check stock (important for immediate feedback)
            const product = await sanityClient.getDocument(productId);
            if (!product) {
                return NextResponse.json({ message: `Product with ID ${productId} not found.` }, { status: 404 });
            }
            if (product.stock < quantity) {
                return NextResponse.json({ message: `Insufficient stock for product: ${product.name || productId}. Available: ${product.stock}, Requested: ${quantity}` }, { status: 400 });
            }
            transaction.patch(productId, (p) => p.dec({ stock: quantity }));
        } else if (action === 'increment') {
            transaction.patch(productId, (p) => p.inc({ stock: quantity }));
        }
    }

    const result = await transaction.commit({ returnDocuments: false }); // returnDocuments: false for less data transfer
    const updatedDocDetails: UpdatedDocDetail[] = result && result.results ? result.results.map(r => ({ id: r.id, operation: r.operation })) : [];

    return NextResponse.json({ message: `Stock ${action}ed successfully for ${productIds.length} products.`, details: updatedDocDetails }, { status: 200 });

  } catch (error: unknown) {
    console.error('Error updating stock:', error);
    const sanityError = error as SanityError;
    // Check if the error is from Sanity due to validation (e.g., stock going below 0)
    if (sanityError.statusCode === 409 || (sanityError.response?.body?.message?.includes("Cannot decrement"))) {
        return NextResponse.json({ message: 'Insufficient stock to perform decrement for one or more items. The operation failed due to stock constraints.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error updating stock.', error: sanityError.message }, { status: 500 });
  }
} 