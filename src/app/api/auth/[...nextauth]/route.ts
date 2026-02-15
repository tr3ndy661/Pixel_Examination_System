import { getPayloadClient } from '../../../../payload'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const { email, password } = await req.json()

    // Authenticate with Payload
    const result = await payload.login({
      collection: 'users',
      data: {
        email,
        password,
      },
    })

    // Set the payload token as a cookie
    const cookieStore = await cookies()
    await cookieStore.set('payload-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return NextResponse.json({ success: true, user: result.user })
  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.json(
      { success: false, message: 'Invalid email or password' },
      { status: 401 }
    )
  }
}

export async function GET() {
  try {
    const payload = await getPayloadClient()
    const user = payload.req?.user

    if (user) {
      return NextResponse.json({ user })
    }

    return NextResponse.json({ user: null })
  } catch (error) {
    console.error('Error getting user:', error)
    return NextResponse.json({ user: null })
  }
}

export async function DELETE() {
  try {
    const payload = await getPayloadClient()
    await payload.logout()

    // Clear the payload token cookie
    const cookieStore = await cookies()
    await cookieStore.delete('payload-token')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to logout' },
      { status: 500 }
    )
  }
} 