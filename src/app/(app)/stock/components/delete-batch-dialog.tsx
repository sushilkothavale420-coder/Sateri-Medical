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
import { Batch } from '@/lib/types';

type DeleteBatchDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  batch: Batch;
};

export function DeleteBatchDialog({ isOpen, onOpenChange, batch }: DeleteBatchDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleDelete = () => {
    if (!firestore || !batch.id) return;
    const docRef = doc(firestore, 'batches', batch.id);
    deleteDocumentNonBlocking(docRef);
    toast({
      title: 'Batch Deleted',
      description: `Batch "${batch.batchNumber}" for ${batch.medicineName} has been deleted.`,
    });
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the batch record for "{batch.medicineName}" (Batch No: {batch.batchNumber}). The stock quantity will not be adjusted automatically.
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
