import React from 'react'
import Link from 'next/link'
import { requireStudent } from '../../../lib/auth'
import { getPayloadClient } from '../../../payload'
import ResultsList from './ResultsList'

export default async function Results() {
  try {
    const user = await requireStudent()
    const payload = await getPayloadClient()

    // Fetch real test attempts (fetch all for stats)
    const { docs: testAttempts } = await payload.find({
      collection: 'test-attempts',
      where: {
        student: {
          equals: user!.id,
        },
      },
      depth: 2,
      sort: '-submittedAt',
      limit: 1000,
    })

    // Fetch mock test attempts from logs (fetch all for stats)
    const { docs: mockLogs } = await payload.find({
      collection: 'logs',
      where: {
        action: {
          equals: 'submit-mock-attempt',
        },
        'value.studentId': {
          equals: user!.id.toString(),
        },
      },
      sort: '-timestamp',
      limit: 1000,
    })

    // Combine both real and mock attempts
    const allAttempts = [
      ...testAttempts.map((attempt) => ({
        id: attempt.id.toString(), // Ensure ID is string
        testId: typeof attempt.test === 'object' ? attempt.test.id.toString() : attempt.test.toString(),
        testName: typeof attempt.test === 'object' ? attempt.test.title : 'Unknown Test',
        score: attempt.score || 0,
        submittedAt: (attempt as any).submittedAt, // Type assertion for submittedAt
        status: attempt.status || 'completed',
        test: attempt.test,
      })),
      ...mockLogs.map((log) => {
        const value = log.value as any || {}
        return {
          id: (value.attemptId || log.id).toString(),
          testId: (value.testId || '').toString(),
          testName: value.testName || 'Mock Test',
          score: value.score || 0,
          submittedAt: log.timestamp,
          status: 'completed',
          test: null,
        }
      }),
    ].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

    // Statistics Calculation
    const totalAttempts = allAttempts.length
    const averageScore =
      totalAttempts > 0
        ? Math.round(allAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts)
        : 0
    const highestScore =
      totalAttempts > 0 ? Math.max(...allAttempts.map((attempt) => attempt.score)) : 0
    const lowestScore =
      totalAttempts > 0 ? Math.min(...allAttempts.map((attempt) => attempt.score)) : 0

    const attemptsByTest: any = {}
    allAttempts.forEach((attempt) => {
      if (!attemptsByTest[attempt.testId]) {
        attemptsByTest[attempt.testId] = {
          testId: attempt.testId,
          testName: attempt.testName,
          attempts: [],
        }
      }
      attemptsByTest[attempt.testId].attempts.push(attempt)
    })

    // Prepare initial data for ResultsList (first 10 items)
    const PAGE_SIZE = 10;
    const initialList = allAttempts.slice(0, PAGE_SIZE);
    // Cursor is the timestamp of the last item in the current page
    const initialCursor = initialList.length > 0 ? initialList[initialList.length - 1].submittedAt : null;

    return (
      <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Your Test Results</h1>
          <p className="text-slate-400 max-w-2xl">
            Track your academic progress and detailed test performance across all your enrolled courses.
          </p>
        </header>

        {/* Performance Summary */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
            <p className="text-slate-400 text-sm font-medium mb-1">Total Tests</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-white">{totalAttempts}</span>
              <svg className="w-10 h-10 text-blue-600/40" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
            <p className="text-slate-400 text-sm font-medium mb-1">Average Score</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-white">{averageScore}%</span>
              <div className="w-12 h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full ${averageScore >= 70 ? 'bg-green-500' : averageScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  style={{ width: `${averageScore}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
            <p className="text-slate-400 text-sm font-medium mb-1">Highest Score</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-green-400">{highestScore}%</span>
              <svg className="w-10 h-10 text-green-400/40" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
            <p className="text-slate-400 text-sm font-medium mb-1">Lowest Score</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-red-400">{lowestScore}%</span>
              <svg className="w-10 h-10 text-red-400/40" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </section>

        {/* Recent Test Results Table (Client Component) */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            Recent Test Results
          </h2>

          <ResultsList initialResults={initialList} initialCursor={initialCursor} />
        </section>

        {/* Results by Test */}
        <section className="space-y-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Results by Test
          </h2>

          {Object.values(attemptsByTest).map((testGroup: any) => {
            const avgScore = Math.round(
              testGroup.attempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / testGroup.attempts.length,
            )
            const bestScore = Math.max(...testGroup.attempts.map((a: any) => a.score || 0))

            return (
              <div key={testGroup.testId} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">{testGroup.testName}</h3>
                    <p className="text-slate-400 text-sm">Course Module: Test Assessment</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-700">
                      <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Attempts</p>
                      <p className="text-lg font-bold text-white">{testGroup.attempts.length}</p>
                    </div>
                    <div className="text-center bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-700">
                      <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Avg. Score</p>
                      <p
                        className={`text-lg font-bold ${avgScore >= 70 ? 'text-green-400' : avgScore >= 50 ? 'text-yellow-400' : 'text-red-400'
                          }`}
                      >
                        {avgScore}%
                      </p>
                    </div>
                    <div className="text-center bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-700">
                      <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Best Score</p>
                      <p
                        className={`text-lg font-bold ${bestScore >= 70 ? 'text-green-400' : bestScore >= 50 ? 'text-yellow-400' : 'text-red-400'
                          }`}
                      >
                        {bestScore}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block bg-slate-900/30 rounded-xl overflow-hidden border border-slate-700">
                  <table className="w-full text-left text-sm">
                    <thead className="text-slate-400 border-b border-slate-700">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Score</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testGroup.attempts.map((attempt: any) => {
                        const date = attempt.submittedAt
                          ? new Date(attempt.submittedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })
                          : 'N/A'
                        const score = attempt.score || 0

                        return (
                          <tr key={attempt.id}>
                            <td className="px-4 py-4 text-slate-300 font-medium">{date}</td>
                            <td className="px-4 py-4">
                              <span
                                className={`font-bold ${score >= 70 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'
                                  }`}
                              >
                                {score}%
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <Link
                                href={`/results/${attempt.id}`}
                                className="px-4 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700/50 transition-colors font-semibold text-xs text-white"
                              >
                                View History
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {testGroup.attempts.map((attempt: any) => {
                    const date = attempt.submittedAt
                      ? new Date(attempt.submittedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                      : 'N/A'
                    const score = attempt.score || 0

                    return (
                      <div key={attempt.id} className="bg-slate-900/30 border border-slate-700 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-slate-300 text-sm font-medium">{date}</span>
                          <span
                            className={`font-bold text-lg ${score >= 70 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'
                              }`}
                          >
                            {score}%
                          </span>
                        </div>
                        <Link
                          href={`/results/${attempt.id}`}
                          className="block w-full text-center px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-700/50 transition-colors font-semibold text-xs text-white"
                        >
                          View History
                        </Link>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {Object.keys(attemptsByTest).length === 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <svg className="w-16 h-16 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                <p className="text-slate-400 font-medium">No test results available yet</p>
                <Link href="/tests" className="text-blue-600 hover:text-blue-500 text-sm font-semibold">
                  Take Your First Test →
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    )
  } catch (error) {
    console.error('Error in Results page:', error)
    return (
      <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-white mb-8">Error Loading Results</h1>
        <p className="text-slate-400">
          There was an error loading your results. Please try{' '}
          <Link href="/login?error=auth" className="text-blue-600 hover:text-blue-500 font-medium">
            logging in again
          </Link>
          .
        </p>
      </div>
    )
  }
}
