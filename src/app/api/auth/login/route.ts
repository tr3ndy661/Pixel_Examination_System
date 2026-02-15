import { NextResponse } from 'next/server'
import { getPayloadClient } from '../../../../payload'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { signToken } from '../../../../lib/auth'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    const payload = await getPayloadClient()

    // Attempt to login
    const result = await payload.login({
      collection: 'users',
      data: {
        email,
        password,
      },
    })

    // Always create our own token with consistent signing options
    const customToken = signToken({
      id: result.user.id,
      collection: 'users',
      email: result.user.email
    })

    // Replace the Payload token with our custom token
    result.token = customToken

    // Set the token in cookies
    const cookieStore = await cookies()

    // Log the PAYLOAD_SECRET (just the first few characters for security)
    const secret = process.env.PAYLOAD_SECRET


    // Set the cookie with the correct options
    cookieStore.set('payload-token', result.token, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7200, // 2 hours
    })

    // Return user data without sensitive information
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName,
        role: result.user.role,
        level: result.user.level,
      },
    })
  } catch (error: any) {
    console.error('Login error:', error)
    console.error('Error stack:', error.stack)

    // Handle specific error cases
    if (error.message?.includes('credentials')) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, message: error.message || 'An error occurred during login' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Use POST method to login' },
    { status: 405 }
  )
} 