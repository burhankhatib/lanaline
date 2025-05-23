import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { getUserByClerkId } from '@/app/actions/user'
import { User } from '../../sanity.types'

export function useUserData() {
    const { user: clerkUser, isLoaded: isClerkLoaded } = useUser()
    const [userData, setUserData] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        async function fetchUserData() {
            if (!isClerkLoaded || !clerkUser) {
                setIsLoading(false)
                return
            }

            try {
                const data = await getUserByClerkId(clerkUser.id)
                setUserData(data)
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch user data'))
            } finally {
                setIsLoading(false)
            }
        }

        fetchUserData()
    }, [clerkUser, isClerkLoaded])

    return {
        userData,
        isLoading,
        error,
        isAuthenticated: !!clerkUser
    }
} 