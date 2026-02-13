'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useFirestore, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Batch, Supplier } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

const returnSchema = z.object({
  reason: z.string().min(1, 'A reason for the return is required.'),
});

type ReturnFormValues = z.infer<typeof returnSchema>;

type InitiateReturnDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  supplier: Supplier;
  expiringBatches: Batch[];
};

export function InitiateReturnDialog({ isOpen, onOpenChange, supplier, expiringBatches }: InitiateReturnDialogProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const form = useForm<ReturnFormValues>({
    resolver: zodResolver(returnSchema),
    defaultValues: { reason: 'Expired or expiring soon stock.' },
  });
  
  const totalCreditValue = expiringBatches.reduce((acc, batch) => {
    return acc + (batch.quantityInSmallestUnits * batch.purchasePricePerSmallestUnit);
  }, 0);

  async function onSubmit(values: ReturnFormValues) {
    if (!firestore || !user) return;

    const returnsCollection = collection(firestore, 'returns_to_vendor');
    
    addDocumentNonBlocking(returnsCollection, {
        supplierId: supplier.id,
        returnDate: new Date().toISOString(),
        reason: values.reason,
        totalCreditExpected: totalCreditValue,
        status: 'Pending',
        createdByUserId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    toast({
      title: 'Return Initiated',
      description: `A return request has been created for ${supplier.name}.`,
    });
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Initiate Return to {supplier.name}</DialogTitle>
          <DialogDescription>
            This will create a "Pending" return record for the following expiring items from this supplier.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
            <p className="text-sm font-medium">Expiring Batches:</p>
            <ScrollArea className="h-48 rounded-md border p-4">
                <ul className="space-y-2">
                    {expiringBatches.length > 0 ? expiringBatches.map(batch => (
                        <li key={batch.id} className="text-sm text-muted-foreground">
                           - {batch.medicineName} (Batch: {batch.batchNumber}, Expires: {format(new Date(batch.expiryDate), 'MMM yyyy')})
                        </li>
                    )) : (
                      <li className="text-sm text-muted-foreground">No expiring batches found for this supplier.</li>
                    )}
                </ul>
            </ScrollArea>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-2">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Return</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Expired or expiring soon stock." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
              <Button type="submit">Submit Return Request</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
