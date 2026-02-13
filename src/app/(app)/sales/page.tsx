'use client';

import { PosTerminal } from "./components/pos-terminal";

export default function SalesPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <h1 className="text-lg font-semibold md:text-2xl">Point of Sale</h1>
        <PosTerminal />
      </main>
    </div>
  );
}
