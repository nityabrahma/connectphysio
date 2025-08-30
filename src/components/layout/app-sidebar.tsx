
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
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "../ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Icons } from "../icons";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";

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
  { 
    href: "/settings", 
    label: "Settings", 
    icon: Settings, 
    roles: ["admin"],
    subItems: [
        { href: "/settings/consultation-questions", label: "Consultation Questions", roles: ["admin"] },
        { href: "/settings/session-questions", label: "Session Questions", roles: ["admin"] },
        { href: "/settings/examinations", label: "Examinations", roles: ["admin"] },
    ]
  },
];

const MobileSidebar = () => {
    const { user } = useAuth();
    const { openMobile, setOpenMobile } = useSidebar();
    const pathname = usePathname();

    return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
            <SheetContent
                side="left"
                className="w-[18rem] bg-card p-0 text-card-foreground [&>button]:hidden"
            >
                 <SheetHeader className="sr-only">
                    <SheetTitle>App Navigation</SheetTitle>
                    <SheetDescription>Main navigation menu for the ConnectPhysio application.</SheetDescription>
                </SheetHeader>
                <SidebarHeader>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 font-semibold"
                        onClick={() => setOpenMobile(false)}
                    >
                        <Icons.logo className="h-10 w-10" />
                        <span className="text-lg">{user?.centreName || "ConnectPhysio"}</span>
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
                                    item.href === "/dashboard"
                                    ? pathname === item.href
                                    : pathname.startsWith(item.href)
                                }
                                onClick={() => setOpenMobile(false)}
                            >
                                <Link href={item.href}>
                                    <item.icon />
                                    <span>{item.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        ) : null
                    )}
                    </SidebarMenu>
                </SidebarContent>
            </SheetContent>
      </Sheet>
    )
}


export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileSidebar />;
  }

  return (
    <Sidebar collapsible="icon">
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
