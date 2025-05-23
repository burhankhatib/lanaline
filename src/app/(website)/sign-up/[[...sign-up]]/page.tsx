'use client'

import { SignUp } from '@clerk/nextjs';
import { useState } from 'react';
import LogoIcon from '@/components/LogoIcon';
import { useLanguage } from '@/context/language';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Type declarations
declare global {
    interface Window {
        localStorage: {
            getItem(key: string): string | null;
            setItem(key: string, value: string): void;
        };
    }
}

type Country = 'UAE' | 'Palestine' | '';
type FormData = {
    address: string;
    city: string;
    zipCode: string;
    country: Country;
};

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

const WELCOME_MESSAGES = {
    ar: {
        title: 'مرحبا بك في لانا لاين',
        description: 'قبل أن تسجل في لانا لاين، يرجى ملء عنوانك والمدينة'
    },
    en: {
        title: 'Welcome to Lana Line',
        description: 'Before you sign up, please fill in your address and city'
    }
};

export default function SignUpPage() {
    const { currentLanguage } = useLanguage();
    const [formData, setFormData] = useLocalStorage<FormData>('formData', {
        address: '',
        city: '',
        zipCode: '',
        country: ''
    });
    const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const name = target.name as keyof FormData;
        const value = target.value;
        setFormData((prev: FormData) => {
            const newData = { ...prev, [name]: value };
            if (name === 'country') {
                newData.city = '';
                if (value !== 'UAE') newData.zipCode = '';
            }
            return newData;
        });
    };

    const { title, description } = WELCOME_MESSAGES[currentLanguage.code === 'ar' ? 'ar' : 'en'];
    const cities = formData.country === 'UAE' ? UAE_CITIES : PALESTINE_CITIES;
    const isFormValid = formData.address && formData.city && formData.country;

    return (
        <div className="flex flex-col items-center justify-center w-full px-4 py-12 bg-primary/10 sm:px-6 lg:px-8">
            <div className='flex flex-col items-center justify-center gap-2'>
                <LogoIcon className='w-10 h-10 text-primary animate-spin-slow' />
                <h1 className='text-3xl font-bold text-gray-900'>{title}</h1>
                <span className='text-sm text-gray-500'>{description}</span>
            </div>

            {isFormValid && isAddressConfirmed ? (
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
                    unsafeMetadata={formData}
                />
            ) : (
                <div className="flex flex-col items-center justify-center w-full max-w-md">
                    <form className="w-full p-6 bg-white rounded-lg shadow-lg">
                        <select
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className="w-full p-2 mb-4 border rounded"
                        >
                            <option value="">Select Country</option>
                            <option value="UAE">UAE</option>
                            <option value="Palestine">Palestine</option>
                        </select>

                        <select
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            disabled={!formData.country}
                            className={`w-full p-2 mb-4 border rounded ${!formData.country ? 'bg-gray-100' : ''}`}
                        >
                            <option value="">Select City</option>
                            {cities.map((cityName) => (
                                <option key={cityName} value={cityName}>{cityName}</option>
                            ))}
                        </select>

                        {formData.country === 'UAE' && (
                            <input
                                type="text"
                                name="zipCode"
                                placeholder='Zip Code'
                                value={formData.zipCode}
                                onChange={handleInputChange}
                                className="w-full p-2 mb-4 border rounded"
                            />
                        )}

                        <input
                            type="text"
                            name="address"
                            placeholder='Address'
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full p-2 my-4 border rounded"
                        />

                        <button
                            type="button"
                            onClick={() => setIsAddressConfirmed(true)}
                            disabled={!isFormValid}
                            className={`w-full p-2 text-white rounded ${!isFormValid ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
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