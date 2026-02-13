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

  useEffect(() => {
    const totalLoading = isUserLoading || isAdminLoading;
    if (!totalLoading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        // If user is logged in but not an admin, sign them out and deny access.
        auth.signOut();
        router.push('/login');
      }
    }
  }, [user, isUserLoading, isAdmin, isAdminLoading, router, auth]);

  const isLoading = isUserLoading || isAdminLoading;

  if (isLoading || !user || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header notifications={expiringNotifications} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
