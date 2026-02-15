import { getPayloadClient } from './src/payload.ts';

async function createUser() {
  try {
    console.log('Getting payload client...');
    const payload = await getPayloadClient();
    console.log('Payload client obtained');
    
    console.log('Creating user...');
    const user = await payload.create({
      collection: 'users',
      data: {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        role: 'student',
        level: 1
      }
    });
    
    console.log('User created:', user.id);
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

createUser();
