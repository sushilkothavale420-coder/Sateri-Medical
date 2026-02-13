'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Batch, Supplier } from '@/lib/types';
import { SuppliersDataTable } from './components/suppliers-data-table';
import { Columns } from './components/columns';
import { AddSupplierDialog } from './components/add-supplier-dialog';
import { useMemo, useState } from 'react';
import { DeleteSupplierDialog } from './components/delete-supplier-dialog';
import { EditSupplierDialog } from './components/edit-supplier-dialog';
import { useAdmin } from '@/hooks/use-admin';
import { InitiateReturnDialog } from './components/initiate-return-dialog';

export default function SuppliersPage() {
  const firestore = useFirestore();
  const { isAdmin } = useAdmin();
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isReturnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedSupplierForAction, setSelectedSupplierForAction] = useState<Supplier | null>(null);


  const suppliersQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'suppliers') : null),
    [firestore]
  );
  const { data: suppliers } = useCollection<Supplier>(suppliersQuery);

  const batchesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'batches') : null),
    [firestore]
  );
  const { data: batches } = useCollection<Batch>(batchesQuery);
  
  const expiringBatchesBySupplier = useMemo(() => {
    if (!batches) return new Map<string, Batch[]>();
    const mapping = new Map<string, Batch[]>();
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    batches.forEach(batch => {
        const expiryDate = new Date(batch.expiryDate);
        if (expiryDate <= thirtyDaysFromNow && batch.supplierId) {
            if (!mapping.has(batch.supplierId)) {
                mapping.set(batch.supplierId, []);
            }
            mapping.get(batch.supplierId)!.push(batch);
        }
    });
    return mapping;
  }, [batches]);

  const suppliersWithExpiringBatches = useMemo(() => new Set(expiringBatchesBySupplier.keys()), [expiringBatchesBySupplier]);

  const {
    columns,
    isEditOpen,
    setEditOpen,
    isDeleteOpen,
    setDeleteOpen,
    selectedSupplier,
  } = Columns({ 
    suppliersWithExpiringBatches, 
    onInitiateReturn: (supplier) => {
      setSelectedSupplierForAction(supplier);
      setReturnDialogOpen(true);
    }
  });

  const activeSupplier = selectedSupplier || selectedSupplierForAction;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold md:text-2xl">Suppliers</h1>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <AddSupplierDialog isOpen={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
                <Button size="sm" className="h-8 gap-1" onClick={() => setAddDialogOpen(true)}>
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Supplier
                  </span>
                </Button>
              </AddSupplierDialog>
            </div>
          )}
        </div>

        <SuppliersDataTable columns={columns} data={suppliers || []} />

        {activeSupplier && (
          <>
            <EditSupplierDialog
              isOpen={isEditOpen}
              onOpenChange={setEditOpen}
              supplier={activeSupplier}
            />
            <DeleteSupplierDialog
              isOpen={isDeleteOpen}
              onOpenChange={setDeleteOpen}
              supplierId={activeSupplier.id}
              supplierName={activeSupplier.name}
            />
            <InitiateReturnDialog
              isOpen={isReturnDialogOpen}
              onOpenChange={setReturnDialogOpen}
              supplier={activeSupplier}
              expiringBatches={expiringBatchesBySupplier.get(activeSupplier.id) || []}
            />
          </>
        )}
      </main>
    </div>
  );
}
