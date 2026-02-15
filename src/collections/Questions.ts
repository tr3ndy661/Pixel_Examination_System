import type { CollectionConfig } from 'payload'

export const Questions: CollectionConfig = {
  slug: 'questions',
  admin: {
    useAsTitle: 'questionText',
    defaultColumns: ['questionText', 'questionType', 'testTitle', 'points'],
  },
  access: {
    read: ({ req }) => {
      // Admins can read all questions
      if (req.user && req.user.role === 'admin') return true
      
      // Students can only read questions for tests assigned to them
      if (req.user && req.user.role === 'student') {
        return true // This will be filtered at the API level
      }
      
      return false
    },
    create: ({ req }) => {
      // Only admins can create questions
      return req.user && req.user.role === 'admin'
    },
    update: ({ req }) => {
      // Only admins can update questions
      return req.user && req.user.role === 'admin'
    },
    delete: ({ req }) => {
      // Only admins can delete questions
      return req.user && req.user.role === 'admin'
    },
  },
  fields: [
    {
      name: 'questionText',
      type: 'textarea',
      required: true,
    },
    {
      name: 'questionType',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Multiple Choice',
          value: 'mcq',
        },
        {
          label: 'Fill in the Blank',
          value: 'fill_blank',
        },
      ],
    },
    {
      name: 'test',
      type: 'relationship',
      relationTo: 'tests',
      required: true,
      hasMany: false,
    },
    {
      name: 'testTitle',
      type: 'text',
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          async ({ data, req }) => {
            if (data.test) {
              const test = await req.payload.findByID({
                collection: 'tests',
                id: data.test,
              })
              return test.title
            }
            return undefined
          },
        ],
      },
    },
    {
      name: 'points',
      type: 'number',
      required: true,
      min: 1,
      defaultValue: 1,
    },
    {
      name: 'orderNumber',
      type: 'number',
      required: true,
      defaultValue: 1,
      admin: {
        description: 'The order in which this question appears in the test',
      },
    },
    {
      name: 'options',
      type: 'array',
      label: 'Answer Options',
      admin: {
        condition: (data) => data.questionType === 'mcq',
      },
      fields: [
        {
          name: 'optionText',
          type: 'text',
          required: true,
        },
        {
          name: 'isCorrect',
          type: 'checkbox',
          required: true,
          defaultValue: false,
        },
        {
          name: 'orderNumber',
          type: 'number',
          required: true,
          defaultValue: 1,
        },
      ],
    },
    {
      name: 'correctAnswer',
      type: 'text',
      required: false,
      admin: {
        condition: (data) => data.questionType === 'fill_blank',
        description: 'The correct answer for fill-in-the-blank questions',
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