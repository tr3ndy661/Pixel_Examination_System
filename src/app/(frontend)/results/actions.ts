'use server'

import { getPayloadClient } from '../../../payload'
import { requireStudent } from '../../../lib/auth'

export type ResultItem = {
    id: string
    testId: string
    testName: string
    score: number
    submittedAt: string
    status: string
    test?: any
}

export async function fetchResults(cursor?: string, limit: number = 10) {
    try {
        const user = await requireStudent()

        if (!user) {
            throw new Error('Unauthorized')
        }

        const payload = await getPayloadClient()

        // Query for real test attempts
        const testAttemptsQuery: any = {
            collection: 'test-attempts',
            where: {
                student: {
                    equals: user.id,
                },
            },
            depth: 2,
            sort: '-submittedAt',
            limit: limit,
        }

        if (cursor) {
            testAttemptsQuery.where.submittedAt = {
                less_than: cursor,
            }
        }

        const { docs: testAttempts } = await payload.find(testAttemptsQuery)

        // Query for mock attempts (logs)
        const logsQuery: any = {
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
            limit: limit,
        }

        if (cursor) {
            logsQuery.where.timestamp = {
                less_than: cursor,
            }
        }

        const { docs: mockLogs } = await payload.find(logsQuery)

        // Merge and sort
        const allAttempts = [
            ...testAttempts.map((attempt: any) => ({
                id: attempt.id,
                testId: typeof attempt.test === 'object' ? attempt.test.id : attempt.test,
                testName: typeof attempt.test === 'object' ? attempt.test.title : 'Unknown Test',
                score: attempt.score || 0,
                submittedAt: attempt.submittedAt,
                status: attempt.status || 'completed',
                test: attempt.test,
            })),
            ...mockLogs.map((log: any) => {
                const value = log.value || {}
                return {
                    id: value.attemptId || log.id,
                    testId: value.testId || '',
                    testName: value.testName || 'Mock Test',
                    score: value.score || 0,
                    submittedAt: log.timestamp,
                    status: 'completed',
                    test: null,
                }
            }),
        ].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

        // Apply limit to merged list
        const pagedResults = allAttempts.slice(0, limit)
        const nextCursor = pagedResults.length > 0 ? pagedResults[pagedResults.length - 1].submittedAt : null

        // Check if there might be more
        // A simple heuristic: if we got full limit from either source, there might be more.
        // Or simpler: if we sliced, there's more? No.
        // Ideally we fetch limit+1 to know for sure, but for now returned cursor is enough. 
        // If next fetch returns empty, we stop.

        return {
            data: pagedResults,
            nextCursor,
            hasMore: pagedResults.length === limit // Approximate, client will try to fetch more if this is true and user clicks
        }

    } catch (error) {
        console.error('Error fetching results:', error)
        return { data: [], nextCursor: null, hasMore: false, error: 'Failed to fetch results' }
    }
}
