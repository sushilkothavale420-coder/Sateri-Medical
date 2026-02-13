'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { useUser, useCollection, useFirestore, useMemoFirebase, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Header } from '@/components/header';
import { collection } from 'firebase/firestore';
import { Batch } from '@/lib/types';
import { useAdmin } from '@/hooks/use-admin';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  const router = useRouter();
  const firestore = useFirestore();
  const auth = useAuth();

  const batchesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'batches') : null),
    [firestore]
  );
  const { data: batches } = useCollection<Batch>(batchesQuery);

  const expiringNotifications = useMemo(() => {
    if (!batches) return [];
    
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    return batches.filter(batch => {
      const expiryDate = new Date(batch.expiryDate);
      return expiryDate <= thirtyDaysFromNow;
    }).sort((a,b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  }, [batches]);

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
        <Header notifications={expiringNotifications || []} />
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
