'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function ResultsClient({ attempt, user }) {
  const [filter, setFilter] = useState('all')
  const [selectedQuestion, setSelectedQuestion] = useState(0)

  const filteredDetails = attempt.gradingDetails.filter((detail) => {
    if (filter === 'incorrect') return !detail.isCorrect
    if (filter === 'flagged') return detail.flagged
    return true
  })

  const getQuestionData = (detail) => {
    const question = attempt.questions.find((q) => q.id?.toString() === detail.questionId?.toString())
    return question || null
  }

  const getUserAnswer = (detail) => {
    const question = getQuestionData(detail)
    if (!question || !detail.userAnswer) return 'No answer provided'

    if (question.questionType === 'mcq') {
      const option = question.options?.find((opt) => opt.id === detail.userAnswer)
      return option?.optionText || detail.userAnswer
    }
    return detail.userAnswer
  }

  const getCorrectAnswer = (detail) => {
    const question = getQuestionData(detail)
    if (!question) return 'Not available'

    if (question.questionType === 'mcq') {
      const option = question.options?.find((opt) => opt.isCorrect)
      return option?.optionText || 'Not available'
    }
    return question.correctAnswer || 'Not available'
  }

  const passingScore = 70
  const isPassed = attempt.score >= passingScore
  const timeTaken = '45m 12s'

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <main className="flex-1 px-4 py-8 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl text-white">
                {attempt.testName}
              </h1>
              <p className="mt-2 text-slate-500">
                Completed on {new Date(attempt.submittedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="relative overflow-hidden rounded-xl p-6 border bg-slate-900 border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Total Score</span>
                <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${isPassed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {isPassed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">{attempt.score}</span>
                <span className="text-xl font-bold text-slate-400">/ 100</span>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Passing: {passingScore}%</span>
                  <span className={isPassed ? 'text-green-600' : 'text-red-600'}>{isPassed ? 'PASSED' : 'FAILED'}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800">
                  <div className={`h-2 rounded-full ${isPassed ? 'bg-blue-600' : 'bg-red-600'}`} style={{ width: `${attempt.score}%` }} />
                </div>
              </div>
            </div>

            <div className="rounded-xl p-6 border bg-slate-900 border-slate-800">
              <div className="flex items-center gap-3 text-slate-400 mb-2">
                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-bold uppercase tracking-wider">Correct</span>
              </div>
              <p className="text-3xl font-black text-white">{attempt.correctCount}</p>
              <p className="text-xs text-slate-500 mt-1">out of {attempt.totalQuestions} questions</p>
            </div>

            <div className="rounded-xl p-6 border bg-slate-900 border-slate-800">
              <div className="flex items-center gap-3 text-slate-400 mb-2">
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-bold uppercase tracking-wider">Incorrect</span>
              </div>
              <p className="text-3xl font-black text-white">{attempt.incorrectCount}</p>
              <p className="text-xs text-slate-500 mt-1">needs review</p>
            </div>

            <div className="rounded-xl p-6 border bg-slate-900 border-slate-800">
              <div className="flex items-center gap-3 text-slate-400 mb-2">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-bold uppercase tracking-wider">Time Taken</span>
              </div>
              <p className="text-3xl font-black text-white">{timeTaken}</p>
              <p className="text-xs text-slate-500 mt-1">Average: 52m 00s</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-72 shrink-0 space-y-6">
              <div className="rounded-xl p-4 border bg-slate-900 border-slate-800">
                <h3 className="mb-4 text-sm font-bold text-white px-2">Question Navigator</h3>
                <div className="grid grid-cols-5 gap-2">
                  {attempt.gradingDetails.map((detail, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedQuestion(idx)}
                      className={`flex h-10 w-10 items-center justify-center rounded text-sm font-bold cursor-pointer transition-all ${
                        detail.isCorrect
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      } ${selectedQuestion === idx ? 'ring-2 ring-blue-600' : 'hover:ring-2 hover:ring-blue-600'}`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-slate-900 p-6 border border-slate-800">
                <h3 className="font-bold text-blue-600 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                  </svg>
                  Performance Insight
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {isPassed 
                    ? `Great job! You scored ${attempt.score}%. Keep up the excellent work!`
                    : `You scored ${attempt.score}%. Review the incorrect answers to improve your understanding.`
                  }
                </p>
              </div>
            </aside>

            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex gap-2 overflow-x-auto">
                  <button
                    onClick={() => setFilter('all')}
                    className={`rounded-lg px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors ${
                      filter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    All Questions ({attempt.totalQuestions})
                  </button>
                  <button
                    onClick={() => setFilter('incorrect')}
                    className={`rounded-lg px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors ${
                      filter === 'incorrect'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    Incorrect Only ({attempt.incorrectCount})
                  </button>
                </div>
              </div>

              {filteredDetails.map((detail, idx) => {
                const question = getQuestionData(detail)
                const actualIdx = attempt.gradingDetails.indexOf(detail)

                return (
                  <div
                    key={actualIdx}
                    className="rounded-xl p-6 border-l-4 border-y border-r bg-slate-900 border-slate-800"
                    style={{ borderLeftColor: detail.isCorrect ? '#10B981' : '#EF4444' }}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-400">Question {actualIdx + 1}</span>
                      <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-widest ${detail.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          {detail.isCorrect ? (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          )}
                        </svg>
                        {detail.isCorrect ? `Correct (+${detail.points} pts)` : `Incorrect (0 pts)`}
                      </div>
                    </div>

                    <h4 className="text-lg font-bold text-white leading-snug mb-6">
                      {question?.questionText || 'Question not available'}
                    </h4>

                    {question?.questionType === 'mcq' && (
                      <div className="space-y-3">
                        {question.options?.map((option) => {
                          const isUserAnswer = detail.userAnswer === option.id
                          const isCorrectAnswer = option.isCorrect

                          return (
                            <div
                              key={option.id}
                              className={`flex items-center justify-between rounded-lg p-4 ${
                                isUserAnswer && isCorrectAnswer
                                  ? 'border-2 bg-green-500/10 border-green-500'
                                  : isUserAnswer
                                  ? 'border-2 bg-red-500/10 border-red-500'
                                  : isCorrectAnswer
                                  ? 'border-2 bg-green-500/10 border-green-500'
                                  : 'border border-slate-800'
                              }`}
                            >
                              <div className="flex flex-col">
                                <span className={`text-sm font-bold ${
                                  isUserAnswer && isCorrectAnswer
                                    ? 'text-green-400'
                                    : isUserAnswer
                                    ? 'text-red-400'
                                    : isCorrectAnswer
                                    ? 'text-green-400'
                                    : 'text-slate-300'
                                }`}>
                                  {option.optionText}
                                </span>
                                {(isUserAnswer || isCorrectAnswer) && (
                                  <span className="text-[10px] uppercase font-black mt-0.5" style={{ color: isUserAnswer && isCorrectAnswer ? '#10B981' : isUserAnswer ? '#EF4444' : '#10B981', opacity: 0.6 }}>
                                    {isUserAnswer && isCorrectAnswer ? 'Your Choice • Correct Answer' : isUserAnswer ? 'Your Answer' : 'Correct Answer'}
                                  </span>
                                )}
                              </div>
                              {(isUserAnswer || isCorrectAnswer) && (
                                <svg className={`w-6 h-6 ${isCorrectAnswer ? 'text-green-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
                                  {isCorrectAnswer ? (
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  ) : (
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  )}
                                </svg>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {question?.questionType === 'fill_blank' && (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-slate-400 mb-2">Your Answer:</p>
                          <div className={`p-3 rounded-lg border-2 ${detail.isCorrect ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`}>
                            <span className={`font-bold ${detail.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                              {getUserAnswer(detail)}
                            </span>
                          </div>
                        </div>
                        {!detail.isCorrect && (
                          <div>
                            <p className="text-sm font-medium text-slate-400 mb-2">Correct Answer:</p>
                            <div className="p-3 rounded-lg border-2 bg-green-500/10 border-green-500">
                              <span className="font-bold text-green-400">{getCorrectAnswer(detail)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {question?.explanation && (
                      <div className="mt-6 rounded-lg bg-slate-800/50 p-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-1">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          Explanation
                        </div>
                        <p className="text-sm text-slate-400">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
