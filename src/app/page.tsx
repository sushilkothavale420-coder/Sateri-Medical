'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import React, { useEffect, useState } from 'react';
import { RequestMedicineDialog } from '@/components/request-medicine-dialog';

export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isRequestOpen, setRequestOpen] = useState(false);

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }
  
  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-background">
      <div className="relative w-full max-w-6xl">
        <div className="absolute top-0 right-0 flex items-center gap-4">
          <RequestMedicineDialog isOpen={isRequestOpen} onOpenChange={setRequestOpen}>
            <Button variant="outline">Request a Medicine</Button>
          </RequestMedicineDialog>
          <Button asChild>
            <Link href="/login">Admin Login</Link>
          </Button>
        </div>

        <div className="mb-12 mt-20">
            <Carousel
              plugins={[plugin.current]}
              className="w-full"
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
              opts={{
                loop: true,
              }}
            >
              <CarouselContent>
                {PlaceHolderImages.map((img) => (
                  <CarouselItem key={img.id}>
                    <div className="p-1">
                      <Card>
                        <CardContent className="relative flex aspect-[3/2] items-center justify-center p-0 overflow-hidden rounded-lg">
                          <Image
                            src={img.imageUrl}
                            alt={img.description}
                            fill
                            className="object-cover"
                            data-ai-hint={img.imageHint}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
        </div>

        <div className="text-center">
            <h1 className="text-5xl font-semibold text-primary mb-4">
            Welcome to Sateri Medical
            </h1>
            <p className="text-lg text-muted-foreground mb-12">
            Your all-in-one solution for efficient pharmacy management. Streamline your inventory, sales, and customer relations with our powerful tools.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Track medicine stock, manage batches with expiry dates, and get low-stock alerts to ensure you never run out of critical supplies.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Sales & Billing (POS)</CardTitle>
            </CardHeader>
            <CardContent>
              <p>A fast and intuitive Point of Sale system to handle customer billing, manage payments, and keep a detailed record of all transactions.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>User & Customer Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Administer user roles, manage your customer database, and track customer account balances and transaction history with ease.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Reporting & Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Generate insightful reports on sales, inventory, and customer data to make informed business decisions and optimize your operations.</p>
            </CardContent>
          </Card>
        </div>

      </div>
    </main>
  );
}
