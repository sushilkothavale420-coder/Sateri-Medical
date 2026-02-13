'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { Customer, UserProfile } from '@/lib/types';
import { CustomersDataTable } from './components/customers-data-table';
import { Columns } from './components/columns';
import { AddCustomerDialog } from './components/add-customer-dialog';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { useState } from 'react';
import { DeleteCustomerDialog } from './components/delete-customer-dialog';
import { EditCustomerDialog } from './components/edit-customer-dialog';

export default function CustomersPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);

  const { 
    columns, 
    isEditOpen, 
    setEditOpen, 
    isDeleteOpen, 
    setDeleteOpen, 
    selectedCustomer
  } = Columns();

  const userProfileRef = useMemoFirebase(() => {
    if (firestore && user) {
      return doc(firestore, 'users', user.uid);
    }
    return null;
  }, [firestore, user]);

  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const customersQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'customers') : null),
    [firestore]
  );
  
  const { data: customers, isLoading } = useCollection<Customer>(customersQuery);

  const isAdmin = userProfile?.role === 'Admin';

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header pageTitle="Customers" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold md:text-2xl">Customers</h1>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <AddCustomerDialog isOpen={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
                <Button size="sm" className="h-8 gap-1" onClick={() => setAddDialogOpen(true)}>
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Customer
                  </span>
                </Button>
              </AddCustomerDialog>
            </div>
          )}
        </div>
        
        {isLoading && <p>Loading customers...</p>}

        {customers && (
          <CustomersDataTable columns={columns} data={customers} />
        )}

        {selectedCustomer && (
          <>
            <EditCustomerDialog 
              isOpen={isEditOpen}
              onOpenChange={setEditOpen}
              customer={selectedCustomer}
            />
            <DeleteCustomerDialog
              isOpen={isDeleteOpen}
              onOpenChange={setDeleteOpen}
              customerId={selectedCustomer.id}
              customerName={selectedCustomer.name}
            />
          </>
        )}
      </main>
    </div>
  );
}
