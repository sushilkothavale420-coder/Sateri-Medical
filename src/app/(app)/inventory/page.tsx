import { Header } from "@/components/header";

export default function InventoryPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header pageTitle="Inventory" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Inventory</h1>
          {/* Add Medicine Button will go here */}
        </div>
        {/* Data Table will go here */}
      </main>
    </div>
  );
}
