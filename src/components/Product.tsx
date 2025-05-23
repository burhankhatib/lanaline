'use client';

import { useLanguage } from '@/context/language';
import { useCart } from '@/context/cart';
// import { PortableText } from '@portabletext/react';
import Image from 'next/image';
import { format } from 'date-fns';
import { ALL_PRODUCTS_QUERYResult, Slug } from '../../sanity.types';
import { urlFor } from '@/sanity/lib/image';
import { Button } from './ui/button';

type CategoryReference = {
    _ref: string;
    _type: 'reference';
    _weak: boolean | null;
    _key: string;
    title: null;
}

type ExpandedCategory = {
    _id: string;
    _type: 'category' | 'categoryAr';
    _createdAt: string;
    _updatedAt: string;
    _rev: string;
    title?: string;
    image: string | null;
    slug?: Slug;
    description?: string;
}

type Category = CategoryReference | ExpandedCategory;

export default function Product({ product }: { product: ALL_PRODUCTS_QUERYResult[0] }) {
    const { currentLanguage } = useLanguage();
    const { addToCart } = useCart();
    const isRTL = currentLanguage.direction === 'rtl';

    // Calculate the final price considering special price and global discount
    const getFinalPrice = () => {
        // If there's a special price, use it
        if (product.specialPrice?.price && product.specialPrice.price > 0) {
            return product.specialPrice.price;
        }

        // If there's a global discount, apply it to the regular price
        if (product.globalDiscount && product.globalDiscount > 0 && product.regularPrice) {
            const discountAmount = product.regularPrice * (product.globalDiscount / 100);
            return product.regularPrice - discountAmount;
        }

        // Return regular price if it exists, otherwise return 0
        return product.regularPrice || 0;
    };

    const finalPrice = getFinalPrice();
    const isDiscounted = (product.specialPrice?.price && product.specialPrice.price > 0) ||
        (product.globalDiscount && product.globalDiscount > 0);

    const getCategoryTitle = (category: Category) => {
        if ('_id' in category) {
            return category.title;
        }
        return category.title || category._ref;
    };

    return (
        <div className={`snap-center snap-always flex flex-col group w-72 mx-auto hover:scale-95 scale-none cursor-pointer transition-all overflow-hidden duration-300 shadow-lg rounded-2xl hover:shadow-sm ${isRTL ? 'text-right' : 'text-left'}`}>


            {/* Main Image */}
            {product.images && product.images[0] && (
                <div className="relative w-full overflow-hidden transition-all duration-1000 rounded-t-2xl aspect-square bg-gradient-to-t from-primary/0 to-primary/50 group-hover:from-primary/100 group-hover:to-primary/100">
                    <Image
                        src={urlFor(product.images[0]).url() || '/no-image.webp'}
                        alt={currentLanguage.code === 'en' ? product.title?.en || '' : product.title?.ar || ''}
                        fill
                        className="object-cover rounded-lg group-hover:scale-105 transition-all duration-300 group-hover:translate-y-[-10px]"
                    />
                </div>
            )}
            {/* Title */}
            <h2 className="px-4 py-2 text-2xl font-bold">
                {currentLanguage.code === 'en' ? product.title?.en : product.title?.ar}
            </h2>
            {/* Description */}
            {/* <div className="prose max-w-none">
                <PortableText
                    value={currentLanguage.code === 'en' ? product.body?.en || [] : product.body?.ar || []}
                />
            </div> */}

            {/* Categories */}
            <div className="flex flex-wrap gap-2 px-4 py-2">
                {currentLanguage.code === 'ar'
                    ? product.categoryAr?.map((category, index) => (
                        <span key={index} className="px-2 py-1 text-sm bg-gray-100 rounded">
                            {getCategoryTitle(category)}
                        </span>
                    ))
                    : product.category?.map((category, index) => (
                        <span key={index} className="px-2 py-1 text-sm bg-gray-100 rounded">
                            {getCategoryTitle(category)}
                        </span>
                    ))}
            </div>

            {/* Price Section */}
            <div className="flex flex-col gap-2 px-4 py-2">
                {isDiscounted && (
                    <span className="text-gray-500 line-through">
                        {currentLanguage.currency} {product.regularPrice}
                    </span>
                )}
                <span className="text-2xl font-bold text-primary">
                    {currentLanguage.currency} {finalPrice}
                </span>
                {product.specialPrice?.endDate && (
                    <span className="text-sm text-gray-600">
                        {currentLanguage.code === 'en' ? 'Offer ends: ' : 'ينتهي العرض: '}
                        {format(new Date(product.specialPrice.endDate), 'PP')}
                    </span>
                )}
            </div>
            <div className="flex justify-center w-full px-4 py-2">
                <Button
                    className='w-full cursor-pointer'
                    onClick={() => addToCart(product)}
                >
                    {currentLanguage.code === 'en' ? 'Add to Cart' : 'إضافة إلى السلة'}
                </Button>
            </div>
        </div>
    );
}
