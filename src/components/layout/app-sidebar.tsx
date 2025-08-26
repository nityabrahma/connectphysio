
"use client";

import { useAuth } from "@/hooks/use-auth";
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
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "../ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Icons } from "../icons";

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
  const isMobile = useIsMobile();

  return (
    <Sidebar collapsible="icon">
       {isMobile && (
        <SidebarHeader>
           <Link
              href="/dashboard"
              className="flex items-center gap-3 font-semibold"
            >
              <Icons.logo className="h-10 w-10" />
              <span className="text-lg">{user?.centreName || "ConnectPhysio"}</span>
            </Link>
        </SidebarHeader>
      )}
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) =>
            user && item.roles.includes(user.role) ? (
              <SidebarMenuItem key={item.href}>
                 <SidebarMenuButton
                    asChild
                    isActive={
                        item.href === "/dashboard"
                          ? pathname === item.href
                          : pathname.startsWith(item.href)
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
