// Script to create an admin user in Payload CMS
import dotenv from 'dotenv';
import { getPayload } from 'payload';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// We need to dynamically import the config since it's in TypeScript
async function createAdminUser() {
  try {
    console.log('Initializing Payload...');
    
    // Import the config dynamically
    const { default: config } = await import('../dist/payload.config.js');
    
    // Initialize Payload
    const payload = await getPayload({
      secret: process.env.PAYLOAD_SECRET,
      config,
    });
    
    console.log('Checking for existing users...');
    
    // Check if users already exist
    const { docs: existingUsers } = await payload.find({
      collection: 'users',
      limit: 1,
    });
    
    if (existingUsers.length > 0) {
      console.log('Users already exist in the database.');
      console.log('Visit http://localhost:3000/admin to access the admin panel.');
    } else {
      console.log('Creating admin user...');
      
      // Create admin user
      const admin = await payload.create({
        collection: 'users',
        data: {
          email: 'admin@example.com', // Change this to your desired email
          password: 'Admin123!', // Change this to your desired password
          fullName: 'Admin User',
          role: 'admin',
        },
      });

      console.log('Admin user created successfully:');
      console.log(`Email: ${admin.email}`);
      console.log(`Role: ${admin.role}`);
      console.log(`ID: ${admin.id}`);
      console.log('\nYou can now log in at http://localhost:3000/admin');
    }
    
    // Close the database connection
    await payload.db.destroy();
  } catch (error) {
    console.error('Error creating admin user:', error);
    console.log('\nMake sure you have:');
    console.log('1. Built the project with: npm run build');
    console.log('2. Set up the .env file with DATABASE_URI and PAYLOAD_SECRET');
    console.log('\nAlternative method:');
    console.log('1. Start your application with: npm run dev');
    console.log('2. Visit http://localhost:3000/admin');
    console.log('3. You will be prompted to create the first admin user if no users exist');
  }
  
  process.exit(0);
}

createAdminUser(); 