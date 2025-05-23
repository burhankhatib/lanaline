import React from 'react'
import { SignIn } from '@clerk/nextjs'

export default function page() {
    return (
        <div className='flex items-center justify-center h-screen my-2'>
            <SignIn />
        </div>
    )
}
