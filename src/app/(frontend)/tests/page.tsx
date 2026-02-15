import React from 'react'
import Link from 'next/link'
import { getPayloadClient } from '../../../payload'
import { requireStudent } from '../../../lib/auth'
import TestsClient from './TestsClient'

export default async function Tests() {
  try {
    const user = await requireStudent()
    const payload = await getPayloadClient()

    const { docs: tests } = await payload.find({
      collection: 'tests',
      where: {
        'assignments.student': {
          equals: user.id,
        },
      },
      depth: 2,
    })

    // Fetch question counts for each test
    const testsWithQuestionCounts = await Promise.all(
      tests.map(async (test) => {
        const { totalDocs } = await payload.find({
          collection: 'questions',
          where: {
            test: {
              equals: test.id,
            },
          },
          limit: 0,
        })
        return {
          ...test,
          questionCount: totalDocs,
        }
      })
    )

    return <TestsClient tests={testsWithQuestionCounts} userId={user.id} />
  } catch (error) {
    console.error('Error in Tests page:', error)
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-white mb-8">Error Loading Tests</h1>
        <p className="text-slate-400">
          There was an error loading your tests. Please try{' '}
          <Link href="/login?error=auth" className="text-blue-600 hover:text-blue-500 font-medium">
            logging in again
          </Link>
          .
        </p>
      </div>
    )
  }
}
