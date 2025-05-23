// src/sanity/documentActions.ts
import { DocumentActionsContext, DocumentActionComponent } from 'sanity'
import { ProcessOrderAndDecrementStockAction } from '../actions/processOrderAndDecrementStockAction' // Updated name
import { updateOrderStatus } from '../actions/updateOrderStatus'; // Keep this for cancellations/refunds

export const documentActions = (
    prev: DocumentActionComponent[], 
    context: DocumentActionsContext
): DocumentActionComponent[] => {
  const { schemaType } = context;

  if (schemaType === 'checkout') {
    // Filter out default actions like 'publish' if you want full control
    const filteredPrev = prev.filter(
      (DefaultAction) => {
        const actionName = (DefaultAction as { name?: string }).name || (typeof DefaultAction === 'function' ? DefaultAction.name : null);
        return actionName !== 'PublishAction'; // Example: Remove default publish
      }
    );
    
    return [
      ProcessOrderAndDecrementStockAction, // For 'pending' -> 'processing' + stock decrement
      updateOrderStatus,                  // For handling status changes like 'cancelled'/'refunded' + stock increment
      ...filteredPrev,
    ];
  }

  return prev;
};