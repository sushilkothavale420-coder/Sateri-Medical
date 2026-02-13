'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supplierSchema, type Supplier } from '@/lib/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

type EditSupplierFormValues = Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'accountPayableBalance'>;

type EditSupplierDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  supplier: Supplier;
};

export function EditSupplierDialog({
  isOpen,
  onOpenChange,
  supplier,
}: EditSupplierDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<EditSupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      phoneNumber: supplier.phoneNumber,
      email: supplier.email,
      address: supplier.address,
    },
  });

  useEffect(() => {
    if (supplier) {
      form.reset({
        name: supplier.name,
        contactPerson: supplier.contactPerson,
        phoneNumber: supplier.phoneNumber,
        email: supplier.email,
        address: supplier.address,
      });
    }
  }, [supplier, form]);

  async function onSubmit(values: EditSupplierFormValues) {
    if (!firestore || !supplier.id) return;

    const supplierDocRef = doc(firestore, 'suppliers', supplier.id);

    updateDocumentNonBlocking(supplierDocRef, {
      ...values,
      updatedAt: new Date().toISOString(),
    });

    toast({
      title: 'Supplier Updated',
      description: `${values.name}'s details have been updated.`,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Supplier</DialogTitle>
          <DialogDescription>
            Update the details for "{supplier.name}".
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Generic Pharma Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Jane Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. +1 234 567 890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. contact@genericpharma.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 123 Business Rd, Pharmaville" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
