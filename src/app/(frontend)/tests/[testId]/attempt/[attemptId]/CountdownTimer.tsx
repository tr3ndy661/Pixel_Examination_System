'use client'

import React, { useState, useEffect } from 'react'

interface CountdownTimerProps {
  initialSeconds: number
  testId: string
  attemptId: string
}

export default function CountdownTimer({ initialSeconds, testId, attemptId }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialSeconds)

  useEffect(() => {
    // Only set up the timer if there's time remaining
    if (timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1
        return newTime > 0 ? newTime : 0
      })
    }, 1000)

    // Clear interval on component unmount
    return () => clearInterval(interval)
  }, [timeRemaining])

  // Format the time remaining
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return '00:00:00'

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0'),
    ].join(':')
  }

  // Apply different styles based on time remaining
  const getTimerStyle = () => {
    if (timeRemaining <= 300) {
      // 5 minutes remaining
      return 'text-red-600 font-bold animate-pulse'
    }
    if (timeRemaining <= 600) {
      // 10 minutes remaining
      return 'text-orange-500 font-bold'
    }
    return 'text-blue-700'
  }

  return <div className={getTimerStyle()}>{formatTime(timeRemaining)}</div>
}
