'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

export default function SessionProvider({ children, basePath }) {
  return <NextAuthSessionProvider basePath={basePath}>{children}</NextAuthSessionProvider>;
}