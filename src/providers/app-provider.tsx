
'use client';

import { RealtimeDbProvider } from "@/hooks/use-realtime-db";

export function AppProvider({ children }: { children: React.ReactNode }) {
  // This provider can be used for app-wide state management.
  // We're adding the RealtimeDbProvider here to manage global loading state.
  return (
    <RealtimeDbProvider>
        {children}
    </RealtimeDbProvider>
  );
}
