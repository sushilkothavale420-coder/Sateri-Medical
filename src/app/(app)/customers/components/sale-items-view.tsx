'use client';

import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { SaleItem, Medicine } from "@/lib/types";
import { collection } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMemo } from "react";

type SaleItemsTableProps = {
    saleId: string;
};

export function SaleItemsTable({ saleId }: SaleItemsTableProps) {
    const firestore = useFirestore();
    const { user } = useUser();

    const saleItemsQuery = useMemoFirebase(
        () => (firestore && user ? collection(firestore, 'sales', saleId, 'sale_items') : null),
        [firestore, saleId, user]
    );
    const { data: saleItems, isLoading: isSaleItemsLoading } = useCollection<SaleItem>(saleItemsQuery);

    const medicinesQuery = useMemoFirebase(
      () => (firestore && user ? collection(firestore, 'medicines') : null),
      [firestore, user]
    );
    const { data: medicines, isLoading: areMedicinesLoading } = useCollection<Medicine>(medicinesQuery);

    const medicinesMap = useMemo(() => {
        if (!medicines) return new Map<string, string>();
        return new Map(medicines.map(m => [m.id, m.name]));
    }, [medicines]);

    const isLoading = isSaleItemsLoading || areMedicinesLoading;
    
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

    if (isLoading) {
        return <div className="p-4 text-center text-sm text-muted-foreground">Loading sale items...</div>;
    }

    if (!saleItems || saleItems.length === 0) {
        return <div className="p-4 text-center text-sm text-muted-foreground">No items found for this sale.</div>;
    }

    return (
        <div className="px-4 pb-4 bg-muted/50 rounded-b-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Medicine</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {saleItems.map(item => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{medicinesMap.get(item.medicineId) || item.medicineId}</TableCell>
                            <TableCell className="text-center">{item.quantitySold}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.unitSellingPrice)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.itemTotalWithTax)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
