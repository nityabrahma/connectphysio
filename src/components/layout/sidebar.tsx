
'use client';

import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Home,
  Package,
  Settings,
  Users,
  CreditCard,
  UserCog,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '../icons';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, roles: ['admin', 'receptionist', 'therapist'] },
  { href: '/appointments', label: 'Appointments', icon: Calendar, roles: ['admin', 'receptionist', 'therapist'] },
  { href: '/patients', label: 'Patients', icon: Users, roles: ['admin', 'receptionist', 'therapist'] },
  { href: '/packages', label: 'Packages', icon: Package, roles: ['admin', 'receptionist'] },
  { href: '/billing', label: 'Billing', icon: CreditCard, roles: ['admin'] },
  { href: '/users', label: 'Users', icon: UserCog, roles: ['admin'] },
  { href: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="hidden w-64 flex-col border-r bg-card md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-3 font-semibold">
          <div className="p-2 bg-primary text-primary-foreground rounded-full">
            <Icons.logo className="h-6 w-6" />
          </div>
          <span className="text-lg">TheraSuite</span>
        </Link>
      </div>
      <div className="flex flex-1 flex-col justify-between overflow-y-auto">
        <nav className="grid items-start px-4 py-4 text-sm font-medium">
          {navItems.map((item) =>
            user && item.roles.includes(user.role) ? (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) && 'bg-accent text-accent-foreground font-semibold'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ) : null
          )}
        </nav>
        <div className="px-4 py-4 mt-auto">
           <Link
              href="#"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
              )}
            >
              <HelpCircle className="h-5 w-5" />
              Help and docs
            </Link>
        </div>
      </div>
    </aside>
  );
}
