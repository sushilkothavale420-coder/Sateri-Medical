'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Customer } from '@/lib/types';
import { CustomersDataTable } from './components/customers-data-table';
import { Columns } from './components/columns';
import { AddCustomerDialog } from './components/add-customer-dialog';
import { useState, useEffect } from 'react';
import { DeleteCustomerDialog } from './components/delete-customer-dialog';
import { EditCustomerDialog } from './components/edit-customer-dialog';

export default function CustomersPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { 
    columns, 
    isEditOpen, 
    setEditOpen, 
    isDeleteOpen, 
    setDeleteOpen, 
    selectedCustomer
  } = Columns();

  useEffect(() => {
    if (!firestore) return;
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(firestore, 'customers'));
        const customersData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Customer[];
        setCustomers(customersData);
      } catch (error) {
        console.error("Error fetching customers: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, [firestore]);


  const isAdmin = user?.uid === 'a6jWnMQZfLY82mBA3g0DIMxYRFZ2';

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
        
        {isLoading ? (
            <p>Loading customers...</p>
        ) : (
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
