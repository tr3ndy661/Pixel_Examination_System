'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

interface StartTestButtonProps {
  testId: string
}

export default function StartTestButton({ testId }: StartTestButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  const handleStartAttempt = async () => {
    setLoading(true)
    setError('')
    setStatusMessage('Initializing test attempt...')

    try {
      setStatusMessage('Sending request to start test...')
      const response = await fetch(`/api/tests/${testId}/start-attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })


      // Handle different response statuses
      if (response.status === 401) {
        setError('You need to be logged in to start a test. Please refresh the page and try again.')
        setLoading(false)
        return
      }

      if (response.status === 403) {
        const data = await response.json()
        setError(data.error || 'You do not have permission to start this test.')
        setLoading(false)
        return
      }

      if (response.status === 400) {
        const data = await response.json()
        setError(data.error || 'There was an issue with your test attempt request.')
        setLoading(false)
        return
      }

      if (response.status === 500) {
        // For 500 errors, try to parse the response and check if we should retry
        try {
          const data = await response.json()

          // If we haven't retried too many times, try again automatically
          if (retryCount < 3) {
            setRetryCount(retryCount + 1)
            setStatusMessage(
              `Server error encountered. Retrying automatically (${retryCount + 1}/3)...`,
            )

            // Wait a moment before retrying
            setTimeout(() => {
              handleStartAttempt()
            }, 2000)
            return
          }

          setError(
            data.error ||
              'Server error. The system is having trouble creating your test attempt. Please try again later.',
          )
          setLoading(false)
        } catch (parseError) {
          setError('Server error. Please try again later.')
          setLoading(false)
        }
        return
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to start test attempt')
      }

      // If the response is a redirect, follow it
      const redirectUrl = response.url
      setStatusMessage('Test started! Redirecting to test page...')
      router.push(redirectUrl)
    } catch (err: any) {
      console.error('Client: Error starting test attempt:', err)

      // If we haven't retried too many times, try again automatically
      if (retryCount < 3) {
        setRetryCount(retryCount + 1)
        setStatusMessage(`Error encountered. Retrying automatically (${retryCount + 1}/3)...`)

        // Wait a moment before retrying
        setTimeout(() => {
          handleStartAttempt()
        }, 2000)
        return
      }

      setError(err.message || 'Failed to start test attempt. Please try again.')
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setRetryCount(0)
    handleStartAttempt()
  }

  return (
    <div>
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-slate-300">
            <span className="font-bold text-white">Note:</span> Once you start, the timer will begin and cannot be paused.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-bold text-red-500">Error</p>
              <p className="text-sm text-slate-400">{error}</p>
              <button onClick={handleRetry} className="mt-2 text-sm text-blue-500 hover:text-blue-400 font-semibold">
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {statusMessage && loading && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div>
              <p className="font-bold text-blue-500">Status</p>
              <p className="text-sm text-slate-400">{statusMessage}</p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleStartAttempt}
        className={`w-full flex justify-center items-center py-3 px-6 rounded-lg text-white font-bold transition-all ${loading ? 'bg-blue-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        disabled={loading}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Starting Test...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Test
          </>
        )}
      </button>

      {loading && (
        <p className="mt-3 text-xs text-center text-slate-500">
          This may take a few moments. Please don't refresh the page.
        </p>
      )}
    </div>
  )
}
