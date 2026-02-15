'use client'

import React, { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

type User = {
  id: string
  email: string
  fullName?: string
  role: 'admin' | 'student'
  level?: string
}

type SidebarLayoutProps = {
  user: User
  children: React.ReactNode
}

export default function SidebarLayout({ user, children }: SidebarLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen">
      <Header user={user} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar user={user} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className={`transition-all duration-300 pt-0 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        {children}
      </div>
    </div>
  )
}
