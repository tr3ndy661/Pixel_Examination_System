import type { CollectionConfig } from 'payload'

export const DriveAttachement: CollectionConfig = {
  slug: 'drive-attachements',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'url', 'createdAt'],
  },
  access: {
    read: ({ req }) => {
      return true;
    },
    create: ({ req }) => {
      // Only admins can create drive attachments
      return req.user && req.user.role === 'admin'
    },
    update: ({ req }) => {
      // Only admins can update drive attachments
      return req.user && req.user.role === 'admin'
    },
    delete: ({ req }) => {
      // Only admins can delete drive attachments
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
      name: 'url',
      type: 'text',
      required: true,
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