import { Header } from "@/components/header";

export default function SalesPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header pageTitle="Point of Sale" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Sales</h1>
        </div>
        {/* POS UI will go here */}
      </main>
    </div>
  );
}
