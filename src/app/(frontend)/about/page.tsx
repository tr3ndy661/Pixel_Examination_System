import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function About() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-100/20 pt-14">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              About Pixel Academy
            </h1>
            <div className="mt-10 grid max-w-xl grid-cols-1 gap-8 text-base leading-7 text-gray-700 lg:max-w-none lg:grid-cols-2">
              <div>
                <p>
                  Pixel Academy is dedicated to providing high-quality English language assessment
                  through our comprehensive online examination platform. Our mission is to make
                  English language testing accessible, efficient, and accurate for students of all
                  levels.
                </p>
                <p className="mt-8">
                  Founded by language education experts, our platform combines modern technology
                  with proven assessment methodologies to deliver a seamless testing experience that
                  truly measures English proficiency.
                </p>
              </div>
              <div>
                <p>
                  We believe that accurate assessment is the foundation of effective learning. Our
                  tests are designed to provide meaningful feedback that helps students identify
                  their strengths and areas for improvement.
                </p>
                <p className="mt-8">
                  Whether you&apos;re a student preparing for an exam or an educator looking to
                  evaluate language proficiency, Pixel Academy provides the tools and resources you
                  need to succeed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Our Platform Features
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Discover what makes our English examination system unique and effective.
          </p>
        </div>
        <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 text-base leading-7 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          <div className="relative pl-10">
            <dt className="font-semibold text-gray-900">
              <svg
                className="absolute left-0 top-1 h-6 w-6 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
              Comprehensive Assessment
            </dt>
            <dd className="mt-2 text-gray-600">
              Our tests evaluate various aspects of English language skills, providing a complete
              picture of proficiency.
            </dd>
          </div>
          <div className="relative pl-10">
            <dt className="font-semibold text-gray-900">
              <svg
                className="absolute left-0 top-1 h-6 w-6 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"
                />
              </svg>
              Instant Results
            </dt>
            <dd className="mt-2 text-gray-600">
              Get immediate feedback on objective questions, allowing for quick understanding of
              performance.
            </dd>
          </div>
          <div className="relative pl-10">
            <dt className="font-semibold text-gray-900">
              <svg
                className="absolute left-0 top-1 h-6 w-6 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                />
              </svg>
              Adaptive Difficulty
            </dt>
            <dd className="mt-2 text-gray-600">
              Tests are tailored to different proficiency levels, ensuring appropriate challenges
              for all students.
            </dd>
          </div>
          <div className="relative pl-10">
            <dt className="font-semibold text-gray-900">
              <svg
                className="absolute left-0 top-1 h-6 w-6 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                />
              </svg>
              Multimedia Content
            </dt>
            <dd className="mt-2 text-gray-600">
              Our platform incorporates audio and visual elements to test listening comprehension
              and other skills.
            </dd>
          </div>
          <div className="relative pl-10">
            <dt className="font-semibold text-gray-900">
              <svg
                className="absolute left-0 top-1 h-6 w-6 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
              Student Progress Tracking
            </dt>
            <dd className="mt-2 text-gray-600">
              Monitor improvement over time with detailed performance analytics and progress
              reports.
            </dd>
          </div>
          <div className="relative pl-10">
            <dt className="font-semibold text-gray-900">
              <svg
                className="absolute left-0 top-1 h-6 w-6 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
              Secure Testing Environment
            </dt>
            <dd className="mt-2 text-gray-600">
              Our platform ensures test integrity with various security measures and anti-cheating
              protocols.
            </dd>
          </div>
        </dl>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-50">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:justify-between lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ready to test your English proficiency?
            <br />
            Start with Pixel Academy today.
          </h2>
          <div className="mt-10 flex items-center gap-x-6 lg:mt-0 lg:flex-shrink-0">
            <Link
              href="/login"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
