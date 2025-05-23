'use client'
import React from 'react'
import { Button } from './ui/button'
import { useLanguage } from '@/context/language'


export default function TopMenu() {
    const { currentLanguage, setLanguage } = useLanguage()

    const getCurrentCurrency = () => {
        return currentLanguage.currency;
    };

    return (
        <>
            <div className='items-center justify-center hidden w-full h-12 p-4 md:flex md:justify-between bg-secondary text-primary'>
                <div className='hidden text-sm animate-pulse md:block'>
                    {
                        currentLanguage.code === 'ar' ? `إحصلي على توصيل مجاني اذا قمتي بشراء منتجات أكقر من 500 ${getCurrentCurrency()}` : `Free deliver for orders over 500 ${getCurrentCurrency()}`
                    }
                </div>
                <div className='flex items-center justify-center gap-2'>


                    <Button variant='ghost' onClick={() => setLanguage(currentLanguage.code === 'ar' ? 'en' : 'ar')} className='cursor-pointer'>
                        {currentLanguage.name}
                    </Button>
                </div>
            </div>


        </>
    )
}
