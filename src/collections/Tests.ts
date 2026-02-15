import type { CollectionConfig } from 'payload'

export const Tests: CollectionConfig = {
  slug: 'tests',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'courseTitle', 'timeLimit', 'attemptLimit', 'createdAt'],
  },
  access: {
    read: ({ req }) => {
      // Admins can read all tests
      if (req.user && req.user.role === 'admin') return true

      // Students can only read tests assigned to them
      if (req.user && req.user.role === 'student') {
        return {
          'assignments.student': {
            equals: req.user.id,
          },
        }
      }

      return false
    },
    create: ({ req }) => {
      // Only admins can create tests
      return req.user && req.user.role === 'admin'
    },
    update: ({ req }) => {
      // Only admins can update tests
      return req.user && req.user.role === 'admin'
    },
    delete: ({ req }) => {
      // Only admins can delete tests
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
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      hasMany: false,
    },
    {
      name: 'courseTitle',
      type: 'text',
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          async ({ data, req }) => {
            if (data.course) {
              const course = await req.payload.findByID({
                collection: 'courses',
                id: data.course,
              })
              return course.title
            }
            return undefined
          },
        ],
      },
    },
    {
      name: 'timeLimit',
      type: 'number',
      required: true,
      min: 1,
      defaultValue: 60,
      label: 'Time Limit (minutes)',
    },
    {
      name: 'attemptLimit',
      type: 'number',
      required: true,
      min: 1,
      defaultValue: 1,
      label: 'Attempt Limit',
    },
    {
      name: 'testType',
      type: 'select',
      required: true,
      defaultValue: 'pdf',
      options: [
        {
          label: 'PDF',
          value: 'pdf',
        },
        {
          label: 'Audio',
          value: 'audio',
        },
        {
          label: 'Both',
          value: 'both',
        },
      ],
    },
    {
      name: 'attachments',
      type: 'array',
      label: 'Attachments',
      fields: [
        {
          name: 'fileType',
          type: 'select',
          required: true,
          options: [
            {
              label: 'PDF',
              value: 'pdf',
            },
            {
              label: 'Audio',
              value: 'audio',
            },
          ],
        },
        // {
        //   name: 'file',
        //   type: 'upload',
        //   relationTo: 'media',
        //   required: true,
        // },
        {
          name: 'file',
          type: 'relationship',
          relationTo: 'drive-attachements',
          required: true
        }
      ],
    },
    {
      name: 'assignments',
      type: 'array',
      label: 'Student Assignments',
      admin: {
        description: 'Assign this test to students',
      },
      fields: [
        {
          name: 'student',
          type: 'relationship',
          relationTo: 'users',
          required: true,
          hasMany: false,
          filterOptions: {
            role: {
              equals: 'student',
            },
          },
        },
        {
          name: 'dueDate',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'pending',
          options: [
            {
              label: 'Pending',
              value: 'pending',
            },
            {
              label: 'In Progress',
              value: 'in_progress',
            },
            {
              label: 'Completed',
              value: 'completed',
            },
          ],
        },
      ],
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