'use client';

import { ColumnDef } from '@tanstack/react-table';
import { PurchaseOrder } from '@/lib/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export const columns: ColumnDef<PurchaseOrder>[] = [
  {
    accessorKey: 'supplierName',
    header: 'Supplier',
  },
  {
    accessorKey: 'orderDate',
    header: 'Order Date',
    cell: ({ row }) => format(new Date(row.getValue('orderDate')), 'PPP'),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <Badge variant="secondary">{row.getValue('status')}</Badge>,
  },
  {
    accessorKey: 'totalAmount',
    header: () => <div className="text-right">Total Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('totalAmount'));
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
];
