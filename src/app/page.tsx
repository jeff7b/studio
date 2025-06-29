
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, LogIn } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const useStubAuth = process.env.NEXT_PUBLIC_STUB_AUTH === 'true';

  useEffect(() => {
    // If we are using stub auth and the user is not authenticated yet,
    // automatically trigger the sign-in process.
    if (useStubAuth && status === 'unauthenticated') {
      signIn('credentials', { callbackUrl: '/dashboard' });
      return; // Early return to avoid other logic paths in this effect
    }

    // If the user is authenticated (either through stub or real auth),
    // redirect them to the dashboard.
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [session, status, router, useStubAuth]);

  // While signing in or redirecting, show a loading message.
  if (status === 'loading' || status === 'authenticated' || (useStubAuth && status === 'unauthenticated')) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <p>Signing in or redirecting...</p>
      </div>
    );
  }

  // This part of the component will now only be rendered for the real (non-stub) auth flow
  // when the user is unauthenticated.
  const handleLogin = () => {
    // This is now only for the Azure AD flow since stub auth is automatic
    signIn('azure-ad', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-8 left-8 flex items-center space-x-2">
        <Building2 className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold font-headline text-foreground">Review Central</span>
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold font-headline">Welcome</CardTitle>
          <CardDescription>
            Sign in with your Office 365 account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={handleLogin} className="w-full text-lg py-6">
            <LogIn className="mr-2 h-5 w-5" />
            Sign in with Office 365
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
           <p className="text-sm text-muted-foreground">
            Trouble signing in? <Link href="#" className="text-primary hover:underline">Contact Support</Link>
          </p>
        </CardFooter>
      </Card>
      <footer className="absolute bottom-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Review Central. All rights reserved.
      </footer>
    </div>
  );
}
