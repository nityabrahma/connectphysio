'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './auth-provider';
import { seedInitialData } from '@/lib/seed';
import { LS_KEYS } from '@/lib/constants';
import { useLocalStorage } from '@/hooks/use-local-storage';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [seeding, setSeeding] = useState(true);
  const [seeded, setSeeded] = useLocalStorage(LS_KEYS.SEEDED, false);

  useEffect(() => {
    const seedData = async () => {
        if (!authLoading && !seeded) {
            console.log("No user or not seeded yet, attempting to seed data...");
            try {
                await seedInitialData();
                setSeeded(true);
                console.log("Seeding successful.");
            } catch (error) {
                console.error("Failed to seed initial data:", error);
            }
        }
        setSeeding(false);
    };

    seedData();
  }, [authLoading, seeded, setSeeded]);
  
  // While checking auth state or seeding, we can show a loader or nothing
  if (authLoading || seeding) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}
