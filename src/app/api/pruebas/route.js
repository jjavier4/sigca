import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request) {

    const session = await getServerSession(authOptions);

    console.log('Sesión del usuario:', session);
}