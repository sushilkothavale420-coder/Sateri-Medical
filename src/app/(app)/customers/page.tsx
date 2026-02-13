'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { Customer } from '@/lib/types';
import { CustomersDataTable } from './components/customers-data-table';
import { Columns } from './components/columns';
import { AddCustomerDialog } from './components/add-customer-dialog';
import { useMemo, useState } from 'react';
import { DeleteCustomerDialog } from './components/delete-customer-dialog';
import { EditCustomerDialog } from './components/edit-customer-dialog';
import { useAdmin } from '@/hooks/use-admin';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function CustomersPage() {
  const firestore = useFirestore();
  const { isAdmin } = useAdmin();
  const { user } = useUser();
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [showOnlyWithBalance, setShowOnlyWithBalance] = useState(false);
  
  const customersQuery = useMemoFirebase(
    () => (firestore && user ? collection(firestore, 'customers') : null),
    [firestore, user]
  );
  const { data: customers } = useCollection<Customer>(customersQuery);

  const { 
    columns, 
    isEditOpen, 
    setEditOpen, 
    isDeleteOpen, 
    setDeleteOpen, 
    selectedCustomer
  } = Columns();

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    if (showOnlyWithBalance) {
        return customers.filter(c => c.debtAmount > 0);
    }
    return customers;
  }, [customers, showOnlyWithBalance]);

  return (
    <div className="flex min-h-screen w-full flex-col">
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
        
        <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
                <Switch 
                    id="balance-filter" 
                    checked={showOnlyWithBalance}
                    onCheckedChange={setShowOnlyWithBalance}
                />
                <Label htmlFor="balance-filter">Show only customers with balance due</Label>
            </div>
        </div>

        <CustomersDataTable columns={columns} data={filteredCustomers || []} />

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
