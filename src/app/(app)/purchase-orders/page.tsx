'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { PurchaseOrder, Supplier } from '@/lib/types';
import { PurchaseOrdersDataTable } from './components/po-data-table';
import { columns } from './components/columns';
import { useAdmin } from '@/hooks/use-admin';
import Link from 'next/link';
import { useMemo } from 'react';

export default function PurchaseOrdersPage() {
  const firestore = useFirestore();
  const { isAdmin } = useAdmin();

  const poQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'purchase_orders'), orderBy('orderDate', 'desc')) : null),
    [firestore]
  );
  const { data: purchaseOrders } = useCollection<PurchaseOrder>(poQuery);

  const suppliersQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'suppliers') : null),
    [firestore]
  );
  const { data: suppliers } = useCollection<Supplier>(suppliersQuery);

  const suppliersMap = useMemo(() => {
    if (!suppliers) return new Map<string, string>();
    return new Map(suppliers.map(s => [s.id, s.name]));
  }, [suppliers]);

  const purchaseOrdersWithSupplierNames = useMemo(() => {
    if (!purchaseOrders) return [];
    return purchaseOrders.map(po => ({
        ...po,
        supplierName: suppliersMap.get(po.supplierId) || po.supplierId,
    }));
  }, [purchaseOrders, suppliersMap]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold md:text-2xl">Purchase Orders</h1>
          {isAdmin && (
            <Button size="sm" className="h-8 gap-1" asChild>
                <Link href="/purchase-orders/create">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Create Purchase Order
                    </span>
                </Link>
            </Button>
          )}
        </div>
        
        <PurchaseOrdersDataTable columns={columns} data={purchaseOrdersWithSupplierNames} />
      </main>
    </div>
  );
}
