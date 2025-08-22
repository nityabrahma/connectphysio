
"use client";

import {
  Menu,
  Home,
  Users,
  Calendar,
  Package,
  CreditCard,
  Settings,
  UserCog,
  ClipboardList
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserNav } from "./user-nav";
import { Icons } from "../icons";
import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Home,
    roles: ["admin", "receptionist", "therapist"],
  },
  {
    href: "/appointments",
    label: "Appointments",
    icon: Calendar,
    roles: ["admin", "receptionist", "therapist"],
  },
  {
    href: "/patients",
    label: "Patients",
    icon: Users,
    roles: ["admin", "receptionist", "therapist"],
  },
  {
    href: "/packages",
    label: "Packages",
    icon: Package,
    roles: ["admin", "receptionist"],
  },
  { href: "/billing", label: "Billing", icon: CreditCard, roles: ["admin"] },
  { href: "/users", label: "Users", icon: UserCog, roles: ["admin"] },
  { href: "/questionnaires", label: "Questionnaires", icon: ClipboardList, roles: ["admin"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["admin"] },
];

export function Topbar() {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 flex flex-col">
             <SheetHeader className="h-16 flex flex-row items-center border-b px-6">
                <Link
                href="/dashboard"
                className="flex items-center gap-3 font-semibold"
                >
                <Icons.logo className="h-10 w-10" />
                <span className="text-lg">{user?.centreName || "ConnectPhysio"}</span>
                </Link>
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">
                    Main navigation links for the application.
                </SheetDescription>
             </SheetHeader>
            <ScrollArea className="flex-1 p-4">
              <nav className="grid gap-2 text-lg font-medium">
                {navItems.map((item) =>
                  user && item.roles.includes(user.role) ? (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                          (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))) &&
                            "bg-accent text-accent-foreground font-semibold"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    </SheetClose>
                  ) : null
                )}
              </nav>
            </ScrollArea>
          </SheetContent>
        </Sheet>
        <Link
          href="/dashboard"
          className="flex items-center gap-3 font-semibold"
        >
          <Icons.logo className="h-10 w-10" />
          <span className="text-lg whitespace-nowrap">{user?.centreName || "ConnectPhysio"}</span>
        </Link>
      </div>

      <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <UserNav />
      </div>
    </header>
  );
}
