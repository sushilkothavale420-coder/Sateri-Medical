'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell, CircleUser, AlertTriangle } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/firebase';
import Link from 'next/link';
import { Batch } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format, isPast } from 'date-fns';
import { useEffect, useState } from 'react';

type HeaderProps = {
  notifications: Batch[];
};

export function Header({ notifications }: HeaderProps) {
  const auth = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
      <SidebarTrigger />
      <div className="ml-auto flex items-center gap-4">
        {isClient ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full relative">
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 justify-center p-0">{notifications.length}</Badge>
                  )}
                  <span className="sr-only">Toggle notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    {notifications.length > 0 ? (
                        notifications.map(batch => (
                            <DropdownMenuItem key={batch.id} className="flex items-start gap-2">
                                <AlertTriangle className={`h-4 w-4 mt-1 ${isPast(new Date(batch.expiryDate)) ? 'text-destructive' : 'text-yellow-500'}`} />
                                <div>
                                    <p className="font-semibold">{batch.medicineName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Batch <span className='font-medium'>{batch.batchNumber}</span> {isPast(new Date(batch.expiryDate)) ? 'expired on' : 'expires on'} {format(new Date(batch.expiryDate), 'do MMM yyyy')}.
                                    </p>
                                </div>
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <DropdownMenuItem disabled>
                            No new notifications
                        </DropdownMenuItem>
                    )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <CircleUser className="h-5 w-5" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => auth.signOut()}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Button variant="ghost" size="icon" className="rounded-full" disabled>
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="secondary" size="icon" className="rounded-full" disabled>
              <CircleUser className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
