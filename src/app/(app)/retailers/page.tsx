import { Header } from "@/components/header";

export default function RetailersPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header pageTitle="Retailers" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Retailers</h1>
        </div>
        {/* Retailer Data Table & request UI will go here */}
      </main>
    </div>
  );
}
