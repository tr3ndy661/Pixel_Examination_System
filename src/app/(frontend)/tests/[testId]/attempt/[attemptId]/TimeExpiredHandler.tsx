'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface TimeExpiredHandlerProps {
  testId: string
  attemptId: string
}

export default function TimeExpiredHandler({ testId, attemptId }: TimeExpiredHandlerProps) {
  const router = useRouter()
  const [isHandling, setIsHandling] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const handleTimeExpired = async () => {
      if (isHandling) return // Prevent multiple calls

      setIsHandling(true)

      try {
        // Notify the server that time has expired
        const response = await fetch(`/api/tests/${testId}/attempt/${attemptId}/time-expired`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to handle time expiration')
        }

        // Redirect to the test results page
        router.push(`/results/${attemptId}`)
      } catch (error) {
        console.error('Error handling time expiration:', error)
        setErrorMessage(error.message || 'Failed to submit test. Please try again.')
        setTimeout(() => {
          // Even if error occurs, redirect after 5 seconds
          router.push(`/tests/${testId}`)
        }, 5000)
      }
    }

    // Call the function when the component mounts
    handleTimeExpired()
  }, [attemptId, testId, router, isHandling])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="mb-4 text-red-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12 mx-auto"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-4">Time Expired</h2>
        <p className="mb-4">
          Your test time has expired. Your answers have been automatically submitted.
        </p>
        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{errorMessage}</div>
        )}
        <div className="animate-pulse mb-4">
          <span className="inline-block w-6 h-6 bg-blue-600 rounded-full mr-1"></span>
          <span className="inline-block w-6 h-6 bg-blue-600 rounded-full mr-1"></span>
          <span className="inline-block w-6 h-6 bg-blue-600 rounded-full"></span>
        </div>
        <p className="text-sm text-gray-600">Redirecting you...</p>
      </div>
    </div>
  )
}
