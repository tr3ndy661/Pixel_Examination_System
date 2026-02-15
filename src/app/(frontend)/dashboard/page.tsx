import React from 'react'
import Link from 'next/link'
import { requireStudent } from '../../../lib/auth'
import { getPayloadClient } from '../../../payload'

export default async function Dashboard() {
  try {
    const payload = await getPayloadClient()
    const user = await requireStudent()

    const { docs: tests } = await payload.find({
      collection: 'tests',
      where: {
        'assignments.student': {
          equals: user.id,
        },
      },
      depth: 2,
    })

    const { docs: testAttempts } = await payload.find({
      collection: 'test-attempts',
      where: {
        student: {
          equals: user.id,
        },
      },
      depth: 2,
      sort: '-submittedAt',
      limit: 4,
    })

    const { docs: mockLogs } = await payload.find({
      collection: 'logs',
      where: {
        action: {
          equals: 'submit-mock-attempt',
        },
        'value.studentId': {
          equals: user.id.toString(),
        },
      },
      sort: '-timestamp',
      limit: 4,
    })

    const allAttempts = [
      ...testAttempts.map((attempt) => ({
        id: attempt.id,
        testName: typeof attempt.test === 'object' ? attempt.test.title : 'Unknown Test',
        score: attempt.score || 0,
        submittedAt: attempt.submittedAt,
        status: attempt.status || 'completed',
      })),
      ...mockLogs.map((log) => {
        const value = log.value || {}
        return {
          id: value.attemptId || log.id,
          testName: value.testName || 'Mock Test',
          score: value.score || 0,
          submittedAt: log.timestamp,
          status: 'completed',
        }
      }),
    ].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).slice(0, 4)

    const completedTests = allAttempts.filter(a => a.status === 'completed')
    const totalCompleted = completedTests.length
    const averageScore = totalCompleted > 0 
      ? Math.round(completedTests.reduce((sum, a) => sum + a.score, 0) / totalCompleted)
      : 0
    
    const totalMinutes = testAttempts.reduce((sum, attempt) => {
      const test = typeof attempt.test === 'object' ? attempt.test : null
      return sum + (test?.timeLimit || 0)
    }, 0)
    const studyHours = (totalMinutes / 60).toFixed(1)

    const now = new Date()
    const pendingTests = tests.filter((test) => {
      const userAssignment = Array.isArray(test.assignments)
        ? test.assignments.find(
            (a) =>
              (typeof a.student === 'string' && a.student === user.id) ||
              (a.student && typeof a.student === 'object' && a.student.id === user.id),
          )
        : null
      
      if (!userAssignment || userAssignment.status !== 'pending') return false
      
      if (userAssignment.dueDate) {
        const dueDate = new Date(userAssignment.dueDate)
        if (dueDate < now) return false
      }
      
      return true
    }).slice(0, 2)

    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome back, <span className="text-orange-500">{user.fullName || user.email.split('@')[0]}</span>!
              </h2>
              <p className="text-slate-400 mt-1">
                Track your progress and continue your learning journey.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-800">
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Current Level</p>
                <p className="text-blue-600 font-semibold">{user.level || 'Not Assigned'}</p>
              </div>
              <div className="text-blue-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-800 hover:border-slate-600 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Active</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">Average Score</p>
            <p className="text-2xl font-bold text-white">{averageScore}%</p>
          </div>

          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-800 hover:border-slate-600 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="text-blue-600">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-400">Total</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">Tests Completed</p>
            <p className="text-2xl font-bold text-white">{totalCompleted}</p>
          </div>

          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-800 hover:border-slate-600 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-400">Total</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">Study Hours</p>
            <p className="text-2xl font-bold text-white">{studyHours}h</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Upcoming Tests</h3>
              <Link href="/tests" className="text-blue-600 text-sm font-medium hover:text-blue-500">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {pendingTests.length > 0 ? (
                pendingTests.map((test) => {
                  const assignment = test.assignments?.find(
                    (a) =>
                      (typeof a.student === 'string' && a.student === user.id) ||
                      (a.student && typeof a.student === 'object' && a.student.id === user.id),
                  )
                  
                  return (
                    <div key={test.id} className="bg-slate-800/50 p-5 rounded-xl border border-blue-600">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-white">{test.title}</h4>
                        <span className="text-[10px] font-bold uppercase bg-slate-800 px-2 py-1 rounded text-slate-500">
                          Pending
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mb-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {test.timeLimit} mins
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {assignment?.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}
                        </div>
                      </div>
                      <Link
                        href={`/tests/${test.id}`}
                        className="w-full block text-center py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Start Test
                      </Link>
                    </div>
                  )
                })
              ) : (
                <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-800 text-center">
                  <p className="text-slate-400">No upcoming tests</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Recent Results</h3>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden md:block bg-slate-800/50 rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">Test Name</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">Date</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">Score</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {allAttempts.length > 0 ? (
                    allAttempts.map((attempt) => {
                      const isPassed = attempt.score >= 70
                      
                      return (
                        <tr key={attempt.id}>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-white">{attempt.testName}</p>
                            <p className="text-xs text-slate-400">Test Attempt</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400">
                            {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-white">{attempt.score}/100</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${
                              isPassed 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {isPassed ? 'PASSED' : 'RETAKE OK'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              href={`/results/${attempt.id}`}
                              className="text-blue-600 text-sm font-medium hover:text-blue-500"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                        No test results yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {allAttempts.length > 0 && (
                <div className="p-4 bg-slate-900/50 border-t border-slate-800 text-center">
                  <Link
                    href="/results"
                    className="text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Show All History
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {allAttempts.length > 0 ? (
                allAttempts.map((attempt) => {
                  const isPassed = attempt.score >= 70
                  
                  return (
                    <div key={attempt.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm font-bold text-white">{attempt.testName}</p>
                          <p className="text-xs text-slate-400">Test Attempt</p>
                        </div>
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${
                          isPassed 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {isPassed ? 'PASSED' : 'RETAKE OK'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-slate-400">
                          {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : 'N/A'}
                        </span>
                        <span className="text-sm font-bold text-white">{attempt.score}/100</span>
                      </div>
                      <Link
                        href={`/results/${attempt.id}`}
                        className="block w-full text-center py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  )
                })
              ) : (
                <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-800 text-center">
                  <p className="text-slate-400">No test results yet</p>
                </div>
              )}
              {allAttempts.length > 0 && (
                <div className="text-center pt-2">
                  <Link
                    href="/results"
                    className="text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Show All History
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    )
  } catch (error) {
    console.error('Error in Dashboard page:', error)
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-white mb-8">Error Loading Dashboard</h1>
        <p className="text-slate-400">
          There was an error loading your dashboard. Please try{' '}
          <Link href="/login?error=auth" className="text-blue-600 hover:text-blue-500 font-medium">
            logging in again
          </Link>
          .
        </p>
      </div>
    )
  }
}
