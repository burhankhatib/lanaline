import { defineQuery } from 'next-sanity'
import { sanityFetch } from '../live'

export const getAllProducts = async () => {
    const ALL_PRODUCTS_QUERY = defineQuery(`
        *[_type == "product"] 
        | order(title asc)
        {
            ...,
            _key,
            category[]->{
                ...,
                "image": image.asset->url
            },
            "categoryAr": categoryAr[]->{
                ...,
                "image": image.asset->url
            }
           
        }
        `)
    
    try {
        const products = await sanityFetch({
            query: ALL_PRODUCTS_QUERY,
        });

        return products.data || [];
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}