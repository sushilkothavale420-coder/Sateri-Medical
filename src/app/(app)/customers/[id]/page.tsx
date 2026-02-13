'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useDoc, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { Customer, Sale, CustomerAccountTransaction } from '@/lib/types';
import { doc, collection, query, where, writeBatch, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, IndianRupee, Mail, Phone } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format } from 'date-fns';
import { SaleItemsTable } from '../components/sale-items-view';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


const paymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be a positive number."),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const customerId = params.id as string;

  const [isPaymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const customerDocRef = useMemoFirebase(() => (firestore && customerId && user ? doc(firestore, 'customers', customerId) : null), [firestore, customerId, user]);
  const { data: customer, isLoading: isCustomerLoading } = useDoc<Customer>(customerDocRef);

  const salesQuery = useMemoFirebase(() => (firestore && customerId && user ? query(collection(firestore, 'sales'), where('customerId', '==', customerId)) : null), [firestore, customerId, user]);
  const { data: sales, isLoading: areSalesLoading } = useCollection<Sale>(salesQuery);

  const transactionsQuery = useMemoFirebase(() => (firestore && customerId && user ? query(collection(firestore, 'customers', customerId, 'transactions'), orderBy('transactionDate', 'desc')) : null), [firestore, customerId, user]);
  const { data: transactions, isLoading: areTransactionsLoading } = useCollection<CustomerAccountTransaction>(transactionsQuery);
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amount: '' as any, notes: '' },
  });

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const handlePaymentSubmit = async (values: PaymentFormValues) => {
    if (!firestore || !customer || !user || !customerDocRef) return;
    if (values.amount > customer.debtAmount) {
        form.setError('amount', { message: 'Payment cannot exceed balance due.' });
        return;
    }

    const batch = writeBatch(firestore);
    const newDebtAmount = customer.debtAmount - values.amount;

    // 1. Update customer's debtAmount
    batch.update(customerDocRef, { debtAmount: newDebtAmount, updatedAt: new Date().toISOString() });

    // 2. Create a new transaction record
    const transactionRef = doc(collection(firestore, `customers/${customerId}/transactions`));
    batch.set(transactionRef, {
        customerId: customerId,
        transactionDate: new Date().toISOString(),
        type: 'Payment',
        amount: values.amount,
        paymentMethod: 'Cash', // Assuming cash for now
        description: values.notes || 'Payment towards outstanding balance.',
        relatedSaleId: null,
        createdByUserId: user.uid,
        createdAt: new Date().toISOString(),
    });

    try {
        await batch.commit();
        toast({
            title: "Payment Recorded",
            description: `${formatCurrency(values.amount)} has been successfully recorded.`,
        });
        form.reset();
        setPaymentDialogOpen(false);
    } catch (error) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to record payment. Please try again."
        });
    }
  };

  if (isCustomerLoading || areSalesLoading || areTransactionsLoading) {
    return <div className="flex items-center justify-center h-full p-8"><p>Loading customer details...</p></div>;
  }

  if (!customer) {
    return <div className="flex items-center justify-center h-full p-8"><p>Customer not found.</p></div>;
  }
  
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold md:text-2xl">Customer Details</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 items-start">
        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>{customer.name}</CardTitle>
                    <CardDescription>Contact Information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{customer.phoneNumber}</span>
                    </div>
                    {customer.email && (
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{customer.email}</span>
                        </div>
                    )}
                    {customer.address && (
                         <div className="flex items-start gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                            <span className='text-sm'>{customer.address}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Account Balance</CardTitle>
                    <CardDescription>Manage outstanding dues.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold tracking-tight">
                        {formatCurrency(customer.debtAmount)}
                    </div>
                    <p className="text-xs text-muted-foreground">Outstanding balance</p>
                </CardContent>
                <CardFooter>
                  <Dialog open={isPaymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                    <DialogTrigger asChild>
                       <Button className="w-full" disabled={customer.debtAmount <= 0}>
                         <IndianRupee className="mr-2 h-4 w-4" /> Settle Dues
                       </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Record Payment for {customer.name}</DialogTitle>
                        <DialogDescription>
                          The current balance is {formatCurrency(customer.debtAmount)}.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handlePaymentSubmit)} className="space-y-4 py-4">
                          <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Payment Amount</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" max={customer.debtAmount} placeholder="Enter amount paid" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Notes (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Cash payment received" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                            <Button type="submit">Record Payment</Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
            </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Purchase History</CardTitle>
                    <CardDescription>A record of all sales made to this customer.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {sales && sales.length > 0 ? (
                            sales.sort((a,b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()).map(sale => (
                                <AccordionItem value={sale.id} key={sale.id}>
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex justify-between w-full pr-4 items-center">
                                            <div className="flex flex-col text-left">
                                                <span className="font-semibold">Sale Details</span>
                                                <span className="text-sm text-muted-foreground">{format(new Date(sale.saleDate), 'PPP, p')}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge variant={sale.balanceDue > 0 ? "destructive" : "secondary"}>{sale.paymentMethod}</Badge>
                                                <span className="font-semibold text-right">{formatCurrency(sale.totalAmountDue)}</span>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <SaleItemsTable saleId={sale.id} />
                                    </AccordionContent>
                                </AccordionItem>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No purchase history found.</p>
                        )}
                    </Accordion>
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>A record of all payments and credits for this customer.</CardDescription>
              </CardHeader>
              <CardContent>
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Notes</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {transactions && transactions.length > 0 ? (
                              transactions.map(tx => (
                                  <TableRow key={tx.id}>
                                      <TableCell>{format(new Date(tx.transactionDate), 'PPP')}</TableCell>
                                      <TableCell><Badge variant={tx.type === 'Payment' ? 'secondary' : 'outline'}>{tx.type}</Badge></TableCell>
                                      <TableCell className="text-sm text-muted-foreground">{tx.description}</TableCell>
                                      <TableCell className="text-right font-medium">{formatCurrency(tx.amount)}</TableCell>
                                  </TableRow>
                              ))
                          ) : (
                              <TableRow>
                                  <TableCell colSpan={4} className="h-24 text-center">
                                      No transactions found.
                                  </TableCell>
                              </TableRow>
                          )}
                      </TableBody>
                  </Table>
              </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
