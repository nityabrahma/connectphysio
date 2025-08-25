
"use client";

import { AuthGate } from "@/components/auth-gate";
import { FeedbackForm } from "@/components/feedback-form";
import { Sidebar, SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import AppSidebar from "@/components/layout/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AuthGate>
        <SidebarProvider>
          <div className="flex size-full h-screen bg-secondary/50 overflow-hidden">
            <AppSidebar />
            <main className="flex-1 flex flex-col overflow-hidden size-full">
              <Topbar />
              <motion.div
                key={pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex-1 p-4 sm:p-6 lg:p-8 size-full overflow-y-scroll"
              >
                {children}
              </motion.div>
            </main>
          </div>
        </SidebarProvider>
      <FeedbackForm />
    </AuthGate>
  );
}
