import React from 'react'
import Link from 'next/link'
import { getPayloadClient } from '../../../../payload'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../../../lib/auth'
import StartTestButton from './StartTestButton'

export default async function TestDetail({ params }: { params: { testId: string } }) {
  const resolvedParams = await Promise.resolve(params)
  const testId = resolvedParams.testId

  try {
    const payload = await getPayloadClient()
    const user = await getCurrentUser()

    if (!user) return redirect('/login')
    if (user.role === 'admin') return redirect('/admin')

    const test = await payload.findByID({
      collection: 'tests',
      id: testId,
      depth: 2,
    })

    const assignment = test.assignments?.find((a) => {
      const studentId = typeof a.student === 'object' && a.student !== null ? a.student.id : a.student
      return studentId === user.id
    })

    if (!assignment) return redirect('/tests')

    const { docs: attempts } = await payload.find({
      collection: 'test-attempts',
      where: {
        test: { equals: testId },
        student: { equals: user.id },
      },
      sort: '-startTime',
    })

    const completedAttempts = attempts.filter((attempt) => attempt.status === 'completed')
    const inProgressAttempt = attempts.find((attempt) => attempt.status === 'in_progress')

    let totalCompletedAttempts = completedAttempts.length
    try {
      const { docs: loggedAttempts } = await payload.find({
        collection: 'logs',
        where: {
          and: [
            { action: { equals: 'submit-mock-attempt' } },
            { 'value.testId': { equals: testId } },
            { user: { equals: user.id } },
          ],
        },
      })
      totalCompletedAttempts += loggedAttempts.length
    } catch (error) {
      console.error('Error fetching logged attempts:', error)
    }

    const canStartNewAttempt = totalCompletedAttempts < test.attemptLimit && !inProgressAttempt

    const { docs: questions } = await payload.find({
      collection: 'questions',
      where: { test: { equals: testId } },
      sort: 'orderNumber',
    })

    const dueDate = new Date(assignment.dueDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <Link href="/tests" className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-6 font-medium transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Tests
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">{test.title}</h1>
          <p className="text-slate-400">{test.courseTitle || 'Course Assessment'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Test Overview</h2>
              <p className="text-slate-300 mb-6">{test.description || 'No description provided.'}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">Time Limit</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{test.timeLimit} min</p>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-sm font-medium">Questions</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{questions.length}</p>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm font-medium">Attempts</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{totalCompletedAttempts} / {test.attemptLimit}</p>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">Due Date</span>
                  </div>
                  <p className="text-lg font-bold text-white">{dueDate}</p>
                </div>
              </div>
            </div>

            {test.attachments && test.attachments.length > 0 && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Test Materials</h2>
                <div className="space-y-3">
                  {test.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment.file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-blue-600 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{attachment.fileType === 'pdf' ? '📄' : '🔊'}</span>
                        <span className="text-white font-medium">{attachment.file.title}</span>
                      </div>
                      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {completedAttempts.length > 0 && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                  <h2 className="text-xl font-bold text-white">Previous Attempts</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-900/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Attempt</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Score</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {completedAttempts.map((attempt) => (
                        <tr key={attempt.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="px-6 py-4 text-white font-medium">#{attempt.attemptNumber}</td>
                          <td className="px-6 py-4 text-slate-400">{new Date(attempt.endTime).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              attempt.score >= 70 ? 'bg-green-500/20 text-green-400' :
                              attempt.score >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {attempt.score}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link href={`/results/${attempt.id}`} className="text-blue-600 hover:text-blue-500 font-semibold text-sm">
                              View Results
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Start Test</h2>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-slate-300">
                  This test contains <span className="font-bold text-white">{questions.length} questions</span> and you have{' '}
                  <span className="font-bold text-white">{test.timeLimit} minutes</span> to complete it.
                </p>
              </div>

              {inProgressAttempt && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-orange-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-bold text-orange-500 mb-1">Attempt in Progress</p>
                      <p className="text-sm text-slate-400 mb-3">Continue from where you left off.</p>
                      <Link
                        href={`/tests/${testId}/attempt/${inProgressAttempt.id}`}
                        className="inline-block px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-sm transition-colors"
                      >
                        Continue Attempt
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {canStartNewAttempt && <StartTestButton testId={testId} />}

              {!canStartNewAttempt && !inProgressAttempt && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-bold text-red-500 mb-1">Maximum Attempts Reached</p>
                      <p className="text-sm text-slate-400">You have used all allowed attempts.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error in test detail page:', error)
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h2 className="text-xl font-bold text-red-500 mb-4">Error Loading Test</h2>
          <p className="text-slate-400 mb-4">There was an error loading the test details.</p>
          <Link href="/tests" className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
            Back to Tests
          </Link>
        </div>
      </div>
    )
  }
}
