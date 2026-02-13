'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Medicine, stockEntrySchema, Batch } from '@/lib/types';
import { collection, query, orderBy } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { z } from 'zod';
import { useAdmin } from '@/hooks/use-admin';
import { Separator } from '@/components/ui/separator';
import { Columns } from './components/columns';
import { BatchesDataTable } from './components/batches-data-table';
import { DeleteBatchDialog } from './components/delete-batch-dialog';


type StockEntryFormValues = z.infer<typeof stockEntrySchema>;


export default function StockManagementPage() {
  const firestore = useFirestore();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  const { toast } = useToast();
  const [open, setOpen] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  const batchesQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'batches'), orderBy('receivedAt', 'desc')) : null),
    [firestore]
  );
  const { data: batches } = useCollection<Batch>(batchesQuery);
  const { columns, isDeleteOpen, setDeleteOpen, selectedBatch } = Columns();

  const medicinesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'medicines') : null),
    [firestore]
  );
  const { data: medicines } = useCollection<Medicine>(medicinesQuery);


  const form = useForm<StockEntryFormValues>({
    resolver: zodResolver(stockEntrySchema),
    defaultValues: {
      medicineId: '',
      medicineName: '',
      batchNumber: '',
      quantity: '' as any,
      purchasePricePerSmallestUnit: '' as any,
    },
  });

  const onSubmit = (values: StockEntryFormValues) => {
    if (!firestore) return;

    if (!selectedMedicine) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please select a medicine.' });
        return;
    }

    const quantityInBoxes = values.quantity;
    const tabletsPerStrip = selectedMedicine.tabletsPerStrip || 1;
    const stripsPerBox = selectedMedicine.stripsPerBox || 1;
    const quantityInSmallestUnits = quantityInBoxes * stripsPerBox * tabletsPerStrip;

    const newBatch = {
      medicineId: values.medicineId,
      medicineName: values.medicineName,
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
        description: `Added ${values.quantity} Box(es) of ${selectedMedicine.name} to inventory.`
    });
    form.reset();
    setSelectedMedicine(null);
  };
  
  if (isAdminLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <h1 className="text-lg font-semibold md:text-2xl">Stock Management</h1>
            <p>Loading...</p>
        </main>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <h1 className="text-lg font-semibold md:text-2xl">Access Denied</h1>
            <p>You do not have permission to view this page.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-8 p-4 md:gap-8 md:p-8">
        <h1 className="text-lg font-semibold md:text-2xl">Stock Management</h1>
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
                            <FormItem className="flex flex-col">
                              <FormLabel>Medicine</FormLabel>
                              <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      disabled={!medicines}
                                      className={cn(
                                        "w-full justify-between",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value
                                        ? medicines?.find(
                                            (med) => med.id === field.value
                                          )?.name
                                        : "Select medicine"}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                  <Command>
                                    <CommandInput placeholder="Search medicine..." />
                                    <CommandList>
                                      <CommandEmpty>No medicine found.</CommandEmpty>
                                      <CommandGroup>
                                        {medicines?.map((med) => (
                                          <CommandItem
                                            value={med.name}
                                            key={med.id}
                                            onSelect={() => {
                                              form.setValue("medicineId", med.id)
                                              form.setValue("medicineName", med.name)
                                              setSelectedMedicine(med);
                                              setOpen(false)
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                med.id === field.value
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                            {med.name}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
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
                                                    disabled={(date) =>
                                                        date < new Date(new Date().setHours(0, 0, 0, 0))
                                                      }
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
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity (in Boxes)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g. 10" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} value={Number.isFinite(field.value) ? field.value : ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit">Add Stock to Inventory</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>

        <Separator />

        <Card>
            <CardHeader>
                <CardTitle>Current Stock Batches</CardTitle>
                <CardDescription>View and manage all current batches in your inventory.</CardDescription>
            </CardHeader>
            <CardContent>
                <BatchesDataTable columns={columns} data={batches || []} />
            </CardContent>
        </Card>
        
        {selectedBatch && (
            <DeleteBatchDialog
                isOpen={isDeleteOpen}
                onOpenChange={setDeleteOpen}
                batch={selectedBatch}
            />
        )}
      </main>
    </div>
  );
}
