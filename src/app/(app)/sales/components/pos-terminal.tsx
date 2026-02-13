'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, getDocs, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { Medicine, Customer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, PlusCircle, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AddCustomerDialog } from '@/app/(app)/customers/components/add-customer-dialog';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type CartItem = {
  medicine: Medicine;
  quantity: number;
  units: 'Tablet' | 'Strip' | 'Box';
  totalSmallestUnits: number;
  price: number;
};

type PaymentMethod = 'Cash' | 'UPI' | 'UDHAR';

export function PosTerminal() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [units, setUnits] = useState<'Tablet' | 'Strip' | 'Box'>('Strip');
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [medicinePopoverOpen, setMedicinePopoverOpen] = useState(false);
  const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false);
  const [isAddCustomerOpen, setAddCustomerOpen] = useState(false);


  useEffect(() => {
    if (!firestore) return;

    const fetchData = async () => {
      const medSnapshot = await getDocs(collection(firestore, 'medicines'));
      setMedicines(medSnapshot.docs.map(d => ({ ...d.data(), id: d.id })) as Medicine[]);

      const custSnapshot = await getDocs(collection(firestore, 'customers'));
      setCustomers(custSnapshot.docs.map(d => ({ ...d.data(), id: d.id })) as Customer[]);
    };

    fetchData();
  }, [firestore]);

  const handleAddToBill = () => {
    if (!selectedMedicine) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a medicine.' });
      return;
    }
    if (quantity <= 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Quantity must be greater than zero.' });
      return;
    }

    const tabletsPerStrip = selectedMedicine.tabletsPerStrip || 1;
    const stripsPerBox = selectedMedicine.stripsPerBox || 1;
    
    let totalSmallestUnits = 0;
    if (units === 'Tablet') totalSmallestUnits = quantity;
    if (units === 'Strip') totalSmallestUnits = quantity * tabletsPerStrip;
    if (units === 'Box') totalSmallestUnits = quantity * stripsPerBox * tabletsPerStrip;
    
    const price = totalSmallestUnits * selectedMedicine.baseSellingPrice;

    const newItem: CartItem = {
      medicine: selectedMedicine,
      quantity,
      units,
      totalSmallestUnits,
      price,
    };
    
    setCart(prevCart => [...prevCart, newItem]);
    setSelectedMedicine(null);
    setQuantity(1);
    setUnits('Strip');
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };
  
  const { subtotal, totalTax, grandTotal } = useMemo(() => {
    let sub = 0;
    let tax = 0;
    cart.forEach(item => {
      const itemSubtotal = item.price;
      const itemTax = itemSubtotal * ((item.medicine.taxRateGst || 0) / 100);
      sub += itemSubtotal;
      tax += itemTax;
    });
    return { subtotal: sub, totalTax: tax, grandTotal: sub + tax };
  }, [cart]);


  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Cannot complete an empty sale.' });
      return;
    }
    if (paymentMethod === 'UDHAR' && !selectedCustomer) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a customer for credit sales.' });
      return;
    }
    if (!firestore || !user) return;

    setIsSubmitting(true);
    try {
      const batch = writeBatch(firestore);

      const saleRef = doc(collection(firestore, 'sales'));
      const saleData = {
        saleDate: new Date().toISOString(),
        customerId: selectedCustomer?.id || null,
        totalAmountBeforeTax: subtotal,
        totalTaxAmount: totalTax,
        totalAmountDue: grandTotal,
        amountPaid: paymentMethod !== 'UDHAR' ? grandTotal : 0,
        balanceDue: paymentMethod === 'UDHAR' ? grandTotal : 0,
        paymentMethod,
        invoiceNumber: `INV-${Date.now()}`,
        createdByUserId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      batch.set(saleRef, saleData);

      for (const item of cart) {
        // NOTE: In a real app, you'd implement FEFO logic here to find the correct batchId.
        // For now, we are skipping stock deduction and batch linking.
        const saleItemRef = doc(collection(firestore, `sales/${saleRef.id}/sale_items`));
        const saleItemData = {
          saleId: saleRef.id,
          medicineId: item.medicine.id,
          batchId: 'N/A', // Placeholder
          quantitySold: item.totalSmallestUnits,
          unitSellingPrice: item.medicine.baseSellingPrice,
          purchasePriceAtSale: item.medicine.basePurchasePrice, // For profit calculation
          gstRateApplied: item.medicine.taxRateGst || 0,
          itemTotalBeforeTax: item.price,
          itemTaxAmount: item.price * ((item.medicine.taxRateGst || 0) / 100),
          itemTotalWithTax: item.price * (1 + ((item.medicine.taxRateGst || 0) / 100)),
          createdAt: serverTimestamp(),
        };
        batch.set(saleItemRef, saleItemData);
      }
      
      if (paymentMethod === 'UDHAR' && selectedCustomer) {
        const customerRef = doc(firestore, 'customers', selectedCustomer.id);
        batch.update(customerRef, {
          debtAmount: (selectedCustomer.debtAmount || 0) + grandTotal
        });
      }
      
      await batch.commit();

      toast({ title: 'Sale Completed', description: 'The sale has been recorded successfully.' });
      // Reset state
      setCart([]);
      setSelectedCustomer(null);
      setPaymentMethod('Cash');

    } catch (error) {
      console.error("Error completing sale:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not complete the sale. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left panel */}
      <div className="lg:col-span-2 flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Add Medicine to Bill</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
              <div className="md:col-span-3">
                  <label className="text-sm font-medium">Medicine</label>
                  <Popover open={medicinePopoverOpen} onOpenChange={setMedicinePopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn("w-full justify-between", !selectedMedicine && "text-muted-foreground")}
                        >
                          {selectedMedicine ? selectedMedicine.name : "Select medicine"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Search medicine..." />
                        <CommandList>
                          <CommandEmpty>No medicine found.</CommandEmpty>
                          <CommandGroup>
                            {medicines.map((med) => (
                              <CommandItem
                                value={med.name}
                                key={med.id}
                                onSelect={() => {
                                  setSelectedMedicine(med);
                                  setMedicinePopoverOpen(false);
                                }}
                              >
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

              <div>
                <label htmlFor='quantity' className="text-sm font-medium">Quantity</label>
                <Input id="quantity" type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
              </div>
              
              <div>
                <label htmlFor='units' className="text-sm font-medium">Units</label>
                <Select value={units} onValueChange={(v: 'Tablet' | 'Strip' | 'Box') => setUnits(v)}>
                    <SelectTrigger id="units">
                        <SelectValue placeholder="Units" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Tablet">Tablet</SelectItem>
                        <SelectItem value="Strip">Strip</SelectItem>
                        <SelectItem value="Box">Box</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              <div className='md:col-span-1'>
                <Button onClick={handleAddToBill} className="w-full">Add to Bill</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Bill Items</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Medicine</TableHead>
                            <TableHead className="text-center">Quantity</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cart.length === 0 ? (
                           <TableRow>
                               <TableCell colSpan={4} className="text-center h-24">
                                   Your bill is empty.
                               </TableCell>
                           </TableRow> 
                        ) : cart.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{item.medicine.name}</TableCell>
                                <TableCell className="text-center">{item.quantity} {item.units}(s)</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveFromCart(index)}>
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

      {/* Right panel */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium">Customer</label>
              <div className="flex gap-2">
                <Popover open={customerPopoverOpen} onOpenChange={setCustomerPopoverOpen}>
                  <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn("w-full justify-between", !selectedCustomer && "text-muted-foreground")}
                      >
                        {selectedCustomer ? selectedCustomer.name : "Select customer (optional)"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search customer..." />
                      <CommandList>
                        <CommandEmpty>No customer found.</CommandEmpty>
                        <CommandGroup>
                          {customers.map((cust) => (
                            <CommandItem
                              value={cust.name}
                              key={cust.id}
                              onSelect={() => {
                                setSelectedCustomer(cust);
                                setCustomerPopoverOpen(false);
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", cust.id === selectedCustomer?.id ? "opacity-100" : "opacity-0")} />
                              {cust.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <AddCustomerDialog isOpen={isAddCustomerOpen} onOpenChange={setAddCustomerOpen}>
                  <Button size="icon" variant="outline" onClick={() => setAddCustomerOpen(true)}>
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </AddCustomerDialog>
              </div>
            </div>
            
            <div>
              <label htmlFor='payment' className="text-sm font-medium">Payment Method</label>
              <Select value={paymentMethod} onValueChange={(v: PaymentMethod) => setPaymentMethod(v)}>
                  <SelectTrigger id="payment">
                      <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="UDHAR">UDHAR (Credit)</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (GST)</span>
                <span>{formatCurrency(totalTax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleCompleteSale} className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Complete Sale'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
