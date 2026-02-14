'use client';

import {
  collection,
  query,
  limit,
  documentId,
  orderBy,
  where,
  collectionGroup,
} from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  useUser,
} from '@/firebase';
import Link from 'next/link';

import { Customer, Sale, SaleItem } from '@/lib/types';
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
import { IndianRupee, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [customerNames, setCustomerNames] = useState<Record<string, string>>(
    {}
  );

  // --- Data Queries ---
  const salesQuery = useMemoFirebase(() => (firestore && user ? collection(firestore, 'sales') : null), [firestore, user]);
  const { data: sales } = useCollection<Sale>(salesQuery);

  const customersQuery = useMemoFirebase(() => (firestore && user ? collection(firestore, 'customers') : null), [firestore, user]);
  const { data: customers } = useCollection<Customer>(customersQuery);

  const saleItemsQuery = useMemoFirebase(() => (firestore && user ? collectionGroup(firestore, 'sale_items') : null), [firestore, user]);
  const { data: allSaleItems } = useCollection<SaleItem>(saleItemsQuery);

  const recentSalesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'sales'), orderBy('saleDate', 'desc'), limit(5));
  }, [firestore, user]);
  const { data: recentSales } = useCollection<Sale>(recentSalesQuery);
  
  const recentCustomerIds = useMemo(() => {
    if (!recentSales) return [];
    const customerIds = recentSales.map(sale => sale.customerId).filter((id): id is string => !!id);
    return customerIds.length > 0 ? [...new Set(customerIds)] : [];
  }, [recentSales]);

  const recentCustomersQuery = useMemoFirebase(() => {
    if (!firestore || !user || recentCustomerIds.length === 0) return null;
    return query(collection(firestore, 'customers'), where(documentId(), 'in', recentCustomerIds));
  }, [firestore, user, recentCustomerIds]);
  const { data: recentCustomers } = useCollection<Customer>(recentCustomersQuery);

  // --- Memoized Calculations ---
  const totalRevenue = useMemo(() => sales?.reduce((acc, sale) => acc + sale.totalAmountDue, 0) ?? 0, [sales]);
  const totalCredit = useMemo(() => customers?.reduce((acc, customer) => acc + customer.debtAmount, 0) ?? 0, [customers]);
  
  const netProfit = useMemo(() => {
    if (!allSaleItems) return 0;
    return allSaleItems.reduce((acc, item) => {
      const cost = (item.purchasePriceAtSale || 0) * item.quantitySold;
      const profit = item.itemTotalWithTax - cost;
      return acc + profit;
    }, 0);
  }, [allSaleItems]);


  useEffect(() => {
    if (recentCustomers) {
      const names = recentCustomers.reduce((acc, customer) => {
        acc[customer.id] = customer.name;
        return acc;
      }, {} as Record<string, string>);
      setCustomerNames(names);
    }
  }, [recentCustomers]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-background">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(netProfit)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credit (Udhar)</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCredit)}</div>
            </CardContent>
          </Card>
           <Card className="border-destructive">
            <Link href="/stock?filter=expiring_soon">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-destructive">Expiring Soon</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">View Items</div>
                <p className="text-xs text-muted-foreground">
                  Click to see items expiring in the next 90 days.
                </p>
              </CardContent>
            </Link>
          </Card>
        </div>

        <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>Your 5 most recent sales transactions.</CardDescription>
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
                            {sale.customerId ? customerNames[sale.customerId] || 'Walk-in' : 'Walk-in'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(sale.totalAmountDue)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center h-24">
                        No recent sales.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
