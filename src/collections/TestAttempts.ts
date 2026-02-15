import type { CollectionConfig } from 'payload'

export const TestAttempts: CollectionConfig = {
  slug: 'test-attempts',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['test', 'student', 'startTime', 'endTime', 'score', 'status'],
  },
  access: {
    read: ({ req }) => {
      // Admins can read all attempts
      if (req.user && req.user.role === 'admin') return true
      
      // Students can only read their own attempts
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
      // Only students can create attempts
      return req.user && req.user.role === 'student'
    },
    update: ({ req }) => {
      // Students can only update their own attempts
      if (req.user && req.user.role === 'student') {
        return {
          student: {
            equals: req.user.id,
          },
          status: {
            equals: 'in_progress',
          },
        }
      }
      
      // Admins can update any attempt
      return req.user && req.user.role === 'admin'
    },
    delete: ({ req }) => {
      // Only admins can delete attempts
      return req.user && req.user.role === 'admin'
    },
  },
  fields: [
    {
      name: 'test',
      type: 'relationship',
      relationTo: 'tests',
      required: true,
      hasMany: false,
      hooks: {
        beforeChange: [
          ({ value }) => {
            // Ensure the test ID is stored as a string
            return String(value);
          },
        ],
      },
    },
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
      name: 'assignment',
      type: 'text',
      required: true,
      admin: {
        description: 'The ID of the assignment in the test.assignments array',
      },
    },
    {
      name: 'startTime',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      hooks: {
        beforeChange: [
          ({ siblingData, operation }) => {
            if (operation === 'create') {
              return new Date()
            }
            return siblingData.startTime
          },
        ],
      },
    },
    {
      name: 'endTime',
      type: 'date',
      required: false,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'score',
      type: 'number',
      required: false,
      min: 0,
      max: 100,
    },
    {
      name: 'attemptNumber',
      type: 'number',
      required: true,
      defaultValue: 1,
      min: 1,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'in_progress',
      options: [
        {
          label: 'In Progress',
          value: 'in_progress',
        },
        {
          label: 'Completed',
          value: 'completed',
        },
        {
          label: 'Timed Out',
          value: 'timed_out',
        },
      ],
    },
    {
      name: 'responses',
      type: 'array',
      label: 'Question Responses',
      fields: [
        {
          name: 'question',
          type: 'relationship',
          relationTo: 'questions',
          required: true,
          hasMany: false,
        },
        {
          name: 'response',
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
          name: 'timeSpent',
          type: 'number',
          required: true,
          defaultValue: 0,
          label: 'Time Spent (seconds)',
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        // Update the assignment status when an attempt is completed
        if (operation === 'update' && doc.status === 'completed') {
          try {
            // Ensure the test ID is a string
            const testId = String(doc.test);
            
            const test = await req.payload.findByID({
              collection: 'tests',
              id: testId,
            });
            
            if (!test || !test.assignments) {
              console.error('Test not found or has no assignments:', testId);
              return;
            }
            
            // Find the assignment in the test
            const assignmentIndex = test.assignments.findIndex(
              (assignment) => assignment.id === doc.assignment
            );
            
            if (assignmentIndex !== -1) {
              // Update the assignment status
              test.assignments[assignmentIndex].status = 'completed';
              
              // Update the test
              await req.payload.update({
                collection: 'tests',
                id: testId,
                data: {
                  assignments: test.assignments,
                },
              });
            }
          } catch (error) {
            console.error('Error updating test assignment status:', error);
          }
        }
      },
    ],
  },
} 