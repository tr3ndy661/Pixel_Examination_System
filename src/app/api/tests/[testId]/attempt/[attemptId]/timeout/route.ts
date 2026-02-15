import { getPayloadClient } from '../../../../../../../payload'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../../../lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: { testId: string; attemptId: string } }
) {
  // Properly await params before using its properties
  const resolvedParams = await Promise.resolve(params)
  const testId = resolvedParams.testId
  const attemptId = resolvedParams.attemptId
  const payload = await getPayloadClient()

  try {


    // Get the current user
    let user = payload.req?.user

    if (!user) {

      user = await getCurrentUser()
    }

    if (!user) {
      console.error('No authenticated user found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }



    // Fetch the attempt
    const attempt = await payload.findByID({
      collection: 'test-attempts',
      id: attemptId,
      depth: 1,
    })

    if (!attempt) {
      console.error('Attempt not found')
      return NextResponse.json(
        { error: 'Attempt not found' },
        { status: 404 }
      )
    }



    // Verify this attempt belongs to the current user or user is admin
    if (attempt.student.id !== user.id && user.role !== 'admin') {
      console.error('Attempt does not belong to the user')
      return NextResponse.json(
        { error: 'This attempt does not belong to you' },
        { status: 403 }
      )
    }

    // Update the attempt status to timed_out
    const updatedAttempt = await payload.update({
      collection: 'test-attempts',
      id: attemptId,
      data: {
        status: 'timed_out',
        endTime: new Date(),
      },
    })



    return NextResponse.json({
      success: true,
      message: 'Attempt marked as timed out'
    })
  } catch (error) {
    console.error('Error marking attempt as timed out:', error)
    return NextResponse.json(
      { error: 'Failed to mark attempt as timed out' },
      { status: 500 }
    )
  }
} 