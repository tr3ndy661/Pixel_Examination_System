'use client'

import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function ProfileStatusMessages() {
  const searchParams = useSearchParams()

  // Check for success or error messages
  const success = searchParams.get('success') === 'true'
  const error = searchParams.get('error')

  // Get error message based on error code
  let errorMessage = ''
  if (error) {
    switch (error) {
      case 'password_mismatch':
        errorMessage = 'Passwords do not match. Please try again.'
        break
      case 'update_failed':
        errorMessage = 'Failed to update profile. Please try again.'
        break
      default:
        errorMessage = 'An error occurred. Please try again.'
    }
  }

  if (!success && !error) return null

  return (
    <>
      {/* Success message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex justify-between items-center">
          <span>Profile updated successfully!</span>
          <Link href="/profile" className="text-green-700 font-bold">
            ×
          </Link>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex justify-between items-center">
          <span>{errorMessage}</span>
          <Link href="/profile" className="text-red-700 font-bold">
            ×
          </Link>
        </div>
      )}
    </>
  )
}
