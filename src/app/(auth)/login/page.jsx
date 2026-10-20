import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AuthForm from '@/components/ui/auth/authform';

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/');
  }

  return (
    <div className="w-full flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <AuthForm />
      </div>
    </div>
  );
}