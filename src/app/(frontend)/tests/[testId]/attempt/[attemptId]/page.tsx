import React from 'react'
import Link from 'next/link'
import { getPayloadClient } from '../../../../../../payload'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../../../../../lib/auth'
import SubmitAttemptForm from './SubmitAttemptForm'
import CountdownTimer from './CountdownTimer'
import TimeExpiredHandler from './TimeExpiredHandler'

export default async function TestAttempt({
  params,
}: {
  params: { testId: string; attemptId: string }
}) {
  // Properly await params before using its properties
  const resolvedParams = await Promise.resolve(params)
  const testId = resolvedParams.testId
  const attemptId = resolvedParams.attemptId


  try {
    // Get the payload client
    const payload = await getPayloadClient()

    // Get the current user
    const user = await getCurrentUser()


    // If not logged in, redirect to login
    if (!user) {
      return redirect(
        '/login?redirect=' + encodeURIComponent(`/tests/${testId}/attempt/${attemptId}`),
      )
    }

    // If admin, redirect to admin panel
    if (user.role === 'admin') {
      return redirect('/admin')
    }

    // Fetch the attempt with error handling
    let attempt
    try {
      const result = await payload.findByID({
        collection: 'test-attempts',
        id: attemptId,
        depth: 2,
      })

      if (!result) {
        return redirect('/tests')
      }

      attempt = result
    } catch (attemptError) {
      console.error('Error fetching attempt:', attemptError)
      return (
        <div className="container mx-auto p-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-red-500 p-4">
              <h2 className="text-xl font-bold text-white">Error</h2>
            </div>
            <div className="p-6">
              <p className="mb-4">There was an error loading the test attempt. Please try again.</p>
              <p className="text-red-600 mb-4">{attemptError.message}</p>
              <Link
                href="/tests"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Back to Tests
              </Link>
            </div>
          </div>
        </div>
      )
    }

    // Verify this attempt belongs to the current user
    if (
      !attempt.student ||
      (typeof attempt.student === 'object' && attempt.student.id !== user.id) ||
      (typeof attempt.student !== 'object' && attempt.student !== user.id)
    ) {
      
      return redirect('/tests')
    }

    // Verify this attempt is for the correct test
    const attemptTestId =
      typeof attempt.test === 'object' ? String(attempt.test.id) : String(attempt.test)
    const urlTestId = String(testId)

    if (attemptTestId !== urlTestId) {
      
      return redirect('/tests')
    }

    // Check if the attempt is still in progress
    if (attempt.status !== 'in_progress') {
      return redirect(`/results/${attemptId}`)
    }

    // Fetch the test
    let test
    try {
      test = await payload.findByID({
        collection: 'tests',
        id: urlTestId,
        depth: 1,
      })
    } catch (testError) {
      console.error('Error fetching test:', testError)
      return (
        <div className="container mx-auto p-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-red-500 p-4">
              <h2 className="text-xl font-bold text-white">Error</h2>
            </div>
            <div className="p-6">
              <p className="mb-4">There was an error loading the test. Please try again.</p>
              <p className="text-red-600 mb-4">{testError.message}</p>
              <Link
                href="/tests"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Back to Tests
              </Link>
            </div>
          </div>
        </div>
      )
    }

    // Fetch questions for this test
    const { docs: questions } = await payload.find({
      collection: 'questions',
      where: {
        test: {
          equals: urlTestId,
        },
      },
      sort: 'orderNumber',
    })

    // Calculate time remaining (in seconds)
    const startTime = new Date(attempt.startTime).getTime()
    const timeLimitMs = test.timeLimit * 60 * 1000 // convert minutes to ms
    const currentTime = Date.now()
    const elapsedMs = currentTime - startTime
    const remainingMs = Math.max(0, timeLimitMs - elapsedMs)
    const remainingSeconds = Math.floor(remainingMs / 1000)


    // Check if time has expired
    const hasTimeExpired = remainingSeconds <= 0


    return (
      <div className="min-h-screen bg-slate-950">
        {hasTimeExpired && <TimeExpiredHandler attemptId={attemptId} testId={testId} />}
        
        <SubmitAttemptForm
          testId={testId}
          attemptId={attemptId}
          questions={questions}
          existingResponses={attempt.responses || []}
          testTitle={test.title}
          timeLimit={test.timeLimit}
          remainingSeconds={remainingSeconds}
          attachments={test.attachments || []}
        />
      </div>
    )
  } catch (error) {
    console.error('Unexpected error in test attempt page:', error)

    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-red-500 p-4">
            <h2 className="text-xl font-bold text-white">Error</h2>
          </div>
          <div className="p-6">
            <p className="mb-4">An unexpected error occurred while loading your test.</p>
            <p className="text-red-600 mb-4">{error.message}</p>
            <Link
              href="/tests"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Back to Tests
            </Link>
          </div>
        </div>
      </div>
    )
  }
}
