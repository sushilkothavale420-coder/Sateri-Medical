'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { useUser, useCollection, useFirestore, useMemoFirebase, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Header } from '@/components/header';
import { collection, query, where, orderBy } from 'firebase/firestore';
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

  const expiringBatchesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const thirtyDaysFromNowStr = thirtyDaysFromNow.toISOString().split('T')[0];

    return query(
      collection(firestore, 'batches'),
      where('expiryDate', '<=', thirtyDaysFromNowStr),
      orderBy('expiryDate', 'asc')
    );
  }, [firestore, user]);

  const { data: expiringNotifications } = useCollection<Batch>(expiringBatchesQuery);

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
