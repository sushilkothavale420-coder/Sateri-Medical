'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useDoc, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { Supplier, PurchaseOrder } from '@/lib/types';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, Home } from 'lucide-react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function SupplierDetailPage() {
  const router = useRouter();
  const params = useParams();
  const firestore = useFirestore();
  const { user } = useUser();
  const supplierId = params.id as string;

  const supplierDocRef = useMemoFirebase(() => (firestore && supplierId && user ? doc(firestore, 'suppliers', supplierId) : null), [firestore, supplierId, user]);
  const { data: supplier, isLoading: isSupplierLoading } = useDoc<Supplier>(supplierDocRef);

  const purchaseOrdersQuery = useMemoFirebase(() => (firestore && supplierId && user ? query(collection(firestore, 'purchase_orders'), where('supplierId', '==', supplierId), orderBy('orderDate', 'desc')) : null), [firestore, supplierId, user]);
  const { data: purchaseOrders, isLoading: arePOsLoading } = useCollection<PurchaseOrder>(purchaseOrdersQuery);
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const isLoading = isSupplierLoading || arePOsLoading;

  if (isLoading) {
    return <div className="flex items-center justify-center h-full p-8"><p>Loading supplier details...</p></div>;
  }

  if (!supplier) {
    return <div className="flex items-center justify-center h-full p-8"><p>Supplier not found.</p></div>;
  }
  
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold md:text-2xl">Supplier Details</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 items-start">
        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>{supplier.name}</CardTitle>
                    <CardDescription>Contact Information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {supplier.contactPerson && (
                        <p className='text-sm text-muted-foreground'>Contact: {supplier.contactPerson}</p>
                    )}
                    {supplier.phoneNumber && (
                        <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{supplier.phoneNumber}</span>
                        </div>
                    )}
                    {supplier.email && (
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{supplier.email}</span>
                        </div>
                    )}
                    {supplier.address && (
                         <div className="flex items-start gap-3">
                            <Home className="h-4 w-4 text-muted-foreground mt-1" />
                            <span className='text-sm'>{supplier.address}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Accounts Payable</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold tracking-tight">
                        {formatCurrency(supplier.accountPayableBalance)}
                    </div>
                    <p className="text-xs text-muted-foreground">Total balance due to supplier</p>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Purchase Order History</CardTitle>
                    <CardDescription>A record of all orders placed with this supplier.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {purchaseOrders && purchaseOrders.length > 0 ? (
                                purchaseOrders.map(po => (
                                    <TableRow key={po.id}>
                                        <TableCell>{format(new Date(po.orderDate), 'PPP')}</TableCell>
                                        <TableCell><Badge variant="secondary">{po.status}</Badge></TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(po.totalAmount)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        No purchase orders found for this supplier.
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
