'use client'

import React from 'react'
import { useCart } from '@/context/cart'
import { useLanguage } from '@/context/language'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { Button } from '@/components/ui/button'
import { ALL_PRODUCTS_QUERYResult } from '../../../../sanity.types'
import { FaMinus, FaPlus, FaRegTrashAlt } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

export default function CartPage() {
    const { items, updateQuantity } = useCart()
    const { currentLanguage } = useLanguage()
    const router = useRouter()

    // Calculate the final price for a product considering special price and global discount
    const getFinalPrice = (product: ALL_PRODUCTS_QUERYResult[0]) => {
        if (product.specialPrice?.price && product.specialPrice.price > 0) {
            return product.specialPrice.price
        }

        if (product.globalDiscount && product.globalDiscount > 0 && product.regularPrice) {
            const discountAmount = product.regularPrice * (product.globalDiscount / 100)
            return product.regularPrice - discountAmount
        }

        return product.regularPrice || 0
    }

    // Calculate total price for all items 
    const total = items.reduce((sum, item) => {
        const price = getFinalPrice(item.product)
        return sum + (price * item.quantity)
    }, 0)

    if (items.length === 0) {
        return (
            <div className="container max-w-md flex flex-col items-center justify-center min-h-[60vh] mx-auto">
                <h1 className="mb-4 text-2xl font-bold">
                    {currentLanguage.code === 'en' ? 'Your cart is empty' : 'سلة المشتريات فارغة'}
                </h1>
                <Button
                    onClick={() => router.push('/')}
                    className="mt-4"
                >
                    {currentLanguage.code === 'en' ? 'Continue Shopping' : 'متابعة التسوق'}
                </Button>
            </div>
        )
    }

    return (
        <div className="container max-w-4xl p-2 mx-auto sm:p-4">
            <h1 className="mb-8 text-2xl font-bold text-center sm:text-3xl">
                {currentLanguage.code === 'en' ? 'Shopping Cart' : 'سلة المشتريات'}
            </h1>

            <div className="grid gap-6">
                {items.map((item) => {
                    const finalPrice = getFinalPrice(item.product)
                    const isDiscounted = (item.product.specialPrice?.price && item.product.specialPrice.price > 0) ||
                        (item.product.globalDiscount && item.product.globalDiscount > 0)

                    return (
                        <div key={item.product._id} className="flex flex-row items-start gap-4 p-4 transition-shadow duration-200 bg-white shadow-sm sm:p-6 rounded-xl hover:shadow-md">
                            {/* Product Image */}
                            {item.product.images && item.product.images[0] && (
                                <div className="relative flex-shrink-0 w-20 h-20 overflow-hidden rounded-lg sm:w-32 sm:h-32">
                                    <Image
                                        src={urlFor(item.product.images[0]).url()}
                                        alt={currentLanguage.code === 'en' ? item.product.title?.en || '' : item.product.title?.ar || ''}
                                        fill
                                        className="object-cover transition-transform duration-200 hover:scale-105"
                                    />
                                </div>
                            )}

                            {/* Product Details and Controls */}
                            <div className="flex-1 w-full space-y-3">
                                {/* Product Title and Price */}
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">
                                        {currentLanguage.code === 'en' ? item.product.title?.en : item.product.title?.ar}
                                    </h3>

                                    {/* Price Display */}
                                    <div className="flex items-center gap-2">
                                        {isDiscounted && (
                                            <span className="text-sm text-gray-500 line-through">
                                                {currentLanguage.currency} {item.product.regularPrice}
                                            </span>
                                        )}
                                        <span className="text-lg font-bold text-primary">
                                            {currentLanguage.currency} {finalPrice}
                                        </span>
                                    </div>
                                </div>

                                {/* Quantity Controls and Remove Button */}
                                <div className="flex items-center justify-between">
                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-2 p-1 rounded-lg bg-gray-50">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                            className="w-8 h-8 hover:bg-gray-100"
                                        >
                                            {item.quantity > 1 ?
                                                <FaMinus className="w-4 h-4" />
                                                :
                                                <FaRegTrashAlt className="w-4 h-4 text-red-500" />
                                            }
                                        </Button>
                                        <span className="w-8 font-medium text-center">{item.quantity}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                            className="w-8 h-8 hover:bg-gray-100"
                                        >
                                            <FaPlus className="w-4 h-4" />
                                        </Button>
                                    </div>


                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Total and Checkout */}
            <div className="p-6 mt-8 bg-white shadow-sm rounded-xl">
                <div className="flex items-center justify-between mb-6">
                    <span className="text-lg font-semibold text-gray-900 sm:text-xl">
                        {currentLanguage.code === 'en' ? 'Total' : 'المجموع'}
                    </span>
                    <span className="text-xl font-bold sm:text-2xl text-primary">
                        {currentLanguage.currency} {total.toFixed(2)}
                    </span>
                </div>
                <Button
                    className="w-full h-12 text-lg font-semibold transition-colors duration-200 bg-primary hover:bg-primary/90"
                    onClick={() => router.push('/checkout')}
                >
                    {currentLanguage.code === 'en' ? 'Proceed to Checkout' : 'المتابعة إلى الدفع'}
                </Button>
            </div>
        </div>
    )
}
