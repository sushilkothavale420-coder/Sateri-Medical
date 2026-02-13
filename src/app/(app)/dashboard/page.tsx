'use client';

import {
  AlertTriangle,
  Boxes,
  DollarSign,
  PackageCheck,
  TrendingUp,
  CircleHelp,
} from 'lucide-react';
import { collection, collectionGroup, limit, orderBy, query } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  useUser,
} from '@/firebase';

import { Batch, Customer, Sale, SaleItem } from '@/lib/types';
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
import { SalesChart } from './components/sales-chart';
import { format } from 'date-fns';

export default function DashboardPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [customerNames, setCustomerNames] = useState<Record<string, string>>(
    {}
  );
  const [expiringSoonCount, setExpiringSoonCount] = useState(0);

  const recentSalesQuery = useMemoFirebase(
    () => {
      if (!firestore || !user) return null;
      const salesCollection = collection(firestore, 'sales');
      return query(salesCollection, orderBy('saleDate', 'desc'), limit(5));
    },
    [firestore, user]
  );
  const { data: recentSales } = useCollection<Sale>(recentSalesQuery);

  const customersQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'customers') : null),
    [firestore]
  );
  const { data: customers } = useCollection<Customer>(customersQuery);

  const saleItemsQuery = useMemoFirebase(
    () => {
      if (!firestore || !user) return null;
      return collectionGroup(firestore, 'sale_items');
    },
    [firestore, user]
  );
  const { data: saleItems } = useCollection<SaleItem>(saleItemsQuery);
  
  const batchesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'batches') : null),
    [firestore]
  );
  const { data: batches } = useCollection<Batch>(batchesQuery);

  useEffect(() => {
    if (customers) {
      const names = customers.reduce(
        (acc, customer) => {
          acc[customer.id] = customer.name;
          return acc;
        },
        {} as Record<string, string>
      );
      setCustomerNames(names);
    }
  }, [customers]);

  useEffect(() => {
    if (batches) {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      const soonToExpire = batches.filter(batch => {
        const expiryDate = new Date(batch.expiryDate);
        return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
      });
      setExpiringSoonCount(soonToExpire.length);
    }
  }, [batches]);

  const { totalRevenue, totalProfit } = useMemo(() => {
    if (!saleItems) {
      return { totalRevenue: 0, totalProfit: 0 };
    }
    const revenue = saleItems.reduce(
      (acc, item) => acc + item.itemTotalWithTax,
      0
    );
    const profit = saleItems.reduce((acc, item) => {
      const itemProfit =
        (item.unitSellingPrice - (item.purchasePriceAtSale || 0)) *
        item.quantitySold;
      return acc + itemProfit;
    }, 0);
    return {
      totalRevenue: revenue,
      totalProfit: profit,
    };
  }, [saleItems]);

  const totalDebt = useMemo(() => {
    if (!customers) return 0;
    return customers.reduce((acc, customer) => acc + (customer.debtAmount || 0), 0);
  }, [customers]);

  const salesChartData = useMemo(() => {
    if (!saleItems) return [];

    const monthlySales: Record<string, { total: number }> = {};

    saleItems.forEach(item => {
      const createdAt = item.createdAt;
      if (!createdAt) return;

      // Handle both Firestore Timestamp and ISO string
      const date = (createdAt as any).toDate
        ? (createdAt as any).toDate()
        : new Date(createdAt as string);
      const monthKey = format(date, 'yyyy-MM');

      if (!monthlySales[monthKey]) {
        monthlySales[monthKey] = { total: 0 };
      }
      monthlySales[monthKey].total += item.itemTotalWithTax;
    });

    const data = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = format(d, 'yyyy-MM');
      const monthName = format(d, 'MMM');
      data.push({
        month: monthName,
        total: monthlySales[monthKey]?.total || 0,
      });
    }
    return data;
  }, [saleItems]);

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
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total revenue from all sales
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Net Profit
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalProfit)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Estimated profit from all sales
                </p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Credit (Udhar)
                </CardTitle>
                <CircleHelp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalDebt)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total outstanding from all customers
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Expiring Soon
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{expiringSoonCount}</div>
                <p className="text-xs text-muted-foreground">
                  Items expiring in the next 30 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Sales
                </CardTitle>
                <PackageCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{saleItems?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Total items sold across all sales
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>
                  Your sales performance for the last 6 months.
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <SalesChart data={salesChartData} />
              </CardContent>
            </Card>
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
