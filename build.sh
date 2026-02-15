#!/bin/bash

# Clean build script for pixel-cms

echo "====================================================="
echo "      English Examination System Build Script        "
echo "====================================================="
echo ""

# Clean previous build artifacts
echo "Cleaning previous build artifacts..."
rm -rf .next
rm -rf node_modules/.cache

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ "$1" == "--fresh" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Create production env file if it doesn't exist
if [ ! -f ".env.production" ]; then
  echo "Creating production environment file..."
  cp .env .env.production
fi

# Run the build with ESLint and TypeScript errors ignored
echo "Building production application..."
ESLINT_NO_DEV_ERRORS=true NODE_OPTIONS=--no-deprecation npm run build

# Check build status
if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Build completed successfully!"
  echo ""
  echo "To start the production server:"
  echo "  npm run start"
else
  echo ""
  echo "❌ Build failed. Please check the errors above."
fi 