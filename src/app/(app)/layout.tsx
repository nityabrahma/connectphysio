
"use client";

import { AuthGate } from "@/components/auth-gate";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = !pathname.startsWith("/patient-details");

  return (
    <AuthGate>
      <div className="flex h-screen bg-secondary/50 overflow-hidden">
        {showSidebar && <Sidebar />}
        <main className="flex-1 flex flex-col overflow-hidden">
          {showSidebar && <Topbar />}
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </AuthGate>
  );
}
