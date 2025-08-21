'use client';

export function AppProvider({ children }: { children: React.ReactNode }) {
  // The seeding logic has been removed. 
  // This provider is now a simple pass-through but is kept for potential future use.
  return <>{children}</>;
}
