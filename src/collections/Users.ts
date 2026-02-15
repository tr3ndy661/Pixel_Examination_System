import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'email', 'role', 'level'],
  },
  auth: true,
  access: {
    read: ({ req }) => {
      // Admins can read all users
      if (req.user && req.user.role === 'admin') return true
      
      // Users can read their own document
      return {
        id: {
          equals: req.user?.id,
        },
      }
    },
    create: ({ req }) => {
      // Only admins can create users
      return req.user && req.user.role === 'admin'
    },
    update: ({ req }) => {
      // Admins can update any user
      if (req.user && req.user.role === 'admin') return true
      
      // Users can update their own document
      return {
        id: {
          equals: req.user?.id,
        },
      }
    },
    delete: ({ req }) => {
      // Only admins can delete users
      return req.user && req.user.role === 'admin'
    },
  },
  fields: [
    // Email added by default
    {
      name: 'fullName',
      type: 'text',
      required: true,
      label: 'Full Name',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'student',
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Student',
          value: 'student',
        },
      ],
      access: {
        update: ({ req }) => req.user && req.user.role === 'admin',
      },
    },
    {
      name: 'level',
      type: 'number',
      required: true,
      defaultValue: 1,
      min: 1,
      max: 16,
      admin: {
        condition: (data) => data.role === 'student',
      },
      access: {
        update: ({ req }) => req.user && req.user.role === 'admin',
      },
    },
    {
      name: 'createdAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            if (!siblingData.createdAt) {
              return new Date()
            }
            return siblingData.createdAt
          },
        ],
      },
    },
    {
      name: 'updatedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          () => new Date(),
        ],
      },
    },
  ],
}
