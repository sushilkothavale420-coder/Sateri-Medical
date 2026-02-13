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
  LifeBuoy,
  LogOut,
  Handshake,
  ChevronDown,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/firebase';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', adminOnly: false },
  { 
    label: 'Medicines', 
    icon: Boxes,
    adminOnly: false,
    subItems: [
      { href: '/medicines', label: 'Medicine List' },
    ]
  },
  { href: '/sales', icon: ShoppingBag, label: 'Sales (POS)', adminOnly: false },
  { href: '/customers', icon: Users, label: 'Customers', adminOnly: false },
  { href: '/retailers', icon: Handshake, label: 'Retailers', adminOnly: true },
  { href: '/suppliers', icon: Truck, label: 'Suppliers', adminOnly: true },
  { href: '/reports', icon: BarChart2, label: 'Reports', adminOnly: true },
];

export function AppSidebar() {
  const pathname = usePathname();
  const auth = useAuth();
  const [openCollapsibles, setOpenCollapsibles] = useState<string[]>(['Medicines']);

  const handleCollapsibleOpen = (label: string) => {
    setOpenCollapsibles(prev => 
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
    )
  }

  return (
    <Sidebar>
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
            item.subItems ? (
              <Collapsible key={item.label} open={openCollapsibles.includes(item.label)} onOpenChange={() => handleCollapsibleOpen(item.label)}>
                <CollapsibleTrigger asChild>
                   <SidebarMenuButton
                      className="w-full justify-between"
                      variant="default"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon />
                        <span>{item.label}</span>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", openCollapsibles.includes(item.label) && "rotate-180")} />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenu className="ml-4 mt-2 border-l border-sidebar-border pl-4">
                    {item.subItems.map(subItem => (
                       <SidebarMenuItem key={subItem.href}>
                          <SidebarMenuButton
                            asChild
                            isActive={pathname === subItem.href}
                            tooltip={{ children: subItem.label }}
                             variant="default"
                             size="sm"
                          >
                            <Link href={subItem.href}>
                              <span>{subItem.label}</span>
                            </Link>
                          </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>
            ) : (
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
            )
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
            <SidebarMenuButton tooltip={{ children: 'Support' }}>
              <LifeBuoy />
              <span>Support</span>
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
