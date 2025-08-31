
'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { LS_KEYS } from '@/lib/constants';
import { generateId } from '@/lib/ids';
import type { User, AuthSession, Centre } from '@/types/domain';
import { useRealtimeDb } from '@/hooks/use-realtime-db';

// Mock password hashing for demo purposes. DO NOT use in production.
const mockHash = (password: string) => `hashed_${password}`;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  registerAdmin: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'passwordHash' | 'role' | 'centreId' | 'centreName'> & { password?: string, centreName: string, openingTime: string, closingTime: string }) => Promise<User | null>;
  updateUser: (userId: string, updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useRealtimeDb<Record<string, User>>('users', {});
  const [centres, setCentres] = useRealtimeDb<Record<string, Centre>>('centres', {});
  const router = useRouter();

  useEffect(() => {
    const validateSession = () => {
      const token = localStorage.getItem(LS_KEYS.AUTH_SESSION) || sessionStorage.getItem(LS_KEYS.AUTH_SESSION);
      
      if (token && Object.keys(users).length > 0) {
        try {
          const payloadString = atob(token.split('.')[1]);
          const decoded: { userId: string } = JSON.parse(payloadString);
          const currentUser = users[decoded.userId];
          if (currentUser) {
            setUser(currentUser);
          } else {
            console.warn("User from token not found, logging out.");
            logout();
          }
        } catch (error) {
            console.error("Failed to decode or validate token", error);
            logout();
        }
      } else {
        // If there's no token, we are not logged in.
        setUser(null);
      }
      setLoading(false);
    };

    // Only run validation if users have loaded from DB
    if (Object.keys(users).length > 0) {
        validateSession();
    }
    // Handle the case where the DB might be empty or users haven't loaded yet
    const timeout = setTimeout(() => {
        if (loading) {
            setLoading(false);
            setUser(null); // Assume not logged in if DB check is slow
        }
    }, 3000); // 3-second timeout

    return () => clearTimeout(timeout);

  }, [users]); // Dependency on `users` ensures re-validation when user data changes
  
  const login = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    setLoading(true);
    const usersArray = Object.values(users || {});
    const foundUser = usersArray.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser && foundUser.passwordHash === mockHash(password)) {
      const payload = { userId: foundUser.id, iat: Math.floor(Date.now() / 1000) };
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const encodedPayload = btoa(JSON.stringify(payload));
      
      const sessionRecord = {
        token: `${header}.${encodedPayload}.mock_signature`,
        createdAt: new Date().toISOString(),
        device: navigator.userAgent,
      };

      // Add the session to the user's record in the database
      const userSessions = foundUser.sessions || {};
      const newSessionId = generateId();
      userSessions[newSessionId] = sessionRecord;
      
      const updatedUser = { ...foundUser, sessions: userSessions };
      setUsers({ ...users, [foundUser.id]: updatedUser });
      
      // Store token in browser
      if (rememberMe) {
        localStorage.setItem(LS_KEYS.AUTH_SESSION, sessionRecord.token);
        sessionStorage.removeItem(LS_KEYS.AUTH_SESSION);
      } else {
        sessionStorage.setItem(LS_KEYS.AUTH_SESSION, sessionRecord.token);
        localStorage.removeItem(LS_KEYS.AUTH_SESSION);
      }

      setUser(updatedUser);
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  };

  const logout = () => {
    const token = localStorage.getItem(LS_KEYS.AUTH_SESSION) || sessionStorage.getItem(LS_KEYS.AUTH_SESSION);
    if (user && token && users[user.id]) {
        const userToUpdate = users[user.id];
        const userSessions = userToUpdate.sessions || {};
        const sessionKey = Object.keys(userSessions).find(key => userSessions[key].token === token);
        if (sessionKey) {
            delete userSessions[sessionKey];
            const updatedUser = { ...userToUpdate, sessions: userSessions };
            setUsers({ ...users, [user.id]: updatedUser });
        }
    }

    localStorage.removeItem(LS_KEYS.AUTH_SESSION);
    sessionStorage.removeItem(LS_KEYS.AUTH_SESSION);
    setUser(null);
    router.push('/login');
  };

  const registerAdmin = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'passwordHash' | 'role' | 'centreId' | 'centreName' | 'sessions'> & { password?: string, centreName: string, openingTime: string, closingTime: string }): Promise<User | null> => {
    const usersArray = Object.values(users || {});
    const existingUser = usersArray.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existingUser) {
      throw new Error('An account with this email already exists.');
    }
    
    if (!userData.password) {
        throw new Error('Password is required.');
    }
    
    const newCentreId = generateId();
    const newCentre: Centre = {
        id: newCentreId,
        name: userData.centreName,
        openingTime: userData.openingTime,
        closingTime: userData.closingTime,
    }
    setCentres({ ...centres, [newCentreId]: newCentre });
    
    const newUserId = generateId();
    const newUser: User = {
      ...userData,
      id: newUserId,
      role: 'admin',
      centreId: newCentreId,
      centreName: userData.centreName,
      passwordHash: mockHash(userData.password),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sessions: {},
    };
    
    // @ts-ignore
    delete newUser.password;

    setUsers({ ...users, [newUserId]: newUser });
    
    return newUser;
  };

  const updateUser = (userId: string, updates: Partial<Omit<User, 'password' | 'passwordHash'> & { password?: string }>) => {
    const userToUpdate = users[userId];
    if (!userToUpdate) return;
  
    const updatedUser = { ...userToUpdate, ...updates, updatedAt: new Date().toISOString() };
    
    if (updates.password) {
        updatedUser.passwordHash = mockHash(updates.password);
    }
    // @ts-ignore
    delete updatedUser.password;
    
    setUsers({ ...users, [userId]: updatedUser });
    if(user?.id === userId) {
      setUser(updatedUser);
    }
  };


  const value = { user, loading, login, logout, registerAdmin, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
