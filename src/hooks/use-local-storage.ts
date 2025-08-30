
"use client";

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';

// NOTE: This hook is now primarily for non-Firebase, client-side state like 'seeded' flag.
// App data should use useRealtimeDb.
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = storage.getItem<T>(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      const item = storage.getItem<T>(key);
      if (item !== null) {
        setStoredValue(item);
      }
    } catch (error) {
       console.error(error);
    }
  }, [key]);

  const setValue = (value: T) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        storage.setItem(key, valueToStore);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
