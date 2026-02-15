import React from 'react'
import Link from 'next/link'
import { requireStudent } from '../../../../lib/auth'
import { getPayloadClient } from '../../../../payload'
import ResultsClient from './ResultsClient'

type AttemptResultParams = {
  params: {
    attemptId: string
  }
}

export default async function AttemptResult({ params }: AttemptResultParams) {
  const attemptId = params.attemptId

  try {
    const user = await requireStudent()
    const payload = await getPayloadClient()

    let attempt
    let attemptTimestamp
    let isMockAttempt = false

    try {
      attempt = await payload.findByID({
        collection: 'test-attempts',
        id: attemptId,
        depth: 2,
      })
      attemptTimestamp = attempt.submittedAt
    } catch (error) {
      const logs = await payload.find({
        collection: 'logs',
        where: {
          and: [
            { 'value.attemptId': { equals: attemptId } },
            { action: { equals: 'submit-mock-attempt' } }
          ]
        },
      })

      if (logs.docs.length > 0) {
        attempt = logs.docs[0].value
        attemptTimestamp = logs.docs[0].timestamp
        isMockAttempt = true
      } else {
        throw new Error('Test attempt not found')
      }
    }

    if (!attempt) throw new Error('Test attempt not found')

    const gradingDetails = attempt.gradingDetails || []
    const questions = []

    for (const detail of gradingDetails) {
      try {
        const question = await payload.findByID({
          collection: 'questions',
          id: detail.questionId,
        })
        questions.push(question)
      } catch (err) {
        console.error('Error fetching question:', err)
      }
    }

    const testName = attempt.testName || 'Unknown Test'
    const score = attempt.score !== undefined ? attempt.score : 0
    const totalQuestions = gradingDetails.length
    const correctCount = gradingDetails.filter(d => d.isCorrect).length
    const incorrectCount = totalQuestions - correctCount

    const attemptData = {
      id: attemptId,
      testName,
      score,
      submittedAt: attemptTimestamp,
      totalQuestions,
      correctCount,
      incorrectCount,
      gradingDetails,
      questions,
      isMockAttempt,
    }

    return <ResultsClient attempt={attemptData} user={user} />
  } catch (error) {
    console.error('Error in AttemptResult page:', error)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Error Loading Results</h1>
          <p className="text-slate-400 mb-6">
            We couldn't load your test results. The attempt may not exist or you don't have permission to view it.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/results"
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
            >
              All Results
            </Link>
          </div>
        </div>
      </div>
    )
  }
}
