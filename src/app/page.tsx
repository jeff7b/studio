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
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <p>Loading session or redirecting...</p>
      </div>
    );
  }

  const handleLogin = () => {
    if (useStubAuth) {
      signIn('credentials', { callbackUrl: '/dashboard' });
    } else {
      signIn('azure-ad', { callbackUrl: '/dashboard' });
    }
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
            {useStubAuth
              ? 'Click below to sign in with a mock user'
              : 'Sign in with your Office 365 account to continue'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={handleLogin} className="w-full text-lg py-6">
            <LogIn className="mr-2 h-5 w-5" />
            {useStubAuth ? 'Sign in as Local Developer' : 'Sign in with Office 365'}
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
