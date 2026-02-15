'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the LoginForm component with no SSR
// This ensures the useSearchParams hook is only used on the client
const LoginFormWithNoSSR = dynamic(() => import('./LoginForm'), {
  ssr: false,
  loading: () => <LoginLoading />,
})

// Loading fallback for Suspense
function LoginLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        <div className="mt-6 h-8 bg-gray-200 rounded w-3/4 mx-auto animate-pulse"></div>
        <div className="mt-2 h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <div className="space-y-6">
            <div className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
            <div className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  return <LoginFormWithNoSSR />
}
