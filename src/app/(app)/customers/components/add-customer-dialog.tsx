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
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

type AddCustomerDialogProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

type AddCustomerFormValues = Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'debtAmount'>;

export function AddCustomerDialog({ children, isOpen, onOpenChange }: AddCustomerDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<AddCustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      email: '',
      address: '',
    },
  });

  async function onSubmit(values: AddCustomerFormValues) {
    if (!firestore) return;

    const customersCollection = collection(firestore, 'customers');
    
    addDocumentNonBlocking(customersCollection, {
        ...values,
        debtAmount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });

    toast({
      title: 'Customer Added',
      description: `${values.name} has been added to your customer list.`,
    });
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new customer.
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
                    <Input placeholder="e.g. John Doe" {...field} />
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
                    <Input placeholder="e.g. john.doe@example.com" {...field} />
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
                    <Input placeholder="e.g. 123 Main St, Anytown USA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
              <Button type="submit">Save Customer</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
