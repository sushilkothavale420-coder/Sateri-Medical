'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useFirestore } from '@/firebase';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';

type DeleteSupplierDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  supplierId: string;
  supplierName: string;
};

export function DeleteSupplierDialog({
  isOpen,
  onOpenChange,
  supplierId,
  supplierName,
}: DeleteSupplierDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleDelete = () => {
    if (!firestore || !supplierId) return;
    const docRef = doc(firestore, 'suppliers', supplierId);
    deleteDocumentNonBlocking(docRef);
    toast({
      title: 'Supplier Deleted',
      description: `"${supplierName}" has been successfully deleted.`,
    });
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            supplier "{supplierName}" from your records.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
