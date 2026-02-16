import React from 'react'
import Navigation from './components/Navigation'
import SidebarLayout from './components/SidebarLayout'
import { Inter } from 'next/font/google'
import { cookies } from 'next/headers'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import jwt from 'jsonwebtoken'
import '../../app/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Pixel Academy',
  description: 'Online platform for English language examinations',
}

async function getUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')
    
    if (!token) return null

    const payload = await getPayloadHMR({ config: configPromise })
    
    let decoded
    try {
      decoded = jwt.verify(token.value, process.env.PAYLOAD_SECRET || '')
    } catch (error) {
      return null
    }

    if (decoded && typeof decoded === 'object' && 'id' in decoded) {
      const { docs: users } = await payload.find({
        collection: 'users',
        where: {
          id: {
            equals: decoded.id,
          },
        },
        limit: 1,
      })

      if (users && users.length > 0) {
        return users[0]
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching user in layout:', error)
    return null
  }
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  const showSidebar = user && user.role === 'student'

  return (
    <html lang="en" className="h-full dark">
      <head>
        <link rel="icon" href="/images/Logo.jpg" />
      </head>
      <body className={`${inter.className} h-full`}>
        <div className="min-h-screen bg-slate-900">
          {showSidebar ? (
            <SidebarLayout user={user}>
              {children}
            </SidebarLayout>
          ) : (
            <>
              {children}
              {/* <footer className="bg-slate-900 border-t border-slate-800 mt-12">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-500">
                      &copy; {new Date().getFullYear()} Pixel Academy. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                      <a href="#" className="text-sm text-slate-400 hover:text-orange-500 transition-colors">Privacy Policy</a>
                      <a href="#" className="text-sm text-slate-400 hover:text-orange-500 transition-colors">Terms of Service</a>
                      <a href="#" className="text-sm text-slate-400 hover:text-orange-500 transition-colors">Contact</a>
                    </div>
                  </div>
                </div>
              </footer> */}
            </>
          )}
        </div>
      </body>
    </html>
  )
}
