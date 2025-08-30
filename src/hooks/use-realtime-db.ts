// src/hooks/use-realtime-db.ts
import { useState, useEffect } from 'react';
import { ref, onValue, set, off } from 'firebase/database';
import { db } from '@/lib/firebase';

export function useRealtimeDb<T>(path: string, initialValue: T): [T, (value: T) => void, boolean] {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // If the path is not defined (e.g., waiting on user auth), do nothing.
    if (!path) {
        setLoading(false);
        return;
    }

    const dbRef = ref(db, path);

    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        setData(snapshot.val());
      } else {
        // If no data exists at the path, we can set it to the initial value.
        // This is useful for initializing data structures in Firebase.
        setData(initialValue);
      }
      setLoading(false);
    }, (error) => {
      console.error(`Firebase error on path ${path}:`, error);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      off(dbRef);
      unsubscribe();
    };
  }, [path]); // Rerun effect if path changes

  const setValue = (value: T) => {
    if (!path) {
        console.error("Cannot set value: Firebase path is not defined.");
        return;
    }
    const dbRef = ref(db, path);
    set(dbRef, value).catch(error => {
      console.error(`Firebase failed to set data at path ${path}:`, error);
    });
  };

  return [data, setValue, loading];
}
