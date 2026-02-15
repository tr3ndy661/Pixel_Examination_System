import { CollectionConfig } from 'payload/types'

const TestResults: CollectionConfig = {
  slug: 'test-results',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['student', 'test', 'score', 'submittedAt'],
  },
  access: {
    read: ({ req }) => {
      // Admin can read all results
      if (req.user && req.user.role === 'admin') return true

      // Teachers can read results for their students
      if (req.user && req.user.role === 'teacher') return true

      // Students can only read their own results
      if (req.user && req.user.role === 'student') {
        return {
          student: {
            equals: req.user.id,
          },
        }
      }

      return false
    },
    create: ({ req }) => {
      // Only authenticated users can create results
      return Boolean(req.user)
    },
    update: ({ req }) => {
      // Only admins can update results
      return req.user && req.user.role === 'admin'
    },
    delete: ({ req }) => {
      // Only admins can delete results
      return req.user && req.user.role === 'admin'
    },
  },
  fields: [
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
    },
    {
      name: 'test',
      type: 'relationship',
      relationTo: 'tests',
      required: true,
      hasMany: false,
    },
    {
      name: 'attemptId',
      type: 'text',
      required: true,
    },
    {
      name: 'score',
      type: 'number',
      required: true,
      min: 0,
      max: 100,
    },
    {
      name: 'totalQuestions',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'correctAnswers',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'answers',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'questionId',
          type: 'text',
          required: true,
        },
        {
          name: 'userAnswer',
          type: 'text',
        },
        {
          name: 'isCorrect',
          type: 'checkbox',
          required: true,
        },
        {
          name: 'points',
          type: 'number',
          required: true,
        },
        {
          name: 'maxPoints',
          type: 'number',
          required: true,
        },
      ],
    },
    {
      name: 'submittedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date(),
    },
  ],
}

export default TestResults