
'use client';

import {
  Menu,
  Home,
  Users,
  Calendar,
  Package,
  CreditCard,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { UserNav } from './user-nav';
import { Icons } from '../icons';
import { useAuth } from '@/hooks/use-auth';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';


const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home, roles: ['admin', 'receptionist', 'therapist'] },
    { href: '/appointments', label: 'Appointments', icon: Calendar, roles: ['admin', 'receptionist', 'therapist'] },
    { href: '/patients', label: 'Patients', icon: Users, roles: ['admin', 'receptionist', 'therapist'] },
    { href: '/packages', label: 'Packages', icon: Package, roles: ['admin', 'receptionist'] },
    { href: '/billing', label: 'Billing', icon: CreditCard, roles: ['admin'] },
    { href: '/users', label: 'Users', icon: Users, roles: ['admin'] },
    { href: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
  ];

export function Topbar() {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 sticky top-0 z-30">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="#"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Icons.logo className="h-10 w-10 text-primary" />
              <span className="sr-only">ConnectPhysio</span>
            </Link>
            {navItems.map((item) =>
                user && item.roles.includes(user.role) ? (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                        pathname === item.href && 'bg-muted text-primary'
                    )}
                >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                </Link>
                ) : null
            )}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <UserNav />
      </div>
    </header>
  );
}
