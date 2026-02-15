# Admin User Setup for English Exam System

This document provides instructions on how to create and manage admin users for the English Exam System built with Payload CMS.

> **Note:** An admin account has already been created through the Payload admin UI.

## Method 1: Using the Admin UI (Recommended)

When you first start the application and no users exist in the database, Payload CMS will automatically redirect you to the admin user creation page.

1. Start your application:

   ```bash
   cd pixel-cms
   npm run dev
   ```

2. Visit the admin panel:

   ```
   http://localhost:3000/admin
   ```

3. You will be prompted to create the first admin user with the following information:

   - Email
   - Password
   - Full Name

4. After creating the admin user, you will be able to log in and access the admin panel.

## Method 2: Using the Database Directly

If you have direct access to the PostgreSQL database, you can insert an admin user directly. However, you'll need to hash the password correctly according to Payload's requirements.

## Method 3: Using the Admin Creation Script

We've provided a script to create an admin user programmatically:

1. Make sure your environment variables are set up correctly in the `.env` file:

   ```
   DATABASE_URI=postgresql://...
   PAYLOAD_SECRET=your-secret-key
   ```

2. Run the admin creation script:

   ```bash
   cd pixel-cms
   ./create-admin.sh
   ```

3. The script will create an admin user with the following default credentials (or you can customize them when prompted):

   - Email: admin@example.com
   - Password: Admin123!
   - Full Name: Admin User

## Managing Existing Users

Since you already have an admin account, you can manage users through the admin panel:

1. Log in to the admin panel at `http://localhost:3000/admin`
2. Navigate to the "Users" collection in the sidebar
3. From here you can:
   - View all existing users
   - Create new users (both admin and student roles)
   - Edit user details
   - Reset passwords
   - Lock/unlock user accounts
   - Delete users

## User Roles and Permissions

The system has the following user roles:

- **Admin**: Full access to all system features and content
- **Student**: Limited access to take exams and view their own results

Admins can assign roles when creating or editing users.

## Troubleshooting

If you encounter any issues with user management:

1. Make sure your database connection is working correctly.
2. Check that the `PAYLOAD_SECRET` environment variable is set.
3. Ensure that the database tables have been created properly.
4. If a user is locked due to too many failed login attempts, an admin can unlock the account.

## Security Best Practices

For security reasons, it's recommended to:

1. Use strong, unique passwords for all admin accounts
2. Change the default admin password immediately after creation
3. Regularly review the user list and remove any unnecessary accounts
4. Enable two-factor authentication if available
5. Log out when not using the admin panel
