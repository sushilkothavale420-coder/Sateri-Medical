'use client';

import {
  AlertTriangle,
} from 'lucide-react';
import { collection, query, where, orderBy, limit, documentId } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  useUser,
} from '@/firebase';

import { Batch, Customer, Sale } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function DashboardPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [customerNames, setCustomerNames] = useState<Record<string, string>>(
    {}
  );

  const recentSalesQuery = useMemoFirebase(
    () => {
      if (!firestore || !user) return null;
      const salesCollection = collection(firestore, 'sales');
      return query(salesCollection, orderBy('saleDate', 'desc'), limit(5));
    },
    [firestore, user]
  );
  const { data: recentSales } = useCollection<Sale>(recentSalesQuery);
  
  const recentCustomerIds = useMemo(() => {
      if (!recentSales) return [];
      return [...new Set(recentSales.map(sale => sale.customerId).filter(id => id))];
  }, [recentSales]);

  const recentCustomersQuery = useMemoFirebase(() => {
      if (!firestore || !user || recentCustomerIds.length === 0) return null;
      return query(collection(firestore, 'customers'), where(documentId(), 'in', recentCustomerIds));
  }, [firestore, user, recentCustomerIds]);
  
  const { data: recentCustomers } = useCollection<Customer>(recentCustomersQuery);

  useEffect(() => {
    if (recentCustomers) {
      const names = recentCustomers.reduce(
        (acc, customer) => {
          acc[customer.id] = customer.name;
          return acc;
        },
        {} as Record<string, string>
      );
      setCustomerNames(names);
    }
  }, [recentCustomers]);

  const expiringBatchesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const todayStr = today.toISOString().split('T')[0];
    const thirtyDaysFromNowStr = thirtyDaysFromNow.toISOString().split('T')[0];

    return query(
        collection(firestore, 'batches'),
        where('expiryDate', '>=', todayStr),
        where('expiryDate', '<=', thirtyDaysFromNowStr),
        where('quantityInSmallestUnits', '>', 0)
    );
  }, [firestore, user]);
  const { data: expiringBatches } = useCollection<Batch>(expiringBatchesQuery);
  
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-background">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Expiring Soon
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{expiringBatches?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Items expiring in the next 30 days
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                  Your 5 most recent sales transactions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentSales && recentSales.length > 0 ? (
                      recentSales.map(sale => (
                        <TableRow key={sale.id}>
                          <TableCell>
                            <div className="font-medium">
                              {sale.customerId
                                ? customerNames[sale.customerId] || 'Walk-in'
                                : 'Walk-in'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(sale.totalAmountDue)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center">
                          No recent sales.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      </main>
    </div>
  );
}
