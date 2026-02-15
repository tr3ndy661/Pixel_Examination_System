'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

interface TestTimerProps {
  testId: string
  attemptId: string
  timeLimit: number // in minutes
}

export default function TestTimer({ testId, attemptId, timeLimit }: TestTimerProps) {
  const router = useRouter()
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60) // Convert to seconds
  const [isWarning, setIsWarning] = useState(false)

  // Use refs to track submission state across renders
  const isSubmittingRef = useRef(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handleConfirmSubmission = async () => {
    try {
      // Collect all answers from the form
      const answers = collectAnswers()

      // Submit the test
      const response = await fetch(`/api/tests/${testId}/submit-attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attemptId,
          answers,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          score: data.score,
          gradingDetails: data.gradingDetails,
          message: data.message,
        }
      } else {
        const data = await response.json()
        return {
          success: false,
          message: data.message || 'Unknown error',
        }
      }
    } catch (error) {
      console.error('Error submitting test:', error)
      return {
        success: false,
        message: 'An error occurred while submitting your test. Please try again.',
      }
    }
  }

  const collectAnswers = () => {
    const answers = {}

    // Get all radio buttons and text inputs
    const radioButtons = document.querySelectorAll('input[type="radio"]:checked')
    const textInputs = document.querySelectorAll('.fill-blank-input')

    // Collect radio button answers (MCQs)
    radioButtons.forEach((radio) => {
      const input = radio as HTMLInputElement
      const name = input.name
      const value = input.value

      // Extract the question ID from the name attribute (format: question-{id})
      const questionId = name.replace('question-', '')

      answers[questionId] = value
    })

    // Collect text input answers (fill in the blanks)
    textInputs.forEach((input) => {
      const textInput = input as HTMLInputElement
      // Find the closest parent element with a data-question-id attribute
      const questionContainer = textInput.closest('[data-question-id]')

      if (questionContainer) {
        const questionId = questionContainer.getAttribute('data-question-id')
        if (questionId) {
          answers[questionId] = textInput.value
        }
      }
    })

    return answers
  }

  // Separate function to handle time-up event
  const handleTimeUp = async () => {
    // Prevent multiple submissions
    if (isSubmittingRef.current) {
      return
    }

    // Set submission flag
    isSubmittingRef.current = true

    try {
      // Submit the test
      const result = await handleConfirmSubmission()

      // Show alert once
      if (result.success) {
        alert(`Time is up! Your test has been submitted. Score: ${result.score}`)
      } else {
        alert(`Time is up! ${result.message}`)
      }

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error in time-up handler:', error)
      alert('Time is up! There was an error submitting your test.')
      router.push('/dashboard')
    }
  }

  useEffect(() => {
    // Set up the timer
    timerRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        // If time is up and not already submitting
        if (prevTime <= 1 && !isSubmittingRef.current) {
          // Clear the interval immediately
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }

          // Trigger submission flow
          handleTimeUp()
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, []) // Empty dependency array - only run once on mount

  // Separate effect for warning state
  useEffect(() => {
    if (timeRemaining <= 300 && !isWarning) {
      setIsWarning(true)
    }
  }, [timeRemaining, isWarning])

  // Format time as MM:SS
  const formatTime = () => {
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div
      className={`font-mono text-lg font-bold ${isWarning ? 'text-red-300 animate-pulse' : 'text-white'}`}
    >
      Time Remaining: {formatTime()}
    </div>
  )
}