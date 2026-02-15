'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface GradingResult {
  questionId: string | number
  userAnswer: string
  isCorrect: boolean
  points: number
  maxPoints: number
}

interface SubmissionModalProps {
  isOpen: boolean
  onClose: () => void
  testId: string
  attemptId: string
  onConfirm: () => Promise<{
    success: boolean
    score?: number
    gradingDetails?: GradingResult[]
    message?: string
  }>
  questions: any[]
}

export default function SubmissionModal({
  isOpen,
  onClose,
  testId,
  attemptId,
  onConfirm,
  questions,
}: SubmissionModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<'confirm' | 'results' | 'error'>('confirm')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState<{
    score: number
    gradingDetails: GradingResult[]
    message?: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && step === 'confirm') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscKey)
    return () => window.removeEventListener('keydown', handleEscKey)
  }, [isOpen, onClose, step])

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  const handleConfirmSubmission = async () => {
    setIsSubmitting(true)
    try {
      const result = await onConfirm()
      if (result.success && result.score !== undefined && result.gradingDetails) {
        setResults({
          score: result.score,
          gradingDetails: result.gradingDetails,
          message: result.message,
        })
        setStep('results')
      } else {
        setError(result.message || 'An error occurred during submission')
        setStep('error')
      }
    } catch (error) {
      console.error('Error submitting test:', error)
      setError('An unexpected error occurred. Please try again.')
      setStep('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewAllTests = () => {
    router.push('/tests')
  }

  const handleViewResults = () => {
    router.push('/results')
  }

  // Find question text by ID
  const getQuestionText = (questionId: string | number) => {
    const question = questions.find((q) => q.id.toString() === questionId.toString())
    return question ? question.questionText : 'Question not found'
  }

  // Find correct answer by question ID
  const getCorrectAnswer = (questionId: string | number) => {
    const question = questions.find((q) => q.id.toString() === questionId.toString())

    if (!question) return 'Not available'

    if (question.questionType === 'mcq') {
      const correctOption = question.options.find((opt) => opt.isCorrect)
      return correctOption ? correctOption.text : 'Not available'
    } else if (question.questionType === 'fill_blank') {
      return question.correctAnswer || 'Not available'
    }

    return 'Not available'
  }

  // Get formatted user answer (for display)
  const getFormattedUserAnswer = (detail: GradingResult) => {
    const question = questions.find((q) => q.id.toString() === detail.questionId.toString())

    if (!question) return detail.userAnswer || 'No answer provided'

    if (question.questionType === 'mcq') {
      // For MCQ, find the option text that matches the selected option ID
      const selectedOption = question.options.find((opt) => opt.id === detail.userAnswer)
      return selectedOption ? selectedOption.text : detail.userAnswer
    } else {
      // For fill-in-the-blank, just return the user's answer
      return detail.userAnswer || 'No answer provided'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {step === 'confirm' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Submit Test</h2>
            <p className="mb-6">
              Are you sure you want to submit your test? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmission}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        )}

        {step === 'results' && results && (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold mb-2">Test Results</h2>
              <div className="flex items-center mb-4">
                <div className="text-4xl font-bold text-blue-600">{results.score}%</div>
                <div className="ml-4">
                  <div className="text-sm text-gray-500">Your Score</div>
                  <div className="text-sm text-gray-500">
                    {results.gradingDetails.filter((d) => d.isCorrect).length} of{' '}
                    {results.gradingDetails.length} questions correct
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto p-6 flex-grow">
              <h3 className="text-lg font-semibold mb-4">Question Summary</h3>
              <div className="space-y-6">
                {results.gradingDetails.map((detail, index) => (
                  <div
                    key={detail.questionId}
                    className={`p-4 rounded-lg ${
                      detail.isCorrect
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">Question {index + 1}</h4>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          detail.isCorrect
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {detail.isCorrect ? 'Correct' : 'Incorrect'} ({detail.points}/
                        {detail.maxPoints} points)
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{getQuestionText(detail.questionId)}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                      <div>
                        <p className="text-sm text-gray-500">Your Answer:</p>
                        <p
                          className={`font-medium ${detail.isCorrect ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {getFormattedUserAnswer(detail)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Correct Answer:</p>
                        <p className="font-medium text-green-600">
                          {getCorrectAnswer(detail.questionId)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleViewAllTests}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Back to Tests
                </button>
                <button
                  onClick={handleViewResults}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  View All Results
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="mb-6">
              {error || 'An error occurred during submission. Please try again.'}
            </p>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
