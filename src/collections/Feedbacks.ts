import { CollectionConfig } from 'payload/types'

const Feedbacks: CollectionConfig = {
  slug: 'feedbacks',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'rating', 'recommendation', 'createdAt'],
  },
  access: {
    read: ({ req }) => req.user && req.user.role === 'admin',
    create: () => true,
    update: ({ req }) => req.user && req.user.role === 'admin',
    delete: ({ req }) => req.user && req.user.role === 'admin',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      admin: {
        description: 'User who submitted the feedback',
      },
      hasMany: false,
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
    },
    {
      name: 'easeOfUse',
      type: 'text',
      required: false,
    },
    {
      name: 'features',
      type: 'text',
      required: false,
    },
    {
      name: 'performance',
      type: 'text',
      required: false,
    },
    {
      name: 'recommendation',
      type: 'text',
      required: false,
      admin: {
        description: 'Would you recommend this system to others?',
      },
    },
    {
      name: 'comments',
      type: 'textarea',
      required: false,
      admin: {
        description: 'Additional comments or suggestions',
      },
    },
  ],
}

export default Feedbacks
