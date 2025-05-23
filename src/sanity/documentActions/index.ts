// src/sanity/documentActions.ts
import { DocumentActionsContext, DocumentActionComponent } from 'sanity'
import { ConfirmOrderAndDecrementStockAction } from '../actions/confirmOrderAndDecrementStockAction' // Make sure path and name are correct
import { updateOrderStatus } from '../actions/updateOrderStatus';

export const documentActions = (prev: DocumentActionComponent[], context: DocumentActionsContext): DocumentActionComponent[] => {
  const { schemaType } = context;

  if (schemaType === 'checkout') {
    // Filter out the default publish action if you want to control publishing through custom actions
    const filteredPrev = prev.filter(
      (action) => {
        // The action component itself might be the function, or it might be an object with a 'name' property.
        // Sanity's internal actions might not have an easily inspectable 'name' string in all cases.
        // A common way to identify the default publish action is by its behavior or if it's the only one left after removing others.
        // For more robust filtering, you might need to inspect the action objects more deeply if Sanity provides a stable way.
        // As a simpler approach, if you know the specific names or types of actions you want to remove/replace:
        if (typeof action === 'function' && action.name === 'PublishAction') return false; // Example
        if (typeof action === 'object' && (action as { action?: string }).action === 'publish') return false; // Example

        return true;
      }
    );

    return [
      ConfirmOrderAndDecrementStockAction,
      updateOrderStatus, // This handles cancellations/refunds (stock increment)
      ...filteredPrev, // Add back other actions like delete, duplicate, etc.
    ];
  }

  return prev;
};