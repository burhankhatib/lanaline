'use client'

import { SignUp } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import LogoIcon from '@/components/LogoIcon';
import { useLanguage } from "@/context/LanguageContext";
import { useCountry } from "@/context/CountryContext";

const UAE_CITIES = [
    'Dubai',
    'Abu Dhabi',
    'Sharjah',
    'Ajman',
    'Ras Al Khaimah',
    'Fujairah',
    'Umm Al Quwain'
];

const PALESTINE_CITIES = [
    'Jerusalem',
    'Gaza City',
    'Hebron',
    'Nablus',
    'Ramallah',
    'Bethlehem',
    'Jenin',
    'Arab 48'
];

export default function SignUpPage() {
    const { language } = useLanguage();
    const { country, setCountry } = useCountry();
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [isClient, setIsClient] = useState(false);
    const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);

    // Load data from localStorage after component mounts
    useEffect(() => {
        setIsClient(true);
        const savedAddress = localStorage.getItem('address');
        const savedCity = localStorage.getItem('city');
        const savedZipCode = localStorage.getItem('zipCode');

        if (savedAddress) setAddress(savedAddress);
        if (savedCity) setCity(savedCity);
        if (savedZipCode) setZipCode(savedZipCode);
    }, []);

    // Save to localStorage when values change
    useEffect(() => {
        if (!isClient) return;

        if (address) localStorage.setItem('address', address);
        if (city) localStorage.setItem('city', city);
        if (zipCode) localStorage.setItem('zipCode', zipCode);
    }, [address, city, zipCode, isClient]);

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCountry = e.target.value as 'UAE' | 'Palestine';
        setCountry(newCountry);
        setCity(''); // Reset city when country changes
        if (newCountry !== 'UAE') {
            setZipCode(''); // Reset zip code if not UAE
        }
    };

    const welcomeMessage = [
        {
            titleArabic: 'مرحبا بك في لانا لاين',
            titleEnglish: 'Welcome to Lana Line'
        },
        {
            descriptionArabic: 'قبل أن تسجل في لانا لاين، يرجى ملء عنوانك والمدينة',
            descriptionEnglish: 'Before you sign up, please fill in your address and city'
        }
    ];

    return (
        <div className="flex flex-col items-center justify-center w-full px-4 py-12 bg-primary/10 sm:px-6 lg:px-8">
            <div className='flex flex-col items-center justify-center gap-2'>
                <LogoIcon className='w-10 h-10 text-primary animate-spin-slow' />
                {language === 'ar' ? (
                    <>
                        <h1 className='text-3xl font-bold text-gray-900'>
                            {welcomeMessage[0].titleArabic}
                        </h1>
                        <span className='text-sm text-gray-500'>
                            {welcomeMessage[1].descriptionArabic}
                        </span>
                    </>
                ) : (
                    <>
                        <h1 className='text-3xl font-bold text-gray-900'>
                            {welcomeMessage[0].titleEnglish}
                        </h1>
                        <span className='text-sm text-gray-500'>
                            {welcomeMessage[1].descriptionEnglish}
                        </span>
                    </>
                )}
            </div>

            {address && city && country && isAddressConfirmed ? (
                <SignUp
                    path="/sign-up"
                    routing="path"
                    signInUrl="/sign-in"
                    appearance={{
                        elements: {
                            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
                            card: 'bg-transparent shadow-none',
                            headerTitle: 'text-3xl font-bold text-gray-900',
                            headerSubtitle: 'text-sm text-gray-600',
                            socialButtonsBlockButton: 'flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-gray-700 transition-colors duration-200 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                            formFieldInput: 'block w-full px-3 py-2 placeholder-gray-400 transition-colors duration-200 border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500',
                            formFieldLabel: 'block mb-1 text-sm font-medium text-gray-700',
                            formFieldError: 'mt-1 text-sm text-red-600',
                            dividerLine: 'bg-gray-300',
                            dividerText: 'px-2 text-gray-500 bg-white',
                            formFieldAction: 'text-sm text-blue-600 hover:text-blue-700',
                            footerActionLink: 'text-sm text-blue-600 hover:text-blue-700',
                        },
                    }}
                    unsafeMetadata={{
                        address: address,
                        city: city,
                        country: country,
                        zipCode: zipCode
                    }}
                />
            ) : (
                <div className={`flex flex-col items-center justify-center w-full max-w-md ${address && city && country && isAddressConfirmed ? 'hidden' : ''}`}>
                    <form action="" className="w-full p-6 bg-white rounded-lg shadow-lg">
                        <select
                            value={country}
                            onChange={handleCountryChange}
                            className="w-full p-2 mb-4 border rounded"
                        >
                            <option value="">Select Country</option>
                            <option value="UAE">UAE</option>
                            <option value="Palestine">Palestine</option>
                        </select>

                        <select
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            disabled={!country}
                            className={`w-full p-2 mb-4 border rounded ${!country ? 'bg-gray-100' : ''}`}
                        >
                            <option value="">Select City</option>
                            {country === 'UAE' && UAE_CITIES.map((cityName) => (
                                <option key={cityName} value={cityName}>{cityName}</option>
                            ))}
                            {country === 'Palestine' && PALESTINE_CITIES.map((cityName) => (
                                <option key={cityName} value={cityName}>{cityName}</option>
                            ))}
                        </select>

                        {country === 'UAE' && (
                            <input
                                type="text"
                                placeholder='Zip Code'
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                                className="w-full p-2 mb-4 border rounded"
                            />
                        )}

                        <input
                            type="text"
                            placeholder='Address'
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full p-2 my-4 border rounded"
                        />

                        <button
                            type="button"
                            onClick={() => setIsAddressConfirmed(true)}
                            disabled={!address || !city || !country}
                            className={`w-full p-2 text-white rounded ${!address || !city || !country
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            Confirm Address
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}