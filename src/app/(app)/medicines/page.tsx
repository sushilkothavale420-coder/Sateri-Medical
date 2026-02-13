'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Medicine } from '@/lib/types';
import { MedicinesDataTable } from './components/medicines-data-table';
import { Columns } from './components/columns';
import { AddMedicineDialog } from './components/add-medicine-dialog';
import { useState } from 'react';
import { DeleteMedicineDialog } from './components/delete-medicine-dialog';
import { EditMedicineDialog } from './components/edit-medicine-dialog';
import { useAdmin } from '@/hooks/use-admin';

export default function MedicinesPage() {
  const firestore = useFirestore();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  
  const medicinesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'medicines') : null),
    [firestore]
  );
  const { data: medicines, isLoading: areMedicinesLoading } = useCollection<Medicine>(medicinesQuery);

  const { 
    columns, 
    isEditOpen, 
    setEditOpen, 
    isDeleteOpen, 
    setDeleteOpen, 
    selectedMedicine 
  } = Columns();
  
  const isLoading = areMedicinesLoading || isAdminLoading;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold md:text-2xl">Medicines</h1>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <AddMedicineDialog isOpen={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
                <Button size="sm" className="h-8 gap-1" onClick={() => setAddDialogOpen(true)}>
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Medicine
                  </span>
                </Button>
              </AddMedicineDialog>
            </div>
          )}
        </div>
        
        {isLoading ? (
            <p>Loading medicines...</p>
        ) : (
            <MedicinesDataTable columns={columns} data={medicines || []} />
        )}

        {selectedMedicine && (
          <>
            <EditMedicineDialog 
              isOpen={isEditOpen}
              onOpenChange={setEditOpen}
              medicine={selectedMedicine}
            />
            <DeleteMedicineDialog
              isOpen={isDeleteOpen}
              onOpenChange={setDeleteOpen}
              medicineId={selectedMedicine.id}
              medicineName={selectedMedicine.name}
            />
          </>
        )}
      </main>
    </div>
  );
}
