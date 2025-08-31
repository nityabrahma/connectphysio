
"use client";

import { AuthGate } from "@/components/auth-gate";
import { FeedbackForm } from "@/components/feedback-form";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import AppSidebar from "@/components/layout/app-sidebar";
import { useEffect, useState } from "react";
import { AppLoader } from "@/components/app-loader";
import { useRealtimeDbListener } from "@/hooks/use-realtime-db";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  // Use the listener hook to determine when initial data has loaded
  const isDataLoaded = useRealtimeDbListener();

  useEffect(() => {
    // When the path changes, we are navigating. Show the loader.
    setLoading(true);
  }, [pathname]);

  useEffect(() => {
    // Once the data for the new page is loaded, hide the loader.
    if (isDataLoaded) {
      // A small delay can make the transition feel smoother
      const timer = setTimeout(() => setLoading(false), 250);
      return () => clearTimeout(timer);
    }
  }, [isDataLoaded, pathname]);


  return (
    <AuthGate>
        <SidebarProvider>
          <div className="flex flex-col size-full h-screen bg-secondary/50 overflow-hidden">
            <Topbar />
            <div className="flex flex-1 overflow-hidden">
                <AppSidebar />
                <main className="flex-1 overflow-y-auto relative">
                    <AnimatePresence mode="wait">
                      {loading ? (
                         <motion.div
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <AppLoader />
                        </motion.div>
                      ) : (
                        <motion.div
                          key={pathname}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="p-4 sm:p-6 lg:p-8 size-full"
                        >
                          {children}
                        </motion.div>
                      )}
                    </AnimatePresence>
                </main>
            </div>
          </div>
        </SidebarProvider>
      <FeedbackForm />
    </AuthGate>
  );
}
