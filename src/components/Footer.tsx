'use client'
import React from 'react'
import LogoIcon from './LogoIcon'
import { FaFacebook, FaInstagram, FaSnapchat, FaTiktok } from 'react-icons/fa'
import Link from 'next/link'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    const socialLinks = [
        {
            name: 'Facebook',
            url: 'https://www.facebook.com/lanaline95',
            icon: <FaFacebook />
        },
        {
            name: 'Instagram',
            url: 'https://www.instagram.com/lanaa.line/',
            icon: <FaInstagram />
        },
        {
            name: 'TikTok',
            url: 'https://www.tiktok.com/@lanaa.line?lang=en',
            icon: <FaTiktok />

        },
        {
            name: 'Snapchat',
            url: 'https://story.snapchat.com/@lana_sadder',
            icon: <FaSnapchat />
        },


    ]

    return (
        <div className="container flex flex-col items-center justify-center w-full max-w-6xl p-4 mx-auto h-fit bg-primary ">
            <div className="flex flex-col items-center justify-center w-full gap-2 md:flex-row">
                <LogoIcon className="w-6 h-6 animate-spin-slow fill-white" />
                <span className="font-bold text-white">LANA LINE</span>
                <p className="flex items-center gap-1 text-sm text-white">©  {currentYear} All rights reserved</p>
            </div>
            <div className="flex items-center justify-center w-full gap-2 text-white">
                <p className="text-sm ">Follow us on</p>
                <div className="flex items-center gap-2">
                    {socialLinks.map((link) => (
                        <Link href={link.url} key={link.name} target="_blank" className="text-white hover:text-secondary">
                            {link.icon}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
