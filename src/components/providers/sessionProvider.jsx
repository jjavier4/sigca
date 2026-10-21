'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

export default function SessionProvider({ children, basePath, session }) {
  return <NextAuthSessionProvider session={session} basePath={basePath}>{children}</NextAuthSessionProvider>;
}