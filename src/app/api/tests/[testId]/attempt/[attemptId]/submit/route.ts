import { getPayloadClient } from '../../../../../../../payload'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../../../lib/auth'
import { cookies } from 'next/headers'

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


    // Get the current user using both methods
    let user = payload.req?.user;

    if (!user) {
      user = await getCurrentUser();
    }

    if (!user) {
      console.error('No authenticated user found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (user.role !== 'student') {
      console.error('User is not a student');
      return NextResponse.json(
        { error: 'Only students can submit test attempts' },
        { status: 403 }
      )
    }


    // Fetch the attempt with depth to get nested data
    const attempt = await payload.findByID({
      collection: 'test-attempts',
      id: attemptId,
      depth: 2,
    })


    // Verify this attempt belongs to the current user
    if (attempt.student.id !== user.id) {
      console.error('Attempt does not belong to the user');
      return NextResponse.json(
        { error: 'This attempt does not belong to you' },
        { status: 403 }
      )
    }

    // Verify this attempt is for the correct test
    if (String(attempt.test.id) !== String(testId)) {
      console.error('Attempt is not for the specified test');
      return NextResponse.json(
        { error: 'This attempt is not for the specified test' },
        { status: 400 }
      )
    }

    // Verify the attempt is still in progress
    if (attempt.status !== 'in_progress') {
      console.error('Attempt is no longer in progress');
      return NextResponse.json(
        { error: 'This attempt is no longer in progress' },
        { status: 400 }
      )
    }

    // Fetch all questions for this test
    const { docs: questions } = await payload.find({
      collection: 'questions',
      where: {
        test: {
          equals: testId,
        },
      },
    })


    // Calculate the score
    const totalQuestions = questions.length
    const answeredQuestions = attempt.responses?.length || 0
    const correctAnswers = attempt.responses?.filter(response => response.isCorrect)?.length || 0

    // Calculate score as a percentage
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0



    // Update the attempt as completed
    const updatedAttempt = await payload.update({
      collection: 'test-attempts',
      id: attemptId,
      data: {
        status: 'completed',
        endTime: new Date(),
        score,
      },
    })



    try {
      // Update the assignment status in the test
      const test = await payload.findByID({
        collection: 'tests',
        id: testId,
        depth: 1,
      })



      // Find the assignment for this student
      const assignmentIndex = test.assignments.findIndex(
        (a) => String(a.student) === String(user.id)
      )



      if (assignmentIndex !== -1) {
        // Update the assignment status
        test.assignments[assignmentIndex].status = 'completed'

        // Update the test
        await payload.update({
          collection: 'tests',
          id: testId,
          data: {
            assignments: test.assignments,
          },
        })


      }
    } catch (error) {
      console.error('Error updating test assignment:', error);
      // Continue execution even if assignment update fails
    }

    return NextResponse.json({
      success: true,
      score,
      message: 'Test submitted successfully'
    })
  } catch (error) {
    console.error('Error submitting test attempt:', error)
    return NextResponse.json(
      { error: 'Failed to submit test attempt' },
      { status: 500 }
    )
  }
} 