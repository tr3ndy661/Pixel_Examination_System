// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Courses } from './collections/Courses'
import { Tests } from './collections/Tests'
import { Questions } from './collections/Questions'
import { TestAttempts } from './collections/TestAttempts'
import { DriveAttachement } from './collections/DriveAttachment'
import Logs from './collections/Logs'
import Feedbacks from './collections/Feedbacks'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      icons: [
        {
          rel: 'icon',
          url: '/favicon.ico',
          type: 'image/x-icon',
        }
      ],
      titleSuffix: '- English Exam System',
      // favicon: '/favicon.ico',
      // ogImage: '/og-image.jpg',
    },
  },
  collections: [Users, Courses, Tests, Questions, TestAttempts, Logs, DriveAttachement, Feedbacks],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
})
