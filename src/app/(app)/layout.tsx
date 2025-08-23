
"use client";

import { AuthGate } from "@/components/auth-gate";
import { FeedbackForm } from "@/components/feedback-form";
import { Topbar } from "@/components/layout/topbar";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AuthGate>
      <div className="flex size-full h-screen bg-secondary/50 overflow-hidden">
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
      <FeedbackForm />
    </AuthGate>
  );
}
