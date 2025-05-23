'use client'

import React, { useState, useEffect } from 'react'
import { useCart } from '@/context/cart'
import { useLanguage } from '@/context/language'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ALL_PRODUCTS_QUERYResult } from '../../../../sanity.types'
import { useToast } from '@/hooks/use-toast'
import { createOrder } from '@/app/actions/order'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { getUserByClerkId } from '@/app/actions/user'

interface UserFormData {
    firstName: string
    lastName: string
    email: string
    phone: string
    street: string
    city: string
    state: string
    postalCode: string
    country: string
    paymentMethod: string
}

export default function CheckoutPage() {
    const { items, clearCart } = useCart()
    const { currentLanguage } = useLanguage()
    const { toast } = useToast()
    const { user } = useUser()
    const router = useRouter()
    const [isOrderSuccess, setIsOrderSuccess] = useState(false)
    const [formData, setFormData] = useState<UserFormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        paymentMethod: '',
    })

    // Generate a random key for the order
    const generateKey = () => {
        return Math.random().toString(36).substring(7)
    }

    // Fetch user data when component mounts
    useEffect(() => {
        async function fetchUserData() {
            if (!user) return

            try {
                const userData = await getUserByClerkId(user.id)
                if (userData) {
                    setFormData({
                        firstName: userData.firstName || '',
                        lastName: userData.lastName || '',
                        email: userData.email || '',
                        phone: userData.phone || '',
                        street: userData.address?.street || '',
                        city: userData.address?.city || '',
                        state: userData.address?.state || '',
                        postalCode: userData.address?.postalCode || '',
                        country: userData.address?.country || '',
                        paymentMethod: '',
                    })
                }
            } catch (error) {
                console.error('Error fetching user data:', error)
            }
        }

        fetchUserData()
    }, [user])

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target as unknown as { name: string; value: string }
        setFormData(prev => ({
            ...prev,
            [target.name]: target.value
        }))
    }

    const handlePaymentMethodChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            paymentMethod: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user) {
            toast({
                variant: "destructive",
                title: currentLanguage.code === 'en' ? 'Authentication Required' : 'مطلوب تسجيل الدخول',
                description: currentLanguage.code === 'en'
                    ? 'Please sign in to complete your order.'
                    : 'يرجى تسجيل الدخول لإكمال طلبك.',
            })
            return
        }

        try {
            // Prepare order data
            const orderData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                items: items.map(item => ({
                    product: {
                        _id: item.product._id,
                        _type: item.product._type,
                        sku: item.product.sku || Math.random().toString(36).substring(7)
                    },
                    quantity: item.quantity,
                    price: getFinalPrice(item.product),
                    _key: Math.random().toString(36).substring(7),
                })),
                totalAmount: total,
                shippingAddress: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    postalCode: formData.postalCode,
                    country: formData.country
                },
                paymentMethod: formData.paymentMethod,
                userId: user.id,
                stock: items.reduce((sum, item) => sum + (item.product.stock || 0), 0)
            }

            // Create order using server action
            await createOrder(orderData)

            // If we get here, the order was created successfully
            // Show success message and clear cart
            toast({
                title: currentLanguage.code === 'en' ? 'Order Placed Successfully!' : 'تم تقديم الطلب بنجاح!',
                description: currentLanguage.code === 'en'
                    ? 'Thank you for your purchase. We will process your order shortly.'
                    : 'شكراً لشرائك. سنقوم بمعالجة طلبك قريباً.',
            })

            clearCart()
            setIsOrderSuccess(true)
        } catch (error) {
            console.error('Error creating order:', error)
            toast({
                variant: "destructive",
                title: currentLanguage.code === 'en' ? 'Error' : 'خطأ',
                description: currentLanguage.code === 'en'
                    ? 'There was an error processing your order. Please try again.'
                    : 'حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.',
            })
        }
    }

    if (isOrderSuccess) {
        const firstName = formData.firstName
        return (
            <div className="container max-w-md flex flex-col items-center justify-center min-h-[60vh] mx-auto text-center">
                <div className="mb-6 text-6xl">🎉</div>
                <h1 className="mb-4 text-3xl font-bold text-primary">
                    {currentLanguage.code === 'en'
                        ? `Thank you, ${firstName}!`
                        : `شكراً لك، ${firstName}!`}
                </h1>
                <p className="mb-6 text-lg text-gray-600">
                    {currentLanguage.code === 'en'
                        ? 'Your order has been successfully placed. We will send you an email confirmation shortly.'
                        : 'تم تقديم طلبك بنجاح. سنرسل لك تأكيداً بالبريد الإلكتروني قريباً.'}
                </p>
                <Button
                    onClick={() => router.push('/')}
                    className="mt-4"
                >
                    {currentLanguage.code === 'en' ? 'Continue Shopping' : 'متابعة التسوق'}
                </Button>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="container max-w-md flex flex-col items-center justify-center min-h-[60vh] mx-auto">
                <h1 className="mb-4 text-2xl font-bold">
                    {currentLanguage.code === 'en' ? 'Your cart is empty' : 'سلة المشتريات فارغة'}
                </h1>
                <Button
                    onClick={() => router.back()}
                    className="mt-4"
                >
                    {currentLanguage.code === 'en' ? 'Continue Shopping' : 'متابعة التسوق'}
                </Button>
            </div>
        )
    }

    return (
        <div className="container max-w-6xl p-4 mx-auto">
            <h1 className="mb-8 text-2xl font-bold text-center sm:text-3xl">
                {currentLanguage.code === 'en' ? 'Checkout' : 'إتمام الطلب'}
            </h1>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Order Summary */}
                <div className="p-6 bg-white shadow-sm rounded-xl">
                    <h2 className="mb-4 text-xl font-semibold">
                        {currentLanguage.code === 'en' ? 'Order Summary' : 'ملخص الطلب'}
                    </h2>
                    <div className="space-y-4">
                        {items.map((item) => {
                            const finalPrice = getFinalPrice(item.product)
                            return (
                                <div key={item.product._id} className="flex gap-4">
                                    {item.product.images && item.product.images[0] && (
                                        <div className="relative flex-shrink-0 w-20 h-20 overflow-hidden rounded-lg">
                                            <Image
                                                src={urlFor(item.product.images[0]).url()}
                                                alt={currentLanguage.code === 'en' ? item.product.title?.en || '' : item.product.title?.ar || ''}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-medium">
                                            {currentLanguage.code === 'en' ? item.product.title?.en : item.product.title?.ar}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {currentLanguage.code === 'en' ? 'Quantity' : 'الكمية'}: {item.quantity}
                                        </p>
                                        <p className="font-medium text-primary">
                                            {currentLanguage.currency} {finalPrice}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                        <div className="pt-4 mt-4 border-t">
                            <div className="flex justify-between text-lg font-semibold">
                                <span>{currentLanguage.code === 'en' ? 'Total' : 'المجموع'}</span>
                                <span>{currentLanguage.currency} {total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Checkout Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white shadow-sm rounded-xl">
                    <h2 className="mb-4 text-xl font-semibold">
                        {currentLanguage.code === 'en' ? 'Shipping Information' : 'معلومات الشحن'}
                    </h2>

                    <div className="space-y-4">
                        <input type="hidden" name="sku" value={generateKey()} />
                        <div>
                            <Label htmlFor="firstName">
                                {currentLanguage.code === 'en' ? 'First Name' : 'الاسم الاول'}
                            </Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="lastName">
                                {currentLanguage.code === 'en' ? 'Last Name' : 'اسم العائلة'}
                            </Label>
                            <Input
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>



                        <div>
                            <Label htmlFor="email">
                                {currentLanguage.code === 'en' ? 'Email' : 'البريد الإلكتروني'}
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="phone">
                                {currentLanguage.code === 'en' ? 'Phone Number' : 'رقم الهاتف'}
                            </Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="street">
                                {currentLanguage.code === 'en' ? 'Street Address' : 'عنوان الشارع'}
                            </Label>
                            <Input
                                id="street"
                                name="street"
                                value={formData.street}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="city">
                                    {currentLanguage.code === 'en' ? 'City' : 'المدينة'}
                                </Label>
                                <Input
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="state">
                                    {currentLanguage.code === 'en' ? 'State/Province' : 'الولاية/المقاطعة'}
                                </Label>
                                <Input
                                    id="state"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="postalCode">
                                    {currentLanguage.code === 'en' ? 'Postal Code' : 'الرمز البريدي'}
                                </Label>
                                <Input
                                    id="postalCode"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="country">
                                    {currentLanguage.code === 'en' ? 'Country' : 'البلد'}
                                </Label>
                                <Input
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="paymentMethod">
                                {currentLanguage.code === 'en' ? 'Payment Method' : 'طريقة الدفع'}
                            </Label>
                            <Select
                                value={formData.paymentMethod}
                                onValueChange={handlePaymentMethodChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={currentLanguage.code === 'en' ? 'Select payment method' : 'اختر طريقة الدفع'} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash_on_delivery">
                                        {currentLanguage.code === 'en' ? 'Cash on Delivery' : 'الدفع عند الاستلام'}
                                    </SelectItem>
                                    <SelectItem value="credit_card">
                                        {currentLanguage.code === 'en' ? 'Credit Card' : 'بطاقة ائتمان'}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button type="submit" className="w-full">
                        {currentLanguage.code === 'en' ? 'Place Order' : 'تأكيد الطلب'}
                    </Button>
                </form>
            </div>
        </div>
    )
} 