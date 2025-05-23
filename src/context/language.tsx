'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Roboto, Cairo } from 'next/font/google';

const roboto = Roboto({
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    subsets: ["latin"],
});

const cairo = Cairo({
    weight: ["200", "300", "400", "500", "600", "700", "800", "900", "1000"],
    subsets: ["latin"],
});

type Language = {
    code: string;
    name: string;
    direction: 'ltr' | 'rtl';
    currency: string;
};

const languages: Language[] = [
    {
        code: 'en',
        name: 'English',
        direction: 'ltr',
        currency: 'AED'
    },
    {
        code: 'ar',
        name: 'العربية',
        direction: 'rtl',
        currency: 'د.أ'
    }
];

type LanguageContextType = {
    currentLanguage: Language;
    setLanguage: (code: string) => void;
    roboto: typeof roboto;
    cairo: typeof cairo;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const savedLanguage = localStorage.getItem('selectedLanguage');
        if (savedLanguage) {
            const language = languages.find(lang => lang.code === savedLanguage);
            if (language) {
                setCurrentLanguage(language);
            }
        }
    }, []);

    const setLanguage = (code: string) => {
        const language = languages.find(lang => lang.code === code);
        if (language) {
            setCurrentLanguage(language);
            if (isClient) {
                localStorage.setItem('selectedLanguage', code);
            }
        }
    };

    return (
        <LanguageContext.Provider value={{ currentLanguage, setLanguage, roboto, cairo }}>
            <html lang={currentLanguage.code} dir={currentLanguage.direction}>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <meta name="description" content="Lana Line" />
                    <meta name="keywords" content="Lana Line, Lana Line UAE, Lana Line PS, Lana Line Saudi, Lana Line Kuwait, Lana Line Oman, Lana Line Qatar, Lana Line Bahrain, Lana Line UAE, Lana Line PS, Lana Line Saudi, Lana Line Kuwait, Lana Line Oman, Lana Line Qatar, Lana Line Bahrain" />
                    <meta name="author" content="Lana Line" />
                    <meta name="robots" content="index, follow" />
                    <meta name="googlebot" content="index, follow" />
                    <meta name="google" content="notranslate" />
                </head>
                <body className={`${currentLanguage.direction === 'ltr' ? 'ltr' : 'rtl'} ${currentLanguage.direction === 'ltr' ? roboto.className : cairo.className} scroll-smooth`}>
                    {children}
                </body>
            </html>
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
