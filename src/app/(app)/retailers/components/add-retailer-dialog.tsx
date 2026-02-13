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
import { newRetailerSchema, type NewRetailer } from '@/lib/types';
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
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { initializeApp, deleteApp, FirebaseError } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';

type AddRetailerDialogProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function AddRetailerDialog({ children, isOpen, onOpenChange }: AddRetailerDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<NewRetailer>({
    resolver: zodResolver(newRetailerSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: NewRetailer) {
    if (!firestore) return;

    const { email, password } = values;
    
    // Create a temporary app instance to create user without logging admin out
    const tempAppName = `temp-retailer-creation-${Date.now()}`;
    const tempApp = initializeApp(firebaseConfig, tempAppName);
    const tempAuth = getAuth(tempApp);

    try {
        const userCredential = await createUserWithEmailAndPassword(tempAuth, email, password);
        const newUser = userCredential.user;

        const userDocRef = doc(firestore, 'users', newUser.uid);
        const userData = {
            email: newUser.email,
            role: 'Retailer',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            id: newUser.uid
        };
        
        // This function is non-blocking and handles its own errors
        setDocumentNonBlocking(userDocRef, userData, { merge: false });

        toast({
            title: 'Retailer Created',
            description: `Account for ${email} has been created successfully.`,
        });
        form.reset();
        onOpenChange(false);

    } catch (error) {
        let description = 'An unexpected error occurred. Please try again.';
        if (error instanceof FirebaseError) {
            switch (error.code) {
                case 'auth/email-already-in-use':
                    description = 'This email address is already registered.';
                    break;
                case 'auth/weak-password':
                    description = 'The password is too weak. It must be at least 6 characters long.';
                    break;
                case 'auth/invalid-email':
                    description = 'The email address is not valid.';
                    break;
            }
        }
        toast({
            variant: 'destructive',
            title: 'Failed to Create Retailer',
            description: description,
        });
    } finally {
        // Clean up the temporary app instance
        await deleteApp(tempApp);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Retailer</DialogTitle>
          <DialogDescription>
            Enter the email and password for the new retailer account.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="retailer@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
              <Button type="submit">Create Account</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
