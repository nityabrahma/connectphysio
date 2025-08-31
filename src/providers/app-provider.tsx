'use client';

export function AppProvider({ children }: { children: React.ReactNode }) {
  // This provider can be used for app-wide state management if needed in the future.
  // For now, it simply renders its children.
  return <>{children}</>;
}
