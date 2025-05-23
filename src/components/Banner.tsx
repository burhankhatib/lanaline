'use client'

import React from 'react'
import Image from 'next/image'
import { BannerType } from '../../sanity.types'
import { urlFor } from '@/sanity/lib/image'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/language'

export default function Banner({ banners }: { banners: BannerType[] }) {
    const router = useRouter()
    const { currentLanguage } = useLanguage()
    console.log("🚀 ~ Banner ~ banners:", banners)
    return (
        <div className="relative w-full h-full min-h-[600px] flex items-center justify-center mb-20 bg-primary">
            {banners.map((banner) => (
                <div key={banner._id} className="relative w-full h-full min-h-[600px]">
                    {/* Mobile Image */}
                    {banner.mobileImage && (
                        <div className="md:hidden">
                            <div className="absolute bottom-0 z-10 flex flex-col items-center justify-center w-full p-4 mx-auto font-bold text-center text-white">
                                <h1 className="text-4xl font-light leading-relaxed uppercase cursor-pointer text-primary" onClick={() => router.push(banner.link?.en || '')}>{currentLanguage.code === 'en' ? banner.title?.en : banner.title?.ar}</h1>
                                <span className="text-lg font-light text-white">{currentLanguage.code === 'en' ? banner.description?.en : banner.description?.ar}</span>

                            </div>
                            <Image
                                src={urlFor(banner.mobileImage).url() || '/no-image.webp'}
                                alt={banner.title?.en || ''}
                                width={750}
                                height={1000}
                                className="w-full h-auto"
                                priority
                            />
                        </div>
                    )}
                    {/* Desktop Image */}
                    {banner.desktopImage && (
                        <div className="hidden md:block">
                            <div className="absolute z-10 flex flex-col items-center justify-center w-full mx-auto font-bold text-center text-white bottom-20">
                                <h1 className="py-0 my-0 font-light leading-relaxed uppercase cursor-pointer text-primary text-7xl" onClick={() => router.push(banner.link?.en || '')}>
                                    {currentLanguage.code === 'en' ? banner.title?.en : banner.title?.ar}</h1>
                                <span className="py-0 my-0 text-2xl text-white font-extralight">{currentLanguage.code === 'en' ? banner.description?.en : banner.description?.ar}</span>
                                <Button
                                    variant="default"
                                    size="lg"
                                    className="my-4 cursor-pointer"
                                    onClick={() => router.push(banner.link?.en || '')}
                                >
                                    {currentLanguage.code === 'en' ? 'Learn More' : 'اقرأ المزيد'}
                                </Button>
                            </div>
                            <Image
                                src={urlFor(banner.desktopImage).url() || '/no-image.webp'}
                                alt={banner.title?.en || ''}
                                width={1920}
                                height={600}
                                className="w-full h-auto"
                                priority
                            />
                        </div>
                    )}
                </div>
            ))}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-black" />
        </div>
    )
}
