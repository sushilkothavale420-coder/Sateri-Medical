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
      composition: '',
      category: '',
      company: '',
      basePurchasePrice: undefined,
      baseSellingPrice: undefined,
      smallestUnitName: 'tablet',
      unitsPerBulk: 10,
      bulkUnitName: 'strip',
      reorderPoint: 10,
      taxRateGst: 5,
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
                    <Input placeholder="e.g. Crocin Advance" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="composition"
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
                      <Input placeholder="e.g. GlaxoSmithKline" {...field} />
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
                    <FormLabel>Purchase Price (per smallest unit)</FormLabel>
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
                    <FormLabel>Selling Price (per smallest unit)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g. 2.50" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} value={Number.isFinite(field.value) ? field.value : ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
               <FormField
                control={form.control}
                name="smallestUnitName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Smallest Unit Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. tablet, capsule" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <FormField
                control={form.control}
                name="unitsPerBulk"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Units per Bulk (e.g. tablets per strip)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 10" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} value={Number.isFinite(field.value) ? field.value : ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bulkUnitName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bulk Unit Name (e.g. strip, box)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. strip" {...field} />
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
                    <FormLabel>Re-order Point (in smallest units)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 20" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} value={Number.isFinite(field.value) ? field.value : ''} />
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
