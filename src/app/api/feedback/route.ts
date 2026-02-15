import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config: configPromise })
    const body = await request.json()

    // Get user ID from token
    let userId = null
    const token = request.cookies.get('payload-token')?.value
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.PAYLOAD_SECRET || '') as any
        userId = decoded.id
        console.log('Decoded user ID from token:', userId)
      } catch (e) {
        console.error('Token verification failed:', e)
      }
    }

    const feedbackData: any = {
      rating: body.rating,
      easeOfUse: body.easeOfUse,
      features: body.features,
      performance: body.performance,
      recommendation: body.recommendation,
      comments: body.comments,
    }

    if (userId) {
      feedbackData.user = userId
    }

    console.log('Creating feedback with data:', feedbackData)

    const result = await payload.create({
      collection: 'feedbacks',
      data: feedbackData,
    })

    console.log('Feedback created successfully:', result.id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}
