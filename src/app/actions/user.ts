import { client } from '@/sanity/lib/client'
import { User } from '../../../sanity.types'

export async function getUserByClerkId(clerkUserId: string): Promise<User | null> {
    try {
        const user = await client.fetch<User | null>(`
            *[_type == "user" && userId == $clerkUserId][0]
        `, { clerkUserId })

        return user
    } catch (error) {
        console.error('Error fetching user:', error)
        return null
    }
} 