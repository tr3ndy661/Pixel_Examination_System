# Authentication Troubleshooting Guide

This guide provides solutions for common authentication issues in the English Examination System.

## Login Issues

### Invalid Email or Password

If you receive an "Invalid email or password" error:

1. Double-check that you're using the correct email address and password
2. Ensure caps lock is not enabled
3. If you've forgotten your password, contact an administrator to reset it

### Session Expired

If you're redirected to the login page with a "Your session has expired" message:

1. This is normal if you haven't used the application for a while
2. Simply log in again with your credentials

## API Authentication Issues

If you're a developer working with the API and encountering authentication issues:

1. Ensure the `payload-token` cookie is being properly set during login
2. JWT verification should use the `jsonwebtoken` library with the `PAYLOAD_SECRET` environment variable
3. The token should be retrieved asynchronously from cookies in server components
4. Proper error handling should be implemented for token verification failures

## Student Access Issues

If you're a student and encounter errors when accessing student pages:

1. Try logging out and logging back in to refresh your session
2. If using a different browser or clearing your cache resolves the issue, your browser may have cached outdated data
3. If the issue persists, contact an administrator as the application may need to be restarted
4. If you're stuck in a redirect loop, try clearing your cookies for this site

## Role-Based Access Issues

If you're being redirected to the wrong pages based on your role:

1. Ensure you're using the correct account for your role (admin or student)
2. If you believe your account has the wrong role assigned, contact an administrator
3. Administrators should use the admin panel at `/admin`
4. Students should access the dashboard at `/dashboard` and tests at `/tests`

## Next.js Server Component Authentication

For developers working with Next.js Server Components:

1. Always use `await` when calling `cookies()` methods
2. Wrap authentication logic in try/catch blocks to handle errors gracefully
3. Use the helper functions in `auth.ts` like `requireAuth()`, `requireAdmin()`, and `requireStudent()` for protected routes
4. JWT verification is handled manually using the `jsonwebtoken` library

## Environment Variables

Ensure these environment variables are properly set:

- `PAYLOAD_SECRET`: Used for JWT token verification
- `DATABASE_URI`: MongoDB connection string

If you continue to experience authentication issues after trying these solutions, please contact the system administrator.
