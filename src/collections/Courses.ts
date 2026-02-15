import type { CollectionConfig } from 'payload'

export const Courses: CollectionConfig = {
  slug: 'courses',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'level', 'createdBy', 'createdAt'],
  },
  access: {
    read: ({ req }) => {
      // Admins can read all courses
      if (req.user && req.user.role === 'admin') return true
      
      // Students can only read courses assigned to their level
      if (req.user && req.user.role === 'student') {
        return {
          level: {
            equals: req.user.level,
          },
        }
      }
      
      return false
    },
    create: ({ req }) => {
      // Only admins can create courses
      return req.user && req.user.role === 'admin'
    },
    update: ({ req }) => {
      // Only admins can update courses
      return req.user && req.user.role === 'admin'
    },
    delete: ({ req }) => {
      // Only admins can delete courses
      return req.user && req.user.role === 'admin'
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'level',
      type: 'number',
      required: true,
      min: 1,
      max: 9,
      defaultValue: 1,
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ req }) => {
            return req.user.id
          },
        ],
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