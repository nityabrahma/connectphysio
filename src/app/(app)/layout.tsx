
"use client";

import { AuthGate } from "@/components/auth-gate";
import { FeedbackForm } from "@/components/feedback-form";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import AppSidebar from "@/components/layout/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AuthGate>
        <SidebarProvider>
          <div className="flex flex-col size-full h-screen bg-secondary/50 overflow-hidden">
            <Topbar />
            <div className="flex flex-1 overflow-hidden">
                <AppSidebar />
                <main className="flex-1 overflow-y-auto">
                    <motion.div
                    key={pathname}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="p-4 sm:p-6 lg:p-8 size-full"
                    >
                    {children}
                    </motion.div>
                </main>
            </div>
          </div>
        </SidebarProvider>
      <FeedbackForm />
    </AuthGate>
  );
}
