import React from 'react'
import { getCurrentUser } from '../../lib/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  if (user.role === 'student') {
    redirect('/dashboard')
  }
  
  if (user.role === 'admin') {
    redirect('/admin')
  }
  
  redirect('/login')
}
