import { DocumentActionsContext, DocumentActionComponent } from 'sanity'
import { updateStock } from './actions/updateStock'

export const documentActions = (prev: DocumentActionComponent[], context: DocumentActionsContext) => {
  const { schemaType } = context

  if (schemaType === 'checkout') {
    return [...prev, updateStock]
  }

  return prev
} 