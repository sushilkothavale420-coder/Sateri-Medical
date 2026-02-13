'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Boxes,
  ShoppingBag,
  Users,
  Truck,
  BarChart2,
  Settings,
  LogOut,
  Handshake,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/firebase';
import Link from 'next/link';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', adminOnly: false },
  { href: '/medicines', icon: Boxes, label: 'Medicines', adminOnly: false },
  { href: '/sales', icon: ShoppingBag, label: 'Sales (POS)', adminOnly: false },
  { href: '/customers', icon: Users, label: 'Customers', adminOnly: false },
  { href: '/retailers', icon: Handshake, label: 'Retailers', adminOnly: true },
  { href: '/reports', icon: BarChart2, label: 'Reports', adminOnly: true },
];

export function AppSidebar() {
  const pathname = usePathname();
  const auth = useAuth();

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-headline font-semibold text-sidebar-foreground">
            Sateri Medical
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
             <SidebarMenuButton asChild tooltip={{ children: 'Settings' }}>
                <Link href="/settings">
                  <Settings />
                  <span>Settings</span>
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => auth.signOut()} tooltip={{ children: 'Logout' }}>
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
