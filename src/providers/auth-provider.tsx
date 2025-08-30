
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
  const [session, setSession] = useLocalStorage<AuthSession | null>(LS_KEYS.AUTH_SESSION, null);
  const router = useRouter();

  useEffect(() => {
    const validateSession = () => {
      if (session && users) {
        const currentUser = users[session.userId];
        if (currentUser) {
          setUser(currentUser);
        } else {
          setSession(null);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    validateSession();
  }, [session, users, setSession]);
  
  const login = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    const usersArray = Object.values(users || {});
    const foundUser = usersArray.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser && foundUser.passwordHash === mockHash(password)) {
      const newSession: AuthSession = {
        userId: foundUser.id,
        token: generateId(),
        issuedAt: new Date().toISOString(),
      };
      setSession(newSession);
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setSession(null);
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
