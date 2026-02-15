'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'

type Test = {
  id: string
  title: string
  description?: string
  timeLimit?: number
  questions?: any[]
  questionCount?: number
  assignments?: any[]
}

type TestsClientProps = {
  tests: Test[]
  userId: string
}

export default function TestsClient({ tests, userId }: TestsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')

  const filteredTests = useMemo(() => {
    const now = new Date()
    
    return tests.filter((test) => {
      const assignment = test.assignments?.find(
        (a) =>
          (typeof a.student === 'string' && a.student === userId) ||
          (a.student && typeof a.student === 'object' && a.student.id === userId),
      )

      // Filter out past-dated tests
      if (assignment?.dueDate && new Date(assignment.dueDate) < now && assignment.status === 'pending') {
        return false
      }

      // Search filter
      if (searchQuery && !test.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Status filter
      if (statusFilter !== 'all') {
        const status = assignment?.status || 'pending'
        if (status !== statusFilter) {
          return false
        }
      }

      return true
    })
  }, [tests, userId, searchQuery, statusFilter])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Available Tests</h2>
            <p className="text-slate-400 mt-1">View and launch your upcoming assessments.</p>
          </div>
          <div className="w-full md:w-80">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search tests by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-white placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
          >
            All Tests
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
              statusFilter === 'pending'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
              statusFilter === 'in_progress'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
              statusFilter === 'completed'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
          >
            Completed
          </button>
        </div>
      </section>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTests.map((test) => {
          const assignment = test.assignments?.find(
            (a) =>
              (typeof a.student === 'string' && a.student === userId) ||
              (a.student && typeof a.student === 'object' && a.student.id === userId),
          )

          const status = assignment?.status || 'pending'
          const isInProgress = status === 'in_progress'
          const isCompleted = status === 'completed'

          return (
            <div
              key={test.id}
              className={`bg-slate-800/50 rounded-xl border p-5 hover:shadow-lg transition-all group relative ${
                isInProgress
                  ? 'border-blue-600 ring-1 ring-blue-600/20'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              {isInProgress && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                  In Progress
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <span
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                    isCompleted
                      ? 'bg-green-500/20 text-green-400'
                      : isInProgress
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-orange-500/20 text-orange-400'
                  }`}
                >
                  {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Pending'}
                </span>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-xs font-medium uppercase">
                    {test.timeLimit ? `${test.timeLimit} Mins` : 'Unlimited'}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors leading-tight">
                {test.title}
              </h3>
              <p className="text-sm text-slate-400 mb-6 font-medium">
                {test.description || 'No description'}
              </p>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex flex-col">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">
                    Questions
                  </span>
                  <span className="text-sm font-semibold text-slate-300">
                    {test.questionCount || test.questions?.length || 0} Items
                  </span>
                </div>
                <div className="h-8 w-px bg-slate-700" />
                <div className="flex flex-col">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">
                    {isCompleted ? 'Score' : 'Due Date'}
                  </span>
                  <span className="text-sm font-semibold text-slate-300">
                    {isCompleted
                      ? 'View Results'
                      : assignment?.dueDate
                      ? new Date(assignment.dueDate).toLocaleDateString()
                      : 'No due date'}
                  </span>
                </div>
              </div>

              <Link
                href={`/tests/${test.id}`}
                className={`w-full font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-sm shadow-md ${
                  isCompleted
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : isInProgress
                    ? 'bg-slate-900 hover:bg-black text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                }`}
              >
                {isCompleted ? 'View Results' : isInProgress ? 'Resume Test' : 'Start Test'}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isCompleted ? 'M9 5l7 7-7 7' : 'M14 5l7 7m0 0l-7 7m7-7H3'}
                  />
                </svg>
              </Link>
            </div>
          )
        })}
      </div>

      {filteredTests.length === 0 && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto text-slate-600 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-slate-400">No tests found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
