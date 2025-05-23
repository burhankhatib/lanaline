import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Blog')
    .items([
      S.documentTypeListItem('post').title('Posts'),
      S.documentTypeListItem('product').title('Products'),
      S.documentTypeListItem('category').title('Categories'),
      S.documentTypeListItem('categoryAr').title('Categories Arabic'),
      S.documentTypeListItem('author').title('Authors'),
      S.documentTypeListItem('bannerType').title('Banners'),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && !['post', 'author', 'product', 'category', 'categoryAr', 'bannerType', 'bannerTypeAr'].includes(item.getId()!),
      ),
    ])
