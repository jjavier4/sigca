import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// NextAuth maneja automáticamente las rutas:
// - GET /api/auth/signin
// - POST /api/auth/signin
// - POST /api/auth/signout
// - GET /api/auth/session
// - etc.
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };