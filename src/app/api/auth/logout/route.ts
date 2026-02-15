import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPayloadClient } from '../../../../payload'

export async function POST() {
  try {
    const payload = await getPayloadClient()
    
    // Get the token from cookies - properly await cookies()
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')
    
    // If there's a token, try to logout from Payload
    if (token) {
      try {
        // Attempt to logout the user from Payload
        await payload.logout()
      } catch (logoutError) {
        console.error('Error during Payload logout:', logoutError)
        // Continue with cookie deletion even if Payload logout fails
      }
    }
    
    // Delete the token cookie
    cookieStore.delete('payload-token')
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    console.error('Logout error:', error)
    
    // Even if there's an error, try to delete the cookie
    try {
      const cookieStore = await cookies()
      cookieStore.delete('payload-token')
    } catch (cookieError) {
      console.error('Error deleting cookie:', cookieError)
    }
    
    return NextResponse.json(
      { success: false, message: 'An error occurred during logout' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Use POST method to logout' },
    { status: 405 }
  )
} 