'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SubmissionModal from './SubmissionModal'

interface SubmitButtonProps {
  testId: string
  attemptId: string
  questions: any[]
}

export default function SubmitButton({ testId, attemptId, questions }: SubmitButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  const handleSubmit = () => {
    if (isSubmitting) return
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

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

  // Helper function to collect answers from the form
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

  return (
    <>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-blue-300"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Test'}
      </button>

      <SubmissionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        testId={testId}
        attemptId={attemptId}
        onConfirm={handleConfirmSubmission}
        questions={questions}
      />
    </>
  )
}
