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

    // Get the request body
    const body = await req.json()
    const { questionId, response, timeSpent } = body


    if (!questionId || response === undefined) {
      console.error('Missing required fields');
      return NextResponse.json(
        { error: 'Question ID and response are required' },
        { status: 400 }
      )
    }

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
        { error: 'Only students can submit responses' },
        { status: 403 }
      )
    }



    // Fetch the attempt with depth to get nested data
    const attempt = await payload.findByID({
      collection: 'test-attempts',
      id: attemptId,
      depth: 1,
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

    // Fetch the question to check the correct answer
    const question = await payload.findByID({
      collection: 'questions',
      id: questionId,
    })



    // Determine if the response is correct
    let isCorrect = false
    if (question.type === 'multiple_choice' || question.type === 'true_false') {
      isCorrect = response === question.correctAnswer

    } else if (question.type === 'short_answer') {
      // For short answer, we'll need manual grading or more complex logic
      // For now, we'll just mark it as pending review
      isCorrect = false

    }

    // Check if this question has already been answered
    const existingResponseIndex = (attempt.responses || []).findIndex(
      (r) => r.question.id === questionId
    )



    const updatedResponses = attempt.responses || []

    if (existingResponseIndex !== -1) {
      // Update existing response
      updatedResponses[existingResponseIndex] = {
        question: {
          id: questionId
        },
        response,
        isCorrect,
        timeSpent: timeSpent || updatedResponses[existingResponseIndex].timeSpent,
      }

    } else {
      // Add new response
      updatedResponses.push({
        question: {
          id: questionId
        },
        response,
        isCorrect,
        timeSpent: timeSpent || 0,
      })
    }

    // Update the attempt with the new response
    const updatedAttempt = await payload.update({
      collection: 'test-attempts',
      id: attemptId,
      data: {
        responses: updatedResponses.map(r => ({
          ...r,
          question: typeof r.question === 'object' ? r.question.id : r.question
        })),
        test: {
          relationTo: 'tests',
          value: attempt.test.id
        }
      },
    })


    return NextResponse.json({
      success: true,
      message: 'Response saved successfully',
      responseCount: updatedResponses.length
    })
  } catch (error) {
    console.error('Error saving response:', error)
    return NextResponse.json(
      { error: 'Failed to save response' },
      { status: 500 }
    )
  }
} 