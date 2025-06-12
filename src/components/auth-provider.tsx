// src/components/auth-provider.tsx
"use client";

import type { Session } from 'next-auth';
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
  session?: Session; // Optional: For server-side session pre-filling
}

export default function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}
