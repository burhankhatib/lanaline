'use client'

import React from 'react'
import Logo from '@/components/Logo'
import { useCart } from '@/context/cart'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'

export default function Header() {
    const { totalItems } = useCart();

    return (
        <div className='container flex items-center justify-between p-4 mx-auto'>
            <div>
                <Link href="/">
                    <Logo textWidth={100} textHeight={100} />
                </Link>
            </div>
            <div className="flex items-center gap-2">
                <Link href="/cart" className="relative group">
                    <div className="flex items-center gap-2 p-2 transition-colors rounded-lg hover:bg-gray-100">
                        <ShoppingCart className="w-6 h-6 text-black" />
                        <AnimatePresence>
                            {totalItems > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="absolute flex items-center justify-center w-6 h-6 text-sm text-white transition-all duration-300 ease-in-out bg-black rounded-full group-hover:scale-110 -top-2 -right-2 group-hover:bg-black"
                                >
                                    {totalItems}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </Link>
                <SignedIn>
                    <UserButton />
                </SignedIn>
                <SignedOut>
                    <SignInButton />
                    <SignUpButton />
                </SignedOut>
            </div>
        </div>
    )
}
