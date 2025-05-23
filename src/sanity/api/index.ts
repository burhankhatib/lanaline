import { createApi } from 'sanity-plugin-utils'
import toastHandler from './toast'

export const api = createApi({
  routes: [
    {
      path: '/toast',
      method: 'POST',
      handler: toastHandler
    }
  ]
}) 