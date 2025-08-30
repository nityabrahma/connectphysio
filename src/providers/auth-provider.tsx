
'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { LS_KEYS } from '@/lib/constants';
import { generateId } from '@/lib/ids';
import type { User, AuthSession, Centre } from '@/types/domain';
import { useRealtimeDb } from '@/hooks/use-realtime-db';
import { useLocalStorage } from '@/hooks/use-local-storage';

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
      // JWT is not stored in DB, but in browser storage.
      // This logic will be replaced by JWT validation.
      const token = localStorage.getItem(LS_KEYS.AUTH_SESSION) || sessionStorage.getItem(LS_KEYS.AUTH_SESSION);
      
      if (token && users) {
        // In a real app, you would verify the JWT against a secret key.
        // For this demo, we'll decode it and assume it's valid if it has a userId.
        try {
          // A real implementation would use a library like jwt-decode on the client
          // or verification on a server.
          const decoded: { userId: string } = JSON.parse(atob(token.split('.')[1]));
          const currentUser = users[decoded.userId];
          if (currentUser) {
            setUser(currentUser);
          } else {
            logout();
          }
        } catch (error) {
            console.error("Failed to decode token", error);
            logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    if (Object.keys(users).length > 0) {
        validateSession();
    }
  }, [users]);
  
  const login = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    const usersArray = Object.values(users || {});
    const foundUser = usersArray.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser && foundUser.passwordHash === mockHash(password)) {
      // In a real app, this token would be generated on the server by a secure endpoint.
      // For this demo, we are simulating JWT creation.
      const payload = { userId: foundUser.id, iat: Math.floor(Date.now() / 1000) };
      // Base64Url encode header, payload and a fake signature
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const encodedPayload = btoa(JSON.stringify(payload));
      const signature = 'mock_signature'; // Fake signature for demo
      const token = `${header}.${encodedPayload}.${signature}`;
      
      if (rememberMe) {
        localStorage.setItem(LS_KEYS.AUTH_SESSION, token);
        sessionStorage.removeItem(LS_KEYS.AUTH_SESSION);
      } else {
        sessionStorage.setItem(LS_KEYS.AUTH_SESSION, token);
        localStorage.removeItem(LS_KEYS.AUTH_SESSION);
      }

      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(LS_KEYS.AUTH_SESSION);
    sessionStorage.removeItem(LS_KEYS.AUTH_SESSION);
    setUser(null);
    router.push('/login');
  };

  const registerAdmin = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'passwordHash' | 'role' | 'centreId' | 'centreName'> & { password?: string, centreName: string, openingTime: string, closingTime: string }): Promise<User | null> => {
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
    };
    
    // @ts-ignore - password is not a valid property on User
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
