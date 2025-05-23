import { NextResponse } from 'next/server'

interface ToastRequest {
  status: 'error' | 'success' | 'warning' | 'info'
  title: string
  description?: string
}

export default async function toastHandler(req: Request) {
  try {
    const body = await req.json() as ToastRequest
    const { status, title, description } = body

    // Validate the request
    if (!status || !title) {
      return NextResponse.json({
        error: 'Missing required fields: status and title are required'
      }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['error', 'success', 'warning', 'info']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      }, { status: 400 })
    }

    // Create toast object
    const toast = {
      status,
      title,
      description,
      duration: 5000, // 5 seconds
    }

    // Return success response
    return NextResponse.json({
      success: true,
      toast
    }, { status: 200 })

  } catch (error) {
    console.error('Error showing toast:', error)
    return NextResponse.json({
      error: 'Failed to show toast notification'
    }, { status: 500 })
  }
} 