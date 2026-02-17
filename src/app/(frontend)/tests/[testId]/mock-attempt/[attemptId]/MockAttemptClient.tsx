'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TestTimer from './TestTimer'

interface Question {
  id: string
  questionText: string
  questionType: 'mcq' | 'fill_blank'
  options?: { id: string; optionText: string }[]
}

interface Attachment {
  file: {
    url: string
    title: string
  }
  fileType: string
}

interface MockAttemptClientProps {
  testId: string
  attemptId: string
  testTitle: string
  timeLimit: number
  questions: Question[]
  attachments: Attachment[]
}

export default function MockAttemptClient({
  testId,
  attemptId,
  testTitle,
  timeLimit,
  questions,
  attachments,
}: MockAttemptClientProps) {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  // Track start time for study hours calculation
  const [startTime] = useState(Date.now())

  const currentQuestion = questions[currentQuestionIndex]

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }))
    if (error) setError('')
  }

  const toggleFlag = (index: number) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    if (submitting) return

    try {
      setSubmitting(true)
      setError('')
      setSuccessMessage('Submitting your test...')

      const timeTaken = Math.floor((Date.now() - startTime) / 1000) // in seconds

      const response = await fetch(`/api/tests/${testId}/submit-attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attemptId,
          answers: responses,
          timeTaken,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.message || 'Failed to submit test')
        setSubmitting(false)
        return
      }

      const data = await response.json()
      setSuccessMessage(
        `Test submitted successfully! Your score: ${data.score}%. Redirecting to results...`,
      )

      setTimeout(() => {
        router.push(`/results/${attemptId}`)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to submit test. Please try again.')
      setSubmitting(false)
    }
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400">
        No questions found for this test. Please contact an administrator.
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="p-8 text-center text-slate-400">
        Error loading question. Please try refreshing the page.
      </div>
    )
  }

  const answeredCount = Object.keys(responses).length
  const progressPercent = Math.round((answeredCount / questions.length) * 100)

  return (
    <>
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-900/80 backdrop-blur-md px-4 md:px-6 py-3">
        <div className="mx-auto flex max-w-7xl flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div>
              <h1 className="text-base md:text-lg font-bold leading-none tracking-tight text-white">{testTitle}</h1>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="md:hidden flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5 font-mono text-xs font-bold text-slate-300">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <TestTimer timeLimit={timeLimit} testId={testId} attemptId={attemptId} />
            </div>
          </div>

          <div className="hidden md:flex flex-1 flex-col items-center px-12 max-w-2xl">
            <div className="flex w-full items-center justify-between mb-1">
              <span className="text-xs font-semibold text-blue-600">Progress: {progressPercent}%</span>
              <span className="text-xs font-semibold text-slate-500">{answeredCount} of {questions.length} Questions</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-blue-600/10">
              <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 font-mono text-sm font-bold text-slate-300">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <TestTimer timeLimit={timeLimit} testId={testId} attemptId={attemptId} />
            </div>
          </div>

          {/* Mobile Progress Bar */}
          <div className="md:hidden w-full">
            <div className="flex w-full items-center justify-between mb-1">
              <span className="text-xs font-semibold text-blue-600">Progress: {progressPercent}%</span>
              <span className="text-xs font-semibold text-slate-500">{answeredCount}/{questions.length}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-blue-600/10">
              <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-6 grid max-w-7xl grid-cols-1 lg:grid-cols-12 gap-6 px-4 md:px-6 pb-12">
        {/* Sidebar: Question Navigation */}
        <aside className="lg:col-span-3 flex flex-col gap-6">
          <div className="rounded-xl border border-white/5 bg-slate-900 p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-400 uppercase tracking-wide">Question Map</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, index) => {
                const isAnswered = responses[questions[index].id]
                const isCurrent = index === currentQuestionIndex
                const isFlagged = flaggedQuestions.has(index)

                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`relative flex aspect-square items-center justify-center rounded-lg text-sm font-bold transition-all ${isCurrent
                      ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-2 ring-offset-slate-900'
                      : isAnswered
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : isFlagged
                          ? 'bg-orange-50 text-orange-600 border border-orange-200'
                          : 'bg-slate-800/50 text-slate-500 border border-white/5'
                      }`}
                  >
                    {index + 1}
                    {isFlagged && !isCurrent && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-orange-500">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" />
                        </svg>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            <div className="mt-6 space-y-2 border-t border-white/5 pt-4">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="h-3 w-3 rounded bg-emerald-500"></span> Answered
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="h-3 w-3 rounded bg-orange-500"></span> Flagged for Review
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="h-3 w-3 rounded border border-slate-600 bg-slate-800"></span> Not Attempted
              </div>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-sm font-bold text-white hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {submitting ? 'Submitting...' : 'Finish Attempt'}
          </button>
        </aside>

        {/* Question Area */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          {/* Attachments */}
          {attachments && attachments.length > 0 && (
            <div className="rounded-xl border border-white/5 border-l-4 border-l-blue-600 bg-slate-900 p-6 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-white">Test Materials Available</h4>
                  <p className="text-sm text-slate-500">Reference materials for this test</p>
                </div>
              </div>
              <div className="flex gap-2">
                {attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    {attachment.fileType === 'pdf' ? '📄' : '🔊'} {attachment.file.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Question Card */}
          <div className="rounded-xl border border-white/5 bg-slate-900 overflow-hidden">
            <div className="bg-slate-800/50 px-8 py-4 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded">
                  Question {currentQuestionIndex + 1}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {currentQuestion.questionType === 'mcq' ? 'Multiple Choice' : 'Fill in the Blank'} • 2 Points
                </span>
              </div>
              <button
                onClick={() => toggleFlag(currentQuestionIndex)}
                className={`flex items-center gap-2 transition-colors ${flaggedQuestions.has(currentQuestionIndex)
                  ? 'text-orange-500'
                  : 'text-slate-400 hover:text-orange-500'
                  }`}
              >
                <svg className="w-5 h-5" fill={flaggedQuestions.has(currentQuestionIndex) ? 'currentColor' : 'none'} viewBox="0 0 20 20" stroke="currentColor">
                  <path d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-wider">Flag for Review</span>
              </button>
            </div>

            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                  {successMessage}
                </div>
              )}

              <p className="text-lg font-medium leading-relaxed text-slate-100 mb-8">
                {currentQuestion.questionText}
              </p>

              {/* Multiple Choice */}
              {currentQuestion.questionType === 'mcq' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = responses[currentQuestion.id] === option.id
                    const letter = String.fromCharCode(65 + idx)

                    return (
                      <label
                        key={option.id}
                        className={`group flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${isSelected
                          ? 'border-blue-600 bg-blue-600/5'
                          : 'border-white/10 hover:border-blue-600/50 hover:bg-blue-600/5'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold transition-all ${isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 border border-white/10 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                            }`}>
                            {letter}
                          </div>
                          <span className="font-medium text-slate-200">{option.optionText}</span>
                        </div>
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={option.id}
                          checked={isSelected}
                          onChange={() => handleResponseChange(currentQuestion.id, option.id)}
                          className="h-5 w-5 text-blue-600 focus:ring-blue-600"
                        />
                      </label>
                    )
                  })}
                </div>
              )}

              {/* Fill in the Blank */}
              {currentQuestion.questionType === 'fill_blank' && (
                <input
                  type="text"
                  className="w-full rounded-lg border-2 border-slate-700 bg-slate-800 px-4 py-3 text-slate-200 focus:border-blue-600 focus:ring-0 focus:outline-none"
                  value={responses[currentQuestion.id] || ''}
                  onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
                  placeholder="Type your answer here..."
                />
              )}
            </div>

            <div className="bg-slate-800/50 px-8 py-4 border-t border-white/5">
              <div className="flex justify-between items-center mb-3">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-white/10 bg-slate-800 text-sm font-bold text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  Next Question
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400 italic">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Progress saved automatically
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
