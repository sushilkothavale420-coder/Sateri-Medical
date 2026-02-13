'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { collection, query, where } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { UserProfile } from '@/lib/types';
import { RetailersDataTable } from './components/retailers-data-table';
import { columns } from './components/columns';
import { AddRetailerDialog } from './components/add-retailer-dialog';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { useState } from 'react';

export default function RetailersPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);

  const userProfileRef = useMemoFirebase(() => {
    if (firestore && user) {
      return doc(firestore, 'users', user.uid);
    }
    return null;
  }, [firestore, user]);

  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const retailersQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'users'), where('role', '==', 'Retailer')) : null),
    [firestore]
  );
  
  const { data: retailers, isLoading } = useCollection<UserProfile>(retailersQuery);

  const isAdmin = userProfile?.role === 'Admin';

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header pageTitle="Retailers" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Retailers</h1>
          {isAdmin && (
            <div className="ml-auto flex items-center gap-2">
              <AddRetailerDialog isOpen={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
                <Button size="sm" className="h-8 gap-1" onClick={() => setAddDialogOpen(true)}>
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Retailer
                  </span>
                </Button>
              </AddRetailerDialog>
            </div>
          )}
        </div>
        
        {isLoading && <p>Loading retailers...</p>}

        {retailers && (
          <RetailersDataTable columns={columns} data={retailers} />
        )}
      </main>
    </div>
  );
}
