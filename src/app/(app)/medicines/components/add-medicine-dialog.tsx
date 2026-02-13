'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { medicineSchema, type Medicine } from '@/lib/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

type AddMedicineDialogProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

type AddMedicineFormValues = Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>;

export function AddMedicineDialog({ children, isOpen, onOpenChange }: AddMedicineDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<AddMedicineFormValues>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: '',
      compositionId: '',
      category: '',
      company: '',
      basePurchasePrice: '' as any,
      baseSellingPrice: '' as any,
      tabletsPerStrip: null,
      stripsPerBox: null,
      reorderPoint: '' as any,
      taxRateGst: '' as any,
    },
  });

  async function onSubmit(values: AddMedicineFormValues) {
    if (!firestore) return;

    const medicinesCollection = collection(firestore, 'medicines');
    
    addDocumentNonBlocking(medicinesCollection, {
        ...values,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });

    toast({
      title: 'Medicine Added',
      description: `${values.name} has been added to the inventory.`,
    });
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Medicine</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new medicine to the inventory.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medicine Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Paracetamol 500mg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="compositionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Composition (Generic Name)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Paracetamol" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Painkiller" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Pharma Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="basePurchasePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price (per tablet)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g. 1.80" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} value={Number.isFinite(field.value) ? field.value : ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="baseSellingPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price (per tablet)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g. 2.50" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} value={Number.isFinite(field.value) ? field.value : ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tabletsPerStrip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tablets per Strip</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 10" {...field} onChange={e => field.onChange(e.target.value === '' ? null : e.target.valueAsNumber)} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stripsPerBox"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Strips per Box</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 10" {...field} onChange={e => field.onChange(e.target.value === '' ? null : e.target.valueAsNumber)} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
               <FormField
                control={form.control}
                name="taxRateGst"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g. 5" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} value={Number.isFinite(field.value) ? field.value : ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reorderPoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Re-order Point (Tablets)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 200" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} value={Number.isFinite(field.value) ? field.value : ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
              <Button type="submit">Save Medicine</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
