import { getPayloadClient } from '../../../../../../../payload'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../../../lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: { testId: string; attemptId: string } }
) {
  // Properly await params before using properties
  const resolvedParams = await Promise.resolve(params)
  const testId = resolvedParams.testId
  const attemptId = resolvedParams.attemptId



  try {
    // Initialize payload client
    const payload = await getPayloadClient()


    // Get the current user
    const user = await getCurrentUser()

    if (!user) {
      console.error('No authenticated user found')
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to complete this action' },
        { status: 401 }
      )
    }



    // Fetch the attempt
    let attempt
    try {
      attempt = await payload.findByID({
        collection: 'test-attempts',
        id: attemptId,
        depth: 1,
      })

    } catch (error) {
      console.error('Error fetching attempt:', error)
      return NextResponse.json(
        { error: `Failed to fetch attempt: ${error.message}` },
        { status: 404 }
      )
    }

    // Verify the attempt belongs to the user
    const attemptStudentId = typeof attempt.student === 'object'
      ? attempt.student.id
      : attempt.student

    if (String(attemptStudentId) !== String(user.id)) {
      console.error('Attempt does not belong to the user')
      return NextResponse.json(
        { error: 'This attempt does not belong to you' },
        { status: 403 }
      )
    }

    // Verify the attempt is for the correct test
    const attemptTestId = typeof attempt.test === 'object'
      ? attempt.test.id
      : attempt.test

    if (String(attemptTestId) !== String(testId)) {
      console.error('Attempt is for a different test')
      return NextResponse.json(
        { error: 'This attempt is for a different test' },
        { status: 400 }
      )
    }

    // Update the attempt status to timed out
    if (attempt.status === 'in_progress') {

      try {
        const updatedAttempt = await payload.update({
          collection: 'test-attempts',
          id: attemptId,
          data: {
            status: 'timed_out',
            endTime: new Date().toISOString(),
          },
        })


        // Calculate score based on responses so far
        const responsesCount = attempt.responses?.length || 0
        const correctResponses = attempt.responses?.filter(r => r.isCorrect)?.length || 0

        // Fetch questions to know total question count
        const { docs: questions } = await payload.find({
          collection: 'questions',
          where: {
            test: {
              equals: testId,
            },
          },
        })

        const totalQuestions = questions.length
        const score = totalQuestions > 0
          ? Math.round((correctResponses / totalQuestions) * 100)
          : 0

        // Update attempt with score
        await payload.update({
          collection: 'test-attempts',
          id: attemptId,
          data: {
            score,
          },
        })



        return NextResponse.json({
          message: 'Attempt marked as timed out',
          success: true,
          attemptId,
        })
      } catch (error) {
        console.error('Error updating attempt status:', error)
        return NextResponse.json(
          { error: `Failed to update attempt status: ${error.message}` },
          { status: 500 }
        )
      }
    } else {

      return NextResponse.json({
        message: 'Attempt is not in progress',
        success: false,
        status: attempt.status,
      })
    }
  } catch (error) {
    console.error('Unexpected error in time expiration handler:', error)
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error.message}` },
      { status: 500 }
    )
  }
} 