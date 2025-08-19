'use client';

import { seedData } from '@/lib/seed';
import { storage } from '@/lib/storage';
import { LS_KEYS } from '@/lib/constants';
import { useEffect, useState } from 'react';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const isSeeded = storage.getItem<boolean>(LS_KEYS.SEEDED);
    if (!isSeeded) {
      console.log('First time setup: Seeding data into localStorage...');
      seedData();
      storage.setItem(LS_KEYS.SEEDED, true);
    }
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}
