#!/bin/bash

# Script to start the English Exam System

# Display welcome message
echo "====================================================="
echo "      English Examination System Starter Script      "
echo "====================================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found."
  echo "Please create a .env file with the following variables:"
  echo "  DATABASE_URI=postgres://username:password@localhost:5432/english_exam_system"
  echo "  PAYLOAD_SECRET=your_secret_key"
  echo "  NEXT_PUBLIC_SERVER_URL=http://localhost:3000"
  exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start the application
echo "Starting the application..."
echo "This may take a moment..."
echo ""
npm run dev

# This part will only execute if npm run dev exits
echo ""
echo "Application has stopped."
echo ""
echo "To access the application:"
echo "  - Admin Panel: http://localhost:3000/admin"
echo "  - Student Panel: http://localhost:3000"
echo ""
echo "For more information on setting up admin users, see ADMIN_SETUP.md" 