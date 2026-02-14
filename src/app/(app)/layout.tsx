'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Header } from '@/components/header';
import { useAdmin } from '@/hooks/use-admin';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  const router = useRouter();

  const isLoading = isUserLoading || isAdminLoading;

  useEffect(() => {
    if (isLoading) {
      return; // Wait until all auth/role checks are complete
    }

    if (!user) {
      // No user found, redirect to login.
      router.push('/login');
    } else if (!isAdmin) {
      // User is logged in but is not an admin.
      // Redirect to login with an error message.
      router.push('/login?error=access-denied');
    }
  }, [user, isLoading, isAdmin, router]);


  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        {isLoading || !isAdmin || !user ? (
            <main className="flex flex-1 items-center justify-center">
                <p>Loading...</p>
            </main>
        ) : (
            children
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
