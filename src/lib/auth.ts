import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayloadClient } from '../payload'
import jwt from 'jsonwebtoken'



// Custom function to sign a token with consistent options
export const signToken = (payload: any) => {
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error('Missing PAYLOAD_SECRET environment variable')
  }


  return jwt.sign(payload, process.env.PAYLOAD_SECRET, {
    expiresIn: '24h', // 2 hours
  })
}

// Custom function to verify a token with consistent options
export const verifyToken = (token: string) => {
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error('Missing PAYLOAD_SECRET environment variable')
  }



  try {
    // Use the same secret and options as signToken for consistency
    const decoded = jwt.verify(token, process.env.PAYLOAD_SECRET)
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    throw error
  }
}

export const getCurrentUser = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('payload-token');
    
    if (!token) {
      return null;
    }
    
    const payload = await getPayloadClient();
    
    const decoded = verifyToken(token.value);
    
    if (decoded && typeof decoded === 'object' && 'id' in decoded) {
      const { docs: users } = await payload.find({
        collection: 'users',
        where: {
          id: {
            equals: decoded.id,
          },
        },
        limit: 1,
      });
      
      if (users && users.length > 0) {
        return users[0];
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}


// export const getCurrentUser = async () => {
//   try {
//     console.log('Getting payload client');
//     const payload = await getPayloadClient();
//     console.log('Payload client obtained');

//     // Try to get the user from the payload client directly
//     try {
//       console.log('Attempting to get user from payload client');
//       // Use find method instead of request since request is not available
//       const { docs: users } = await payload.find({
//         collection: 'users',
//         where: {
//           // This will find the currently authenticated user if any
//           // We'll rely on the cookie-based authentication that Payload uses internally
//         },
//         limit: 1,
//       });

//       if (users && users.length > 0) {
//         console.log('User found from payload client');
//         return users[0];
//       }
//     } catch (payloadError) {
//       console.error('Error getting user from payload client:', payloadError);
//     }

//     // If that fails, try to get the user from the token in cookies
//     console.log('Attempting to get user from token in cookies');
//     const cookieStore = await cookies(); // Properly await cookies()
//     const token = cookieStore.get('payload-token')?.value;

//     if (token) {
//       console.log('Token found in cookies');

//       try {
//         // Verify the token
//         const decoded = verifyToken(token);

//         if (decoded && typeof decoded === 'object' && 'id' in decoded) {
//           console.log('Token verified, fetching user with ID:', decoded.id);

//           // Find the user by ID
//           const { docs: users } = await payload.find({
//             collection: 'users',
//             where: {
//               id: {
//                 equals: decoded.id,
//               },
//             },
//             limit: 1,
//           });

//           if (users && users.length > 0) {
//             console.log('User found by token verification');
//             return users[0];
//           }
//         }
//       } catch (tokenError) {
//         console.error('Token verification error:', tokenError);

//         // If token is invalid, try to extract the ID from it without verification
//         try {
//           console.log('Attempting to decode token without verification');
//           const decoded = jwt.decode(token);

//           if (decoded && typeof decoded === 'object' && 'id' in decoded) {
//             console.log('Token decoded without verification, ID:', decoded.id);

//             // Find the user by ID
//             const { docs: users } = await payload.find({
//               collection: 'users',
//               where: {
//                 id: {
//                   equals: decoded.id,
//                 },
//               },
//               limit: 1,
//             });

//             if (users && users.length > 0) {
//               console.log('User found by token ID without verification');
//               return users[0];
//             }
//           }
//         } catch (decodeError) {
//           console.error('Error decoding token without verification:', decodeError);
//         }
//       }

//       // If that also fails, fall back to a direct database query
//       console.log('Falling back to direct database query');
//       const { docs: users } = await payload.find({
//         collection: 'users',
//         limit: 1,
//         depth: 0,
//         sort: '-createdAt',
//       });

//       if (users && users.length > 0) {
//         console.log('User found via database query');
//         return users[0];
//       }

//       console.log('No user found');
//       return null;
//     }
//   } catch (error) {
//     console.error('Error finding user:', error);

//     // As a last resort, try a direct database query
//     try {
//       console.log('Attempting last resort database query');
//       const payload = await getPayloadClient();
//       const { docs: users } = await payload.find({
//         collection: 'users',
//         limit: 1,
//         depth: 0,
//         sort: '-createdAt',
//       });

//       if (users && users.length > 0) {
//         console.log('User found via last resort query');
//         return users[0];
//       }
//     } catch (innerError) {
//       console.error('Error in last resort query:', innerError);
//     }

//     return null;
//   }
// }

export const isLoggedIn = async () => {
  const user = await getCurrentUser();
  return !!user;
}

export const isAdmin = async () => {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}

export const isStudent = async () => {
  const user = await getCurrentUser();
  return user?.role === 'student';
}

export const requireAuth = async () => {
  const user = await getCurrentUser();
  if (!user) {
    // return redirect('/login?error=session');
    return null;
  }
  return user;
}

export const requireAdmin = async () => {
  const user = await getCurrentUser();
  // if (!user) {
  //   return redirect('/login?error=session');
  // }
  if (!user || user.role !== 'admin') {
    return null;
  }
  return user;
}

export const requireStudent = async () => {
  const user = await getCurrentUser();
  if (!user || user.role !== 'student') {
    return null;
  }
  return user;
};
