'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Medicine, stockEntrySchema, type StockEntry } from '@/lib/types';
import { collection } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';

export default function StockManagementPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const medicinesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'medicines') : null),
    [firestore]
  );
  const { data: medicines, isLoading: isLoadingMedicines } = useCollection<Medicine>(medicinesQuery);

  const form = useForm<StockEntry>({
    resolver: zodResolver(stockEntrySchema),
    defaultValues: {
      medicineId: '',
      batchNumber: '',
      quantity: undefined,
      unit: 'Tablet',
      purchasePricePerSmallestUnit: undefined,
    },
  });

  const onSubmit = (values: StockEntry) => {
    if (!firestore || !user) return;

    const selectedMedicine = medicines?.find(m => m.id === values.medicineId);
    if (!selectedMedicine) {
        toast({ variant: 'destructive', title: 'Error', description: 'Selected medicine not found.' });
        return;
    }

    let quantityInSmallestUnits = values.quantity;
    if (values.unit === 'Strip') {
        const tabletsPerStrip = selectedMedicine.tabletsPerStrip || 1;
        quantityInSmallestUnits = values.quantity * tabletsPerStrip;
    } else if (values.unit === 'Box') {
        const tabletsPerStrip = selectedMedicine.tabletsPerStrip || 1;
        const stripsPerBox = selectedMedicine.stripsPerBox || 1;
        quantityInSmallestUnits = values.quantity * stripsPerBox * tabletsPerStrip;
    }

    const newBatch = {
      medicineId: values.medicineId,
      batchNumber: values.batchNumber,
      expiryDate: format(values.expiryDate, 'yyyy-MM-dd'),
      quantityInSmallestUnits,
      purchasePricePerSmallestUnit: values.purchasePricePerSmallestUnit,
      supplierId: 'direct-entry', // Placeholder
      receivedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const batchesCollection = collection(firestore, 'batches');
    addDocumentNonBlocking(batchesCollection, newBatch);

    toast({
        title: 'Stock Added',
        description: `Added ${values.quantity} ${values.unit}(s) of ${selectedMedicine.name} to inventory.`
    });
    form.reset();
  };

  const isAdmin = user?.uid === 'a6jWnMQZfLY82mBA3g0DIMxYRFZ2';

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header pageTitle="Stock Management" />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <h1 className="text-lg font-semibold md:text-2xl">Access Denied</h1>
            <p>You do not have permission to view this page.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header pageTitle="Stock Management" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
            <CardHeader>
                <CardTitle>Add New Stock</CardTitle>
                <CardDescription>Add a new batch of medicine to your inventory.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="medicineId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Medicine</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger disabled={isLoadingMedicines}>
                                                <SelectValue placeholder="Select a medicine" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {medicines?.map(med => (
                                                <SelectItem key={med.id} value={med.id}>
                                                    {med.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="batchNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Batch Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. B12345" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="expiryDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Expiry Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date < new Date()}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="purchasePricePerSmallestUnit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Purchase Price (per Tablet)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="e.g. 1.80" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} value={Number.isFinite(field.value) ? field.value : ''}/>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quantity</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 100" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} value={Number.isFinite(field.value) ? field.value : ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="unit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unit</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Tablet">Tablet</SelectItem>
                                                    <SelectItem value="Strip">Strip</SelectItem>
                                                    <SelectItem value="Box">Box</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit">Add Stock to Inventory</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
