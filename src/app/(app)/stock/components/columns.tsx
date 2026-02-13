'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Batch } from '@/lib/types';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { format } from 'date-fns';

export const Columns = () => {
    const [isDeleteOpen, setDeleteOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

    const columns: ColumnDef<Batch>[] = [
        {
            accessorKey: 'medicineName',
            header: 'Medicine Name',
        },
        {
            accessorKey: 'batchNumber',
            header: 'Batch No.',
        },
        {
            accessorKey: 'expiryDate',
            header: 'Expiry Date',
            cell: ({ row }) => format(new Date(row.getValue('expiryDate')), 'MMM yyyy'),
        },
        {
            accessorKey: 'quantityInSmallestUnits',
            header: () => <div className="text-right">Quantity (units)</div>,
            cell: ({ row }) => <div className="text-right">{row.getValue('quantityInSmallestUnits')}</div>,
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const batch = row.original;
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
                                className="text-destructive"
                                onClick={() => {
                                    setSelectedBatch(batch);
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
        isDeleteOpen,
        setDeleteOpen,
        selectedBatch
    };
};
