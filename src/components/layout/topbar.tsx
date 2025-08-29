
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
import { SidebarTrigger } from "../ui/sidebar";

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
  { href: "/settings", label: "Settings", icon: Settings, roles: ["admin"] },
];

export function Topbar() {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 shrink-0 z-30">
      <div className="flex items-center gap-4 w-full">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 min-w-fit font-semibold"
        >
          <Icons.logo className="h-10 w-10" />
          <span className="text-lg whitespace-nowrap">{user?.centreName || "ConnectPhysio"}</span>
        </Link>
        <SidebarTrigger />
      </div>

      <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <UserNav />
      </div>
    </header>
  );
}
