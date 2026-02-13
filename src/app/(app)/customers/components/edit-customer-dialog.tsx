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
import { customerSchema, type Customer } from '@/lib/types';
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

type EditCustomerFormValues = Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'debtAmount'>;

type EditCustomerDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  customer: Customer;
};

export function EditCustomerDialog({
  isOpen,
  onOpenChange,
  customer,
}: EditCustomerDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<EditCustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer.name,
      phoneNumber: customer.phoneNumber,
      email: customer.email,
      address: customer.address,
    },
  });

  useEffect(() => {
    if (customer) {
      form.reset({
        name: customer.name,
        phoneNumber: customer.phoneNumber,
        email: customer.email,
        address: customer.address,
      });
    }
  }, [customer, form]);

  async function onSubmit(values: EditCustomerFormValues) {
    if (!firestore || !customer.id) return;

    const customerDocRef = doc(firestore, 'customers', customer.id);

    updateDocumentNonBlocking(customerDocRef, {
      ...values,
      updatedAt: new Date().toISOString(),
    });

    toast({
      title: 'Customer Updated',
      description: `${values.name}'s details have been updated.`,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription>
            Update the details for "{customer.name}".
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} />
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
                    <Input {...field} />
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
