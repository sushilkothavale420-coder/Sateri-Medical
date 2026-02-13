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

type DeleteCustomerDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  customerId: string;
  customerName: string;
};

export function DeleteCustomerDialog({
  isOpen,
  onOpenChange,
  customerId,
  customerName,
}: DeleteCustomerDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleDelete = () => {
    if (!firestore || !customerId) return;
    const docRef = doc(firestore, 'customers', customerId);
    deleteDocumentNonBlocking(docRef);
    toast({
      title: 'Customer Deleted',
      description: `"${customerName}" has been successfully deleted.`,
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
            customer "{customerName}" from your records.
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
