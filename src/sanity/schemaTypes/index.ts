import { type SchemaTypeDefinition } from 'sanity'

import {blockContentType} from './blockContentType'
import {categoryType} from './categoryType'
import {categoryTypeAr} from './categoryTypeAr'
import {postType} from './postType'
import {authorType} from './authorType'
import {product} from './product'
import {bannerType} from './bannerType'
import { user } from './user'
import { checkout } from './checkout'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContentType,
    categoryType,
    categoryTypeAr,
    postType,
    authorType,
    product,
    bannerType,
    user,
    checkout
  ],
}
