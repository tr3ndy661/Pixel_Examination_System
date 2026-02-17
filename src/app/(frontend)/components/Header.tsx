'use client'

import React from 'react'
import Link from 'next/link'
import FeedbackButton from './FeedbackButton'

type User = {
  id: number
  email: string
  fullName?: string
  role: 'admin' | 'student'
  level?: number | null
}

type HeaderProps = {
  user: User
  onMenuClick: () => void
}

export default function Header({ user, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-slate-800 border-b border-slate-700 h-16">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/Logo.jpg" alt="Pixel Academy" className="w-8 h-8 rounded-lg object-cover" />
            <span className="hidden sm:block text-lg font-bold text-white">Pixel Academy</span>
          </Link>
        </div>

        {/* Right: User Info */}
        <div className="flex items-center gap-3">
          <FeedbackButton />
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-white">
              {user.fullName || user.email.split('@')[0]}
            </p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {user.fullName ? user.fullName.charAt(0) : user.email.charAt(0)}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
