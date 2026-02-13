'use client';

import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Boxes,
  PackageCheck,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { SalesChart } from "./components/sales-chart";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collectionGroup, query, orderBy, limit, collection } from "firebase/firestore";
import { Sale, SaleItem, Customer } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";

export default function DashboardPage() {
  const firestore = useFirestore();
  const [customerNames, setCustomerNames] = useState<Record<string, string>>({});

  const saleItemsQuery = useMemoFirebase(
    () => (firestore ? query(collectionGroup(firestore, 'sale_items')) : null),
    [firestore]
  );
  const { data: saleItems } = useCollection<SaleItem>(saleItemsQuery);

  const recentSalesQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'sales'), orderBy('saleDate', 'desc'), limit(5)) : null),
    [firestore]
  );
  const { data: recentSales } = useCollection<Sale>(recentSalesQuery);

  const customersQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'customers') : null),
    [firestore]
  );
  const { data: customers } = useCollection<Customer>(customersQuery);

  useEffect(() => {
    if (customers) {
      const names = customers.reduce((acc, customer) => {
        acc[customer.id] = customer.name;
        return acc;
      }, {} as Record<string, string>);
      setCustomerNames(names);
    }
  }, [customers]);

  const { totalRevenue, totalProfit, totalSales } = useMemo(() => {
    if (!saleItems) {
      return { totalRevenue: 0, totalProfit: 0, totalSales: 0 };
    }
    const revenue = saleItems.reduce((acc, item) => acc + item.itemTotalWithTax, 0);
    const profit = saleItems.reduce((acc, item) => {
      const itemProfit = (item.unitSellingPrice - (item.purchasePriceAtSale || 0)) * item.quantitySold;
      return acc + itemProfit;
    }, 0);
    return { 
      totalRevenue: revenue, 
      totalProfit: profit,
      totalSales: recentSales?.length || 0
    };
  }, [saleItems, recentSales]);
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header pageTitle="Dashboard" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-background">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                Total revenue from all sales
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalProfit)}</div>
              <p className="text-xs text-muted-foreground">
                Estimated profit from all sales
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
              <div className="text-2xl font-bold">
                0
              </div>
              <div className="text-xs text-muted-foreground flex gap-2">
                No expiry data available
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <PackageCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSales}</div>
              <p className="text-xs text-muted-foreground">
                Total sales transactions recorded
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="font-headline">Sales Overview</CardTitle>
              <CardDescription>
                Monthly performance of top-selling medicines.
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <SalesChart />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Recent Sales</CardTitle>
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
                          <div className="font-medium">{sale.customerId ? customerNames[sale.customerId] || 'Walk-in' : 'Walk-in'}</div>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(sale.totalAmountDue)}</TableCell>
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
      </main>
    </div>
  );
}

    