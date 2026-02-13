'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Medicine } from '@/lib/types';
import { MedicinesDataTable } from './components/medicines-data-table';
import { Columns } from './components/columns';
import { AddMedicineDialog } from './components/add-medicine-dialog';
import { useState, useEffect } from 'react';
import { DeleteMedicineDialog } from './components/delete-medicine-dialog';
import { EditMedicineDialog } from './components/edit-medicine-dialog';

export default function MedicinesPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { 
    columns, 
    isEditOpen, 
    setEditOpen, 
    isDeleteOpen, 
    setDeleteOpen, 
    selectedMedicine 
  } = Columns();
  
  useEffect(() => {
    if (!firestore) return;
    const fetchMedicines = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(firestore, 'medicines'));
        const medicinesData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Medicine[];
        setMedicines(medicinesData);
      } catch (error) {
        console.error("Error fetching medicines:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMedicines();
  }, [firestore]);


  const isAdmin = user?.uid === 'a6jWnMQZfLY82mBA3g0DIMxYRFZ2';

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header pageTitle="Medicines" />
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
            <MedicinesDataTable columns={columns} data={medicines} />
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
