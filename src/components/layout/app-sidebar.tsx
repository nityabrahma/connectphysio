
"use client";

import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Home,
  Package,
  Settings,
  Users,
  CreditCard,
  UserCog,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "../icons";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "../ui/sidebar";

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

export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <Sidebar collapsible="icon">
        <SidebarHeader>
             <Link
                href="/dashboard"
                className="flex items-center gap-3 font-semibold text-foreground"
            >
                <Icons.logo className="h-9 w-9" />
                <span className="text-lg group-data-[collapsible=icon]:hidden">{user?.centreName || "ConnectPhysio"}</span>
            </Link>
        </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) =>
            user && item.roles.includes(user.role) ? (
              <SidebarMenuItem key={item.href}>
                 <SidebarMenuButton
                    asChild
                    isActive={
                        (pathname === item.href ||
                        (item.href !== "/dashboard" &&
                          pathname.startsWith(item.href)))
                    }
                    tooltip={item.label}
                 >
                    <Link href={item.href}>
                        <item.icon />
                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </Link>
                 </SidebarMenuButton>
              </SidebarMenuItem>
            ) : null
          )}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
