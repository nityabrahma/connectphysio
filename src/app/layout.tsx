
"use client"; // All root layouts must be client components with the new app provider.

import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/providers/app-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/providers/theme-provider";
import { useRealtimeDbListener } from "@/hooks/use-realtime-db";
import { AnimatePresence, motion } from "framer-motion";
import { AppLoader } from "@/components/app-loader";

// Note: We can't export metadata from a client component.
// This should be moved to a server component if static metadata is needed.
// export const metadata: Metadata = { ... };


function RootLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDataLoaded = useRealtimeDbListener();

  return (
    <>
      {children}
      <AnimatePresence>
        {!isDataLoaded && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <AppLoader />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="!scroll-smooth">
      <head>
        <title>ConnectPhysio - Streamline Your Physiotherapy Practice</title>
        <meta name="description" content="The all-in-one platform for patient booking, scheduling, and therapy management. Simplify your workflow and focus on what matters most - your patients." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <AppProvider>
              <RootLayoutContent>
                {children}
              </RootLayoutContent>
            </AppProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
