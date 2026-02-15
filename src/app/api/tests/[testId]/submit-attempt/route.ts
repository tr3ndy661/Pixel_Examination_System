import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '../../../../../payload'
import { getCurrentUser } from '../../../../../lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: { testId: string } }
) {
  try {


    // Safely get the testId from params
    const testIdParam = await Promise.resolve(params)
    const testId = testIdParam.testId



    // Parse the request body
    const body = await req.json()
    const attemptId = body.attemptId
    const answers = body.answers



    if (!testId || !attemptId) {
      console.error('Missing testId or attemptId')
      return NextResponse.json(
        { message: 'Missing testId or attemptId' },
        { status: 400 }
      )
    }

    // Get the current user
    const user = await getCurrentUser()

    if (!user) {
      console.error('No authenticated user found')
      return NextResponse.json(
        { message: 'You must be logged in to submit a test' },
        { status: 401 }
      )
    }

    if (user.role !== 'student') {
      console.error('User is not a student')
      return NextResponse.json(
        { message: 'Only students can submit tests' },
        { status: 403 }
      )
    }


    // Initialize payload client
    const payload = await getPayloadClient()

    // Fetch the questions for the test with all fields
    const questionsResult = await payload.find({
      collection: 'questions',
      where: {
        test: {
          equals: testId,
        },
      },
      depth: 2, // Ensure we get all nested fields
      limit: 100,
    })

    const questions = questionsResult.docs

    if (!questions || questions.length === 0) {
      console.error('No questions found for this test')
      return NextResponse.json(
        { message: 'No questions found for this test' },
        { status: 404 }
      )
    }



    // Calculate the score
    let score = 0
    let totalPoints = 0
    const gradingResults = []

    for (const question of questions) {
      const questionId = question.id
      const answer = answers[questionId]
      let isCorrect = false



      if (question.questionType === 'mcq') {
        // For multiple choice, check if the selected option is correct
        if (question.options && Array.isArray(question.options)) {
          const correctOption = question.options.find(option => option.isCorrect === true)

          if (correctOption) {
            isCorrect = answer === correctOption.id
          }
        }
      } else if (question.questionType === 'fill_blank') {
        // For fill in the blank, check if the answer matches the correct answer
        if (question.correctAnswer && answer) {
          isCorrect = answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
        }
      }

      const points = question.points || 1
      totalPoints += points

      if (isCorrect) {
        score += points
      }
      gradingResults.push({
        questionId,
        userAnswer: answer,
        isCorrect,
        points: isCorrect ? points : 0,
        maxPoints: points
      })
    }

    // Calculate percentage score
    const percentageScore = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0



    // Store the result in the logs collection for history tracking
    try {
      const testResult = await payload.find({
        collection: 'tests',
        where: {
          id: {
            equals: testId,
          },
        },
        limit: 1,
      });

      const testName = testResult.docs.length > 0 ? testResult.docs[0].title : 'Unknown Test';

      await payload.create({
        collection: 'logs',
        data: {
          action: 'submit-mock-attempt',
          timestamp: new Date().toUTCString(),
          user: user.id,
          value: {
            testId: testId,
            testName: testName,
            attemptId: attemptId,
            studentId: user.id.toString(),
            score: percentageScore,
            gradingDetails: gradingResults,
            totalQuestions: questions.length,
            correctAnswers: gradingResults.filter(r => r.isCorrect).length
          },
        },
      });


    } catch (logError) {
      console.error('Error storing test result in logs:', logError);
      // Continue even if logging fails
    }

    return NextResponse.json({
      message: 'Test submitted successfully',
      attemptId: attemptId,
      score: percentageScore,
      gradingDetails: gradingResults
    })

  } catch (error) {
    console.error('Error in submit-attempt route:', error)
    return NextResponse.json(
      { message: 'An error occurred while submitting the test' },
      { status: 500 }
    )
  }
} 