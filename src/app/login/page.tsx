'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/firebase';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import { useAdmin } from '@/hooks/use-admin';

export default function LoginPage() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isUserLoading } = useUser();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  const { toast } = useToast();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'access-denied') {
      if (auth.currentUser) {
        auth.signOut();
      }
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You do not have permission to access the admin dashboard.',
      });
      // A clean URL is better for the user.
      router.replace('/login', { scroll: false });
    }
  }, [searchParams, toast, router, auth]);

  useEffect(() => {
    // If the user is successfully verified as an admin, redirect them.
    if (!isAdminLoading && isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, isAdminLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    try {
      await initiateEmailSignIn(auth, loginEmail, loginPassword);
      // On success, the onAuthStateChanged listener in FirebaseProvider will trigger,
      // and the useEffect hook above will handle the redirect once isAdmin is confirmed.
    } catch (error) {
      let title = 'Login Failed';
      let description = 'An unexpected error occurred. Please try again.';

      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/user-not-found': // Deprecated but good fallback
          case 'auth/wrong-password': // Deprecated but good fallback
            description =
              'Invalid email or password. Please check your credentials.';
            break;
          case 'auth/invalid-email':
            description = 'The email address is not valid.';
            break;
          default:
            // Keep the generic message for other Firebase errors
            break;
        }
      }

      toast({
        variant: 'destructive',
        title: title,
        description: description,
      });
    }
  };

  const isLoading = isUserLoading || isAdminLoading;
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }
  
  // If we have finished loading and the user is an admin, we are about to redirect.
  // Show a loading indicator to prevent flashing the login form.
  if (!isAdminLoading && isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }
  
  // If we are not loading AND the user is NOT an admin, show the login form.
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
       <div className="absolute top-8 left-8">
         <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
       </div>
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-semibold text-center mb-6">Sateri Medical</h1>
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
