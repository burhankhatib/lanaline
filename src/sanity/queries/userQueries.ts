import { groq } from 'next-sanity'
import { currentUser } from '@clerk/nextjs/server'

export const getUserOrdersCount = async () => {
  const user = await currentUser()
  if (!user) {
    throw new Error('User not found')
  }

  return groq`*[_type == "user" && userId == "${user.id}"][0] {
    "orderCount": count(orders)
  }`
}

export const getUserTotalSpent = async () => {
  const user = await currentUser()
  if (!user) {
    throw new Error('User not found')
  }

  return groq`*[_type == "user" && userId == "${user.id}"][0] {
    "totalSpent": sum(orders.totalAmount)
  }`  
}