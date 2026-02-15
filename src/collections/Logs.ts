import { CollectionConfig } from 'payload/types'

const Logs: CollectionConfig = {
  slug: 'logs',
  admin: {
    useAsTitle: 'action',
    defaultColumns: ['action', 'timestamp', 'user'],
  },
  access: {
    read: ({ req }) => {
      // Admin can read all logs
      if (req.user && req.user.role === 'admin') return true

      // Students can only read their own logs
      if (req.user && req.user.role === 'student') {
        return {
          user: {
            equals: req.user.id,
          },
        }
      }

      return false
    },
    create: () => true, // Allow creation from API routes
    update: ({ req }) => req.user && req.user.role === 'admin',
    delete: ({ req }) => req.user && req.user.role === 'admin',
  },
  fields: [
    {
      name: 'action',
      type: 'text',
      required: true,
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      defaultValue: () => new Date(),
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: false,
    },
    {
      name: 'value',
      type: 'json',
      required: false,
    },
    {
      name: 'details',
      type: 'text',
      required: false,
    },
  ],
}

export default Logs 