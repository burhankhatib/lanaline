import { DocumentActionComponent } from 'sanity'
import { updateStock } from '../actions/updateStock'
import { updateOrderStatus } from '../actions/updateOrderStatus'

export const documentActions: DocumentActionComponent[] = [
  updateStock,
  updateOrderStatus
] 