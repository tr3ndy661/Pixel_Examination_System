'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [rating, setRating] = useState(0)
  const [easeOfUse, setEaseOfUse] = useState('')
  const [features, setFeatures] = useState('')
  const [performance, setPerformance] = useState('')
  const [wouldRecommend, setWouldRecommend] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedback.trim() || rating === 0 || !easeOfUse || !features || !performance || !wouldRecommend) {
      setMessage('Please answer all questions')
      return
    }

    setSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comments: feedback,
          rating,
          easeOfUse,
          features,
          performance,
          recommendation: wouldRecommend,
        }),
      })

      if (response.ok) {
        setMessage('Thank you for your feedback!')
        setFeedback('')
        setRating(0)
        setEaseOfUse('')
        setFeatures('')
        setPerformance('')
        setWouldRecommend('')
        setTimeout(() => {
          setIsOpen(false)
          setMessage('')
        }, 2000)
      } else {
        setMessage('Failed to submit feedback. Please try again.')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative px-4 py-2 bg-blue-600 text-white rounded-lg font-medium overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <span className="hidden sm:inline">Feedback</span>
        </span>
        <span className="absolute inset-0 animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-bold text-white">System Feedback Questionnaire</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Overall Rating
                  </label>
                  <div className="flex gap-1 md:gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-colors"
                      >
                        <svg
                          className="w-7 h-7 md:w-8 md:h-8"
                          fill={star <= rating ? '#FCD34D' : 'none'}
                          stroke={star <= rating ? '#FCD34D' : '#64748B'}
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    How easy is the system to use?
                  </label>
                  <div className="space-y-2">
                    {['Very Easy', 'Easy', 'Neutral', 'Difficult', 'Very Difficult'].map((option) => (
                      <label key={option} className="flex items-center gap-2 md:gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="easeOfUse"
                          value={option}
                          checked={easeOfUse === option}
                          onChange={(e) => setEaseOfUse(e.target.value)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-600 flex-shrink-0"
                        />
                        <span className="text-sm md:text-base text-slate-300">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Are the features meeting your needs?
                  </label>
                  <div className="space-y-2">
                    {['Exceeds Expectations', 'Meets Expectations', 'Partially Meets', 'Does Not Meet'].map((option) => (
                      <label key={option} className="flex items-center gap-2 md:gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="features"
                          value={option}
                          checked={features === option}
                          onChange={(e) => setFeatures(e.target.value)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-600 flex-shrink-0"
                        />
                        <span className="text-sm md:text-base text-slate-300">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    How would you rate the system performance?
                  </label>
                  <div className="space-y-2">
                    {['Excellent', 'Good', 'Average', 'Poor', 'Very Poor'].map((option) => (
                      <label key={option} className="flex items-center gap-2 md:gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="performance"
                          value={option}
                          checked={performance === option}
                          onChange={(e) => setPerformance(e.target.value)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-600 flex-shrink-0"
                        />
                        <span className="text-sm md:text-base text-slate-300">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Would you recommend this system to others?
                  </label>
                  <div className="space-y-2">
                    {['Definitely', 'Probably', 'Not Sure', 'Probably Not', 'Definitely Not'].map((option) => (
                      <label key={option} className="flex items-center gap-2 md:gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="wouldRecommend"
                          value={option}
                          checked={wouldRecommend === option}
                          onChange={(e) => setWouldRecommend(e.target.value)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-600 flex-shrink-0"
                        />
                        <span className="text-sm md:text-base text-slate-300">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Additional Comments or Suggestions
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm md:text-base placeholder-slate-500 focus:border-blue-600 focus:ring-0 focus:outline-none"
                    placeholder="Tell us what you think or suggest improvements..."
                    required
                  />
                </div>

                {message && (
                  <div className={`p-3 rounded-lg text-sm ${
                    message.includes('Thank you') 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {message}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shine {
          animation: shine 3s infinite;
        }
      `}</style>
    </>
  )
}
