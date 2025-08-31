// src/hooks/use-realtime-db.tsx
import { useState, useEffect, useContext, createContext, ReactNode, useMemo } from 'react';
import { ref, onValue, set, off } from 'firebase/database';
import { db } from '@/lib/firebase';

// This context will track the loading state of all db listeners
const RealtimeDbContext = createContext<{ register: (id: string) => void, unregister: (id: string) => void, loaded: boolean }>({
  register: () => {},
  unregister: () => {},
  loaded: false,
});

// A provider to wrap the app and manage the global loading state
export const RealtimeDbProvider = ({ children }: { children: ReactNode }) => {
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    register: (id: string) => {
      setLoadingIds(prev => new Set(prev).add(id));
      setIsLoaded(false);
    },
    unregister: (id: string) => {
      setLoadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        if (newSet.size === 0) {
          setIsLoaded(true);
        }
        return newSet;
      });
    },
    loaded: isLoaded,
  }), [isLoaded]);

  return (
    <RealtimeDbContext.Provider value={contextValue}>
      {children}
    </RealtimeDbContext.Provider>
  );
};


// Hook for components to access the global loaded state
export const useRealtimeDbListener = () => {
    return useContext(RealtimeDbContext).loaded;
}

export function useRealtimeDb<T>(path: string, initialValue: T): [T, (value: T) => void, boolean] {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState<boolean>(true);
  const { register, unregister } = useContext(RealtimeDbContext);
  const id = useMemo(() => `db-${path}-${Math.random().toString(36).substring(2, 9)}`, [path]);

  useEffect(() => {
    if (!path) {
        setLoading(false);
        return;
    }
    
    register(id);
    const dbRef = ref(db, path);

    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        setData(snapshot.val());
      } else {
        setData(initialValue);
      }
      setLoading(false);
      unregister(id);
    }, (error) => {
      console.error(`Firebase error on path ${path}:`, error);
      setLoading(false);
      unregister(id);
    });

    return () => {
      off(dbRef);
      unsubscribe();
      // Unregister when component unmounts, in case it was still loading
      unregister(id);
    };
  }, [path, id]);

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
