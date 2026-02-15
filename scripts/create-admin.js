// Script to create an admin user in Payload CMS
require('dotenv').config();
const path = require('path');

// Import the getPayloadClient function from your project
async function createAdminUser() {
  try {
    // Dynamically import ESM modules
    const { getPayloadClient } = await import('../src/payload.ts');
    
    // Get the payload client
    const payload = await getPayloadClient();
    
    // Check if users already exist
    const { docs: existingUsers } = await payload.find({
      collection: 'users',
      limit: 1,
    });
    
    if (existingUsers.length > 0) {
      console.log('Users already exist in the database. First user should be created via the admin UI.');
      console.log('Visit http://localhost:3000/admin to access the admin panel.');
      process.exit(0);
    }
    
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
  } catch (error) {
    console.error('Error creating admin user:', error);
    console.log('\nAlternative method:');
    console.log('1. Start your application with: npm run dev');
    console.log('2. Visit http://localhost:3000/admin');
    console.log('3. You will be prompted to create the first admin user if no users exist');
  }
  
  process.exit(0);
}

createAdminUser(); 