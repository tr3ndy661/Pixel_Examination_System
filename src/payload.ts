import type { Payload } from 'payload'
import { getPayload } from 'payload'
import config from './payload.config'

let cachedPayload: Payload | null = null

export const getPayloadClient = async (): Promise<Payload> => {
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error('PAYLOAD_SECRET environment variable is missing')
  }
  
  if (!process.env.DATABASE_URI) {
    throw new Error('DATABASE_URI environment variable is missing')
  }

  if (cachedPayload) {
    return cachedPayload
  }

  try {
    const payload = await getPayload({
      config,
    })

    cachedPayload = payload
    return payload
  } catch (error) {
    console.error('Failed to initialize Payload:', error)
    throw error
  }
} 