'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ResultItem, fetchResults } from './actions'

type ResultsListProps = {
    initialResults: ResultItem[]
    initialCursor?: string | null
}

export default function ResultsList({ initialResults, initialCursor }: ResultsListProps) {
    const [results, setResults] = useState<ResultItem[]>(initialResults)
    const [cursor, setCursor] = useState<string | null | undefined>(initialCursor)
    // If we got fewer than the limit initially, likely no more. Assuming limit 10 from page.tsx logic
    const [hasMore, setHasMore] = useState(initialResults.length >= 10)
    const [loading, setLoading] = useState(false)

    const loadMore = async () => {
        if (loading || !cursor) return

        setLoading(true)
        try {
            const res = await fetchResults(cursor)

            if (res.data.length > 0) {
                setResults((prev) => [...prev, ...res.data])
                setCursor(res.nextCursor)
                // If we received fewer items than requested (default 10), we are at the end
                if (res.data.length < 10) {
                    setHasMore(false)
                }
            } else {
                setHasMore(false)
            }
        } catch (error) {
            console.error('Failed to load more results:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            {/* Desktop Table */}
            <div className="hidden md:block bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-700/30 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Test Name</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-center">Score</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {results.length > 0 ? (
                                results.map((attempt) => {
                                    const date = attempt.submittedAt
                                        ? new Date(attempt.submittedAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit',
                                        })
                                        : 'N/A'

                                    return (
                                        <tr key={`${attempt.id}-${attempt.submittedAt}`} className="hover:bg-slate-700/10 transition-colors">
                                            <td className="px-6 py-5 font-medium text-white">{attempt.testName}</td>
                                            <td className="px-6 py-5 text-slate-400">{date}</td>
                                            <td className="px-6 py-5">
                                                <div className="flex justify-center">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-bold border ${attempt.score >= 70
                                                                ? 'bg-green-400/10 text-green-400 border-green-400/20'
                                                                : attempt.score >= 50
                                                                    ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'
                                                                    : 'bg-red-400/10 text-red-400 border-red-400/20'
                                                            }`}
                                                    >
                                                        {attempt.score}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex justify-center">
                                                    <span className="px-3 py-1 rounded-full bg-slate-700/40 text-slate-300 text-xs font-semibold">
                                                        completed
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <Link
                                                    href={`/results/${attempt.id}`}
                                                    className="text-blue-600 hover:text-blue-500 text-sm font-bold transition-colors"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <svg className="w-12 h-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-slate-400 font-medium">No test results yet</p>
                                            <Link href="/tests" className="text-blue-600 hover:text-blue-500 text-sm font-semibold">
                                                View Available Tests →
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4 mb-6">
                {results.length > 0 ? (
                    results.map((attempt) => {
                        const date = attempt.submittedAt
                            ? new Date(attempt.submittedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                            })
                            : 'N/A'

                        return (
                            <div key={`${attempt.id}-${attempt.submittedAt}`} className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-white">{attempt.testName}</h3>
                                        <p className="text-xs text-slate-400 mt-1">{date}</p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold border ${attempt.score >= 70
                                                ? 'bg-green-400/10 text-green-400 border-green-400/20'
                                                : attempt.score >= 50
                                                    ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'
                                                    : 'bg-red-400/10 text-red-400 border-red-400/20'
                                            }`}
                                    >
                                        {attempt.score}%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="px-3 py-1 rounded-full bg-slate-700/40 text-slate-300 text-xs font-semibold">
                                        completed
                                    </span>
                                    <Link
                                        href={`/results/${attempt.id}`}
                                        className="text-blue-600 hover:text-blue-500 text-sm font-bold transition-colors"
                                    >
                                        View Details →
                                    </Link>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <svg className="w-12 h-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-slate-400 font-medium">No test results yet</p>
                            <Link href="/tests" className="text-blue-600 hover:text-blue-500 text-sm font-semibold">
                                View Available Tests →
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Load More Button */}
            {hasMore && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading...
                            </>
                        ) : (
                            'Load More Results'
                        )}
                    </button>
                </div>
            )}
        </div>
    )
}
