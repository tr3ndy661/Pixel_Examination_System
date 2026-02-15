#!/bin/bash

# Script to create an admin user for Payload CMS

# Change to the project directory
cd "$(dirname "$0")"

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found."
  echo "Please create a .env file with DATABASE_URI and PAYLOAD_SECRET variables."
  exit 1
fi

# Source the .env file to get environment variables
export $(grep -v '^#' .env | xargs)

# Check if PAYLOAD_SECRET is set
if [ -z "$PAYLOAD_SECRET" ]; then
  echo "Error: PAYLOAD_SECRET is not set in .env file."
  exit 1
fi

# Check if DATABASE_URI is set
if [ -z "$DATABASE_URI" ]; then
  echo "Error: DATABASE_URI is not set in .env file."
  exit 1
fi

# Prompt for admin user details
read -p "Enter admin email (default: admin@example.com): " EMAIL
EMAIL=${EMAIL:-admin@example.com}

read -s -p "Enter admin password (default: Admin123!): " PASSWORD
PASSWORD=${PASSWORD:-Admin123!}
echo ""

read -p "Enter admin full name (default: Admin User): " FULLNAME
FULLNAME=${FULLNAME:-Admin User}

# Create a temporary JavaScript file
TMP_FILE=$(mktemp)
cat > "$TMP_FILE" << EOF
import { getPayload } from 'payload';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
  try {
    // Initialize Payload with minimal config
    const payload = await getPayload({
      secret: process.env.PAYLOAD_SECRET,
      local: true,
      db: {
        postgresAdapter: {
          pool: {
            connectionString: process.env.DATABASE_URI,
          },
        },
      },
    });

    // Create admin user
    const admin = await payload.create({
      collection: 'users',
      data: {
        email: '$EMAIL',
        password: '$PASSWORD',
        fullName: '$FULLNAME',
        role: 'admin',
      },
    });

    console.log('Admin user created successfully:');
    console.log(\`Email: \${admin.email}\`);
    console.log(\`Role: \${admin.role}\`);
    console.log(\`ID: \${admin.id}\`);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    if (error.errors) {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
    }
  }

  process.exit(0);
}

createAdmin();
EOF

# Run the temporary JavaScript file
echo "Attempting to create admin user..."
node --experimental-modules --es-module-specifier-resolution=node "$TMP_FILE"

# Clean up
rm "$TMP_FILE"

echo ""
echo "If successful, you can now log in at http://localhost:3000/admin"
echo "If you encountered errors, please try the following alternative method:"
echo "1. Start your application with: npm run dev"
echo "2. Visit http://localhost:3000/admin"
echo "3. You will be prompted to create the first admin user if no users exist" 