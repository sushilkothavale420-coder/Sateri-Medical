'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Supplier } from '@/lib/types';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import Link from 'next/link';

type ColumnsProps = {
  suppliersWithExpiringBatches: Set<string>;
  onInitiateReturn: (supplier: Supplier) => void;
};

export const Columns = ({ suppliersWithExpiringBatches, onInitiateReturn }: ColumnsProps) => {
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const supplier = row.original;
        const hasExpiringBatches = suppliersWithExpiringBatches.has(supplier.id);
        return (
          <div className="flex items-center gap-2">
            {hasExpiringBatches && (
              <div
                className="h-2 w-2 rounded-full bg-destructive"
                title="This supplier has items that are expiring soon."
              />
            )}
            <Link href={`/suppliers/${supplier.id}`} className="font-medium text-primary hover:underline">
              {supplier.name}
            </Link>
          </div>
        );
      },
    },
    {
      accessorKey: 'contactPerson',
      header: 'Contact Person',
    },
    {
      accessorKey: 'phoneNumber',
      header: 'Phone Number',
    },
    {
      accessorKey: 'accountPayableBalance',
      header: () => <div className="text-right">Balance Due</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('accountPayableBalance'));
        const formatted = new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
        }).format(amount);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const supplier = row.original;
        const hasExpiringBatches = suppliersWithExpiringBatches.has(supplier.id);
  
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedSupplier(supplier);
                  setEditOpen(true);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onInitiateReturn(supplier)}
                disabled={!hasExpiringBatches}
              >
                Initiate Return
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setSelectedSupplier(supplier);
                  setDeleteOpen(true);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return {
    columns,
    isEditOpen,
    setEditOpen,
    isDeleteOpen,
    setDeleteOpen,
    selectedSupplier,
  };
};
