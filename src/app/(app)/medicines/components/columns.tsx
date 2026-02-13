'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Medicine } from '@/lib/types';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { DeleteMedicineDialog } from './delete-medicine-dialog';
import { EditMedicineDialog } from './edit-medicine-dialog';

export const Columns = () => {
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);


  const columns: ColumnDef<Medicine>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'composition',
      header: 'Composition',
    },
    {
        accessorKey: 'company',
        header: 'Company',
    },
    {
      accessorKey: 'baseSellingPrice',
      header: () => <div className="text-right">Unit Price</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('baseSellingPrice'));
        const formatted = new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
        }).format(amount);
        return <div className="font-medium text-right">{formatted}</div>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const medicine = row.original;
  
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
                  setSelectedMedicine(medicine);
                  setEditOpen(true);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setSelectedMedicine(medicine);
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
    selectedMedicine
  };
};
