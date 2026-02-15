import React, { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayloadClient } from '../../../payload'
import { requireStudent } from '../../../lib/auth'
import ProfileStatusMessages from './ProfileStatusMessages'

async function updateProfile(formData: FormData) {
  'use server'

  try {
    const userId = formData.get('userId') as string
    const fullName = formData.get('fullName') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!userId || !fullName) {
      throw new Error('Missing required fields')
    }

    if (password && password !== confirmPassword) {
      return redirect('/profile?error=password_mismatch')
    }

    const payload = await getPayloadClient()

    const updateData: Record<string, any> = {
      fullName,
    }

    if (password) {
      updateData.password = password
    }

    await payload.update({
      collection: 'users',
      id: userId,
      data: updateData,
    })

    return redirect('/profile?success=true')
  } catch (error) {
    console.error('Error updating profile:', error)
    return redirect('/profile?error=update_failed')
  }
}

export default async function Profile() {
  try {
    const user = await requireStudent()

    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Your Profile</h1>

        <Suspense fallback={<div className="h-12"></div>}>
          <ProfileStatusMessages />
        </Suspense>

        <div className="bg-slate-800/50 rounded-xl shadow-sm p-6 mb-8 border border-slate-700">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-white">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-slate-400 mb-1">Full Name</p>
                <p className="font-medium text-lg text-white">{user.fullName || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Email</p>
                <p className="font-medium text-lg text-white">{user.email}</p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Level</p>
                <p className="font-medium text-lg text-white">{user.level || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Account Status</p>
                <p className="font-medium text-lg text-white">Active</p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Account Created</p>
                <p className="font-medium text-lg text-white">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Last Updated</p>
                <p className="font-medium text-lg text-white">
                  {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <h2 className="text-2xl font-semibold mb-4 text-white">Update Profile</h2>
            <form action={updateProfile} className="space-y-4">
              <input type="hidden" name="userId" value={user.id} />

              <div>
                <label htmlFor="fullName" className="block text-white mb-1 font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  defaultValue={user.fullName || ''}
                  className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-slate-400"
                  disabled
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-white mb-1 font-medium">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  defaultValue={user.email}
                  className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-slate-400"
                  disabled
                />
                <p className="text-sm text-slate-400 mt-1">
                  Email cannot be changed. Please contact an administrator for assistance.
                </p>
              </div>

              {/* <div>
                <label htmlFor="password" className="block text-white mb-1 font-medium">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-slate-400"
                  disabled
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-white mb-1 font-medium">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-slate-400"
                  disabled
                />
              </div> */}

              {/* <div className="flex justify-end space-x-4 pt-4">
                <Link
                  href="/dashboard"
                  className="px-6 py-2 border border-slate-600 rounded-lg hover:bg-slate-700 text-white transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div> */}
            </form>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error in Profile page:', error)
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Error Loading Profile</h1>
        <p className="text-slate-400">
          There was an error loading your profile. Please try{' '}
          <Link href="/login?error=auth" className="text-blue-600 hover:text-blue-500 font-medium">
            logging in again
          </Link>
          .
        </p>
      </div>
    )
  }
}
