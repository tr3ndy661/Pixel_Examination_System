import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getPayloadClient } from '../../../../../../payload'
import { getCurrentUser } from '../../../../../../lib/auth'
import MockAttemptClient from './MockAttemptClient'

export default async function MockAttempt({
  params,
  searchParams,
}: {
  params: { testId: string; attemptId: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { testId, attemptId } = await Promise.resolve(params)
  const searchParamsObj = await Promise.resolve(searchParams)
  const studentId = typeof searchParamsObj.studentId === 'string' ? searchParamsObj.studentId : ''
  const assignmentId = typeof searchParamsObj.assignmentId === 'string' ? searchParamsObj.assignmentId : ''

  const user = await getCurrentUser()

  if (!user) {
    return redirect('/login?redirect=' + encodeURIComponent(`/tests/${testId}`))
  }

  if (studentId && String(user.id) !== studentId) {
    return redirect('/tests')
  }

  const payload = await getPayloadClient()

  let test
  try {
    test = await payload.findByID({
      collection: 'tests',
      id: testId,
      depth: 2,
    })
  } catch (error) {
    console.error('Error fetching test:', error)
    return (
      <div className="p-8 text-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4 text-red-400">
          <p>Error: Could not fetch test details.</p>
        </div>
        <Link href="/tests" className="text-blue-600 hover:text-blue-500">
          Back to Tests
        </Link>
      </div>
    )
  }

  let questions = []
  try {
    const questionsResult = await payload.find({
      collection: 'questions',
      where: {
        test: {
          equals: testId,
        },
      },
      sort: 'orderNumber',
      depth: 2,
    })
    questions = questionsResult.docs
  } catch (error) {
    console.error('Error fetching questions:', error)
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <MockAttemptClient
        testId={testId}
        attemptId={attemptId}
        testTitle={test.title}
        timeLimit={test.timeLimit}
        questions={questions}
        attachments={test.attachments || []}
      />
    </div>
  )
}
