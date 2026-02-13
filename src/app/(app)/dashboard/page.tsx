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
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Boxes,
  Clock,
  DollarSign,
  PackageCheck,
} from "lucide-react";
import { SalesChart } from "./components/sales-chart";
import { medicines, sales } from "@/lib/placeholder-data";
import { differenceInDays, parseISO } from "date-fns";

export default function DashboardPage() {
  const expiringSoon = medicines.filter(
    (m) =>
      differenceInDays(parseISO(m.expiryDate), new Date()) <= 90 &&
      differenceInDays(parseISO(m.expiryDate), new Date()) > 0
  );
  const expiringIn30 = expiringSoon.filter(
    (m) => differenceInDays(parseISO(m.expiryDate), new Date()) <= 30
  ).length;
  const expiringIn60 = expiringSoon.filter(
    (m) =>
      differenceInDays(parseISO(m.expiryDate), new Date()) > 30 &&
      differenceInDays(parseISO(m.expiryDate), new Date()) <= 60
  ).length;
  const expiringIn90 = expiringSoon.filter(
    (m) =>
      differenceInDays(parseISO(m.expiryDate), new Date()) > 60 &&
      differenceInDays(parseISO(m.expiryDate), new Date()) <= 90
  ).length;

  const lowStock = medicines.filter((m) => m.quantity <= m.lowStockThreshold).length;

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
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Low Stock Items
              </CardTitle>
              <Boxes className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStock}</div>
              <p className="text-xs text-muted-foreground">
                Items needing reorder
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
                {expiringIn30 + expiringIn60 + expiringIn90}
              </div>
              <div className="text-xs text-muted-foreground flex gap-2">
                <span className="text-red-500">{expiringIn30} in 30d</span>
                <span className="text-orange-500">{expiringIn60} in 60d</span>
                <span className="text-yellow-500">{expiringIn90} in 90d</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <PackageCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12,234</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
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
                You made 265 sales this month.
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
                  {sales.slice(0, 5).map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        <div className="font-medium">{sale.customerName}</div>
                        <div className="hidden text-sm text-muted-foreground md:inline">
                          {sale.medicineName}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        ${sale.totalPrice.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
