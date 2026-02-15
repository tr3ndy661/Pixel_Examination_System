# Building the English Examination System for Production

This guide provides instructions on how to build the English Examination System for production deployment.

## Prerequisites

- Node.js (v18.20.2 or >=20.9.0)
- npm or pnpm package manager
- PostgreSQL database

## Build Process

### Method 1: Using the Build Script (Recommended)

We've provided a build script that handles all the necessary steps for a production build:

1. Make the build script executable:

   ```bash
   chmod +x build.sh
   ```

2. Run the build script:

   ```bash
   ./build.sh
   ```

   This script will:

   - Clean previous build artifacts
   - Install dependencies if needed
   - Create a production environment file if it doesn't exist
   - Build the application with ESLint and TypeScript errors ignored

3. Start the production server:

   ```bash
   npm run start
   ```

### Method 2: Manual Build Process

If you prefer to build the application manually:

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a production environment file:

   ```bash
   cp .env .env.production
   ```

3. Build the application:

   ```bash
   npm run build
   ```

4. Start the production server:

   ```bash
   npm run start
   ```

## Environment Variables

Ensure the following environment variables are set in your `.env.production` file:

```
DATABASE_URI=postgresql://username:password@hostname:port/database
PAYLOAD_SECRET=your_secret_key
NEXT_PUBLIC_SERVER_URL=https://your-production-domain.com
NODE_ENV=production
```

## Troubleshooting Build Issues

If you encounter build errors:

1. **ESLint Errors**: These are handled by the configuration in `.eslintrc.json` and `next.config.mjs`. The build script ignores these errors.

2. **TypeScript Errors**: These are also ignored during the build process. Fix them for better code quality, but they won't block the build.

3. **Client Component Errors**: Ensure all client components that use hooks like `useSearchParams()` are wrapped in a Suspense boundary.

4. **Database Connection Issues**: Verify your `DATABASE_URI` is correct and the database is accessible.

5. **Missing Dependencies**: If you see module not found errors, run `npm install` to ensure all dependencies are installed.

## Deployment Considerations

- Set up proper HTTPS for production environments
- Configure database backups
- Set up monitoring for the application
- Consider using a process manager like PM2 to keep the application running

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Payload CMS Production Considerations](https://payloadcms.com/docs/production/overview)
- [PostgreSQL Production Checklist](https://wiki.postgresql.org/wiki/Detailed_installation_guides)
