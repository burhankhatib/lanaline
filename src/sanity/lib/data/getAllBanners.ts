import { defineQuery } from 'next-sanity'
import { sanityFetch } from '../live'

export const getAllBanners = async () => {
    const ALL_BANNERS_QUERY = defineQuery(`
        *[_type == "bannerType"] 
        | order(title asc)
        {
            ...,
        }
        `)
    
    try {
        console.log('Fetching banners...');
        const banners = await sanityFetch({
            query: ALL_BANNERS_QUERY,
        });
        console.log('Banners response:', banners);

        return banners.data || [];
    } catch (error) {
        console.error("Error fetching banners:", error);
        return [];
    }
}