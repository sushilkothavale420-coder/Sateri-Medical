'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { Medicine, Supplier } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ArrowLeft, Check, ChevronsUpDown, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';

type OrderItem = {
  medicine: Medicine;
  quantity: number; // in smallest units
  pricePerUnit: number;
  totalPrice: number;
};

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const medicinesQuery = useMemoFirebase(() => firestore && user ? collection(firestore, 'medicines') : null, [firestore, user]);
  const { data: medicines } = useCollection<Medicine>(medicinesQuery);

  const suppliersQuery = useMemoFirebase(() => firestore && user ? collection(firestore, 'suppliers') : null, [firestore, user]);
  const { data: suppliers } = useCollection<Supplier>(suppliersQuery);

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [medicinePopoverOpen, setMedicinePopoverOpen] = useState(false);
  const [supplierPopoverOpen, setSupplierPopoverOpen] = useState(false);

  const handleMedicineSelect = (med: Medicine) => {
    setSelectedMedicine(med);
    setPrice(med.basePurchasePrice); // Default to base purchase price
    setMedicinePopoverOpen(false);
  };

  const handleAddItem = () => {
    if (!selectedMedicine) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a medicine.' });
      return;
    }
    if (quantity <= 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Quantity must be greater than zero.' });
      return;
    }

    const newItem: OrderItem = {
      medicine: selectedMedicine,
      quantity,
      pricePerUnit: price,
      totalPrice: quantity * price,
    };
    
    setOrderItems(prev => [...prev, newItem]);
    // Reset form
    setSelectedMedicine(null);
    setQuantity(1);
    setPrice(0);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };
  
  const totalAmount = useMemo(() => {
    return orderItems.reduce((acc, item) => acc + item.totalPrice, 0);
  }, [orderItems]);


  const handleSavePurchaseOrder = async () => {
    if (orderItems.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Cannot create an empty purchase order.' });
      return;
    }
    if (!selectedSupplier) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a supplier.' });
      return;
    }
    if (!firestore || !user) return;

    setIsSubmitting(true);
    try {
      const batch = writeBatch(firestore);
      const now = new Date().toISOString();

      // 1. Create PurchaseOrder doc
      const poRef = doc(collection(firestore, 'purchase_orders'));
      const poData = {
        supplierId: selectedSupplier.id,
        orderDate: now,
        status: 'Pending',
        totalAmount,
        createdByUserId: user.uid,
        createdAt: now,
        updatedAt: now,
      };
      batch.set(poRef, poData);

      // 2. Create PurchaseOrderItem docs
      for (const item of orderItems) {
        const poItemRef = doc(collection(firestore, `purchase_orders/${poRef.id}/purchase_order_items`));
        const poItemData = {
          purchaseOrderId: poRef.id,
          medicineId: item.medicine.id,
          requestedQuantity: item.quantity,
          unitPriceAtOrder: item.pricePerUnit,
          totalPrice: item.totalPrice,
          createdAt: now,
          updatedAt: now,
        };
        batch.set(poItemRef, poItemData);
      }
      
      // 3. Update Supplier's accountPayableBalance
      const supplierRef = doc(firestore, 'suppliers', selectedSupplier.id);
      const newBalance = (selectedSupplier.accountPayableBalance || 0) + totalAmount;
      batch.update(supplierRef, { accountPayableBalance: newBalance });
      
      await batch.commit();

      toast({ title: 'Purchase Order Created', description: 'The PO has been saved and supplier balance updated.' });
      router.push('/purchase-orders');

    } catch (error) {
      console.error("Error creating purchase order:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not create the purchase order. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold md:text-2xl">Create Purchase Order</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 flex flex-col gap-8">
                {/* Item Entry Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Add Medicine to Order</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-10 gap-4 items-end">
                            <div className="md:col-span-4">
                                <label className="text-sm font-medium">Medicine</label>
                                <Popover open={medicinePopoverOpen} onOpenChange={setMedicinePopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" className={cn("w-full justify-between", !selectedMedicine && "text-muted-foreground")} disabled={!medicines}>
                                            {selectedMedicine ? selectedMedicine.name : "Select medicine"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search medicine..." />
                                            <CommandList>
                                                <CommandEmpty>{!medicines ? 'Loading...' : 'No medicine found.'}</CommandEmpty>
                                                <CommandGroup>
                                                    {medicines?.map((med) => (
                                                    <CommandItem value={med.name} key={med.id} onSelect={() => handleMedicineSelect(med)}>
                                                        <Check className={cn("mr-2 h-4 w-4", med.id === selectedMedicine?.id ? "opacity-100" : "opacity-0")} />
                                                        {med.name}
                                                    </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor='quantity' className="text-sm font-medium">Quantity (Units)</label>
                                <Input id="quantity" type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor='price' className="text-sm font-medium">Price per Unit</label>
                                <Input id="price" type="number" step="0.01" value={price} onChange={e => setPrice(parseFloat(e.target.value) || 0)} />
                            </div>
                            <div className='md:col-span-2'>
                                <Button onClick={handleAddItem} className="w-full">Add Item</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                {/* Order Items Table */}
                <Card>
                    <CardHeader><CardTitle>Order Items</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Medicine</TableHead>
                                    <TableHead className="text-center">Quantity</TableHead>
                                    <TableHead className="text-right">Unit Price</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orderItems.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center h-24">Your order is empty.</TableCell></TableRow> 
                                ) : orderItems.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{item.medicine.name}</TableCell>
                                        <TableCell className="text-center">{item.quantity}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.pricePerUnit)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.totalPrice)}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Checkout Panel */}
            <div className="lg:col-span-1">
                <Card className="sticky top-24">
                    <CardHeader><CardTitle>Finalize Order</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <label className="text-sm font-medium">Supplier</label>
                            <Popover open={supplierPopoverOpen} onOpenChange={setSupplierPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" className={cn("w-full justify-between", !selectedSupplier && "text-muted-foreground")} disabled={!suppliers}>
                                        {selectedSupplier ? selectedSupplier.name : "Select supplier"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search supplier..." />
                                        <CommandList>
                                            <CommandEmpty>{!suppliers ? 'Loading...' : 'No supplier found.'}</CommandEmpty>
                                            <CommandGroup>
                                                {suppliers?.map((sup) => (
                                                <CommandItem value={sup.name} key={sup.id} onSelect={() => { setSelectedSupplier(sup); setSupplierPopoverOpen(false); }}>
                                                    <Check className={cn("mr-2 h-4 w-4", sup.id === selectedSupplier?.id ? "opacity-100" : "opacity-0")} />
                                                    {sup.name}
                                                </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total Order Amount</span>
                            <span>{formatCurrency(totalAmount)}</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSavePurchaseOrder} className="w-full" size="lg" disabled={isSubmitting || orderItems.length === 0 || !selectedSupplier}>
                            {isSubmitting ? 'Saving...' : 'Save Purchase Order'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    </main>
  );
}
