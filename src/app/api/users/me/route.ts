import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import jwt from 'jsonwebtoken'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const payload = await getPayloadHMR({ config: configPromise })
    
    let decoded
    try {
      decoded = jwt.verify(token.value, process.env.PAYLOAD_SECRET || '')
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      )
    }

    if (decoded && typeof decoded === 'object' && 'id' in decoded) {
      const { docs: users } = await payload.find({
        collection: 'users',
        where: {
          id: {
            equals: decoded.id,
          },
        },
        limit: 1,
      })

      if (users && users.length > 0) {
        const user = users[0]
        return NextResponse.json({
          success: true,
          data: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            level: user.level,
          },
        })
      }
    }

    return NextResponse.json(
      { success: false, message: 'User not found' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error getting current user:', error)
    return NextResponse.json(
      { success: false, message: 'An error occurred while retrieving user data' },
      { status: 500 }
    )
  }
} 