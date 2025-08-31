
// src/hooks/use-realtime-db.tsx
import { useState, useEffect, useContext, createContext, ReactNode, useMemo, useCallback } from 'react';
import { ref, onValue, set, off } from 'firebase/database';
import { db } from '@/lib/firebase';
import { usePathname } from 'next/navigation';

// This context will track the loading state of all db listeners
const RealtimeDbContext = createContext<{ register: (id: string) => void, unregister: (id: string) => void, loaded: boolean }>({
  register: () => {},
  unregister: () => {},
  loaded: false,
});

// A provider to wrap the app and manage the global loading state
export const RealtimeDbProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // When the path changes, we are navigating. Reset loading state.
    setLoadingIds(new Set());
    setIsLoaded(false);
  }, [pathname]);

  const register = useCallback((id: string) => {
    setLoadingIds(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
    setIsLoaded(false);
  }, []);

  const unregister = useCallback((id: string) => {
    setLoadingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      if (newSet.size === 0) {
        // A small delay can make the transition feel smoother
        setTimeout(() => setIsLoaded(true), 150);
      }
      return newSet;
    });
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    register,
    unregister,
    loaded: isLoaded,
  }), [isLoaded, register, unregister]);

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
    setLoading(true);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
