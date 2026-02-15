import { getPayloadClient } from '../../../../../../../payload'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../../../lib/auth'

export async function GET(
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



    // Verify this attempt belongs to the current user
    if (attempt.student.id !== user.id && user.role !== 'admin') {
      console.error('Attempt does not belong to the user')
      return NextResponse.json(
        { error: 'This attempt does not belong to you' },
        { status: 403 }
      )
    }

    // Get the test ID associated with the attempt
    const attemptTestId = typeof attempt.test === 'object' ? attempt.test.id : attempt.test



    const isMatch = String(attemptTestId) === String(testId)


    return NextResponse.json({
      success: true,
      testId: attemptTestId,
      match: isMatch
    })
  } catch (error) {
    console.error('Error verifying test ID:', error)
    return NextResponse.json(
      { error: 'Failed to verify test ID' },
      { status: 500 }
    )
  }
} 