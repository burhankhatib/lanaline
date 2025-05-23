import { DocumentActionsContext, DocumentActionComponent } from 'sanity'
import { ProcessOrderAndDecrementStockAction } from './actions/processOrderAndDecrementStockAction'

export const documentActions = (prev: DocumentActionComponent[], context: DocumentActionsContext) => {
  const { schemaType } = context

  if (schemaType === 'checkout') {
    return [...prev, ProcessOrderAndDecrementStockAction]
  }

  return prev
} 