'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { LS_KEYS } from '@/lib/constants';
import { generateId } from '@/lib/ids';
import type { User, AuthSession, Role } from '@/types/domain';
import { storage } from '@/lib/storage';

// Mock password hashing for demo purposes. DO NOT use in production.
const mockHash = (password: string) => `hashed_${password}`;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'passwordHash'>) => Promise<User | null>;
  updateUser: (userId: string, updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useLocalStorage<User[]>(LS_KEYS.USERS, []);
  const [session, setSession] = useLocalStorage<AuthSession | null>(LS_KEYS.AUTH_SESSION, null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const validateSession = () => {
      if (session) {
        const currentUser = users.find(u => u.id === session.userId);
        if (currentUser) {
          setUser(currentUser);
        } else {
          // Session is invalid, clear it
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
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser && foundUser.passwordHash === mockHash(password)) {
      const newSession: AuthSession = {
        userId: foundUser.id,
        token: generateId(), // Simple token for demo
        issuedAt: new Date().toISOString(),
        // In a real app, set a proper expiry
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

  const register = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'passwordHash' | 'role'> & { role: Role }): Promise<User | null> => {
    const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existingUser) {
      throw new Error('An account with this email already exists.');
    }
    
    const newUser: User = {
      ...userData,
      id: generateId(),
      passwordHash: mockHash(userData.password),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // @ts-ignore - password is not a valid property on User
    delete newUser.password;

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    return newUser;
  };

  const updateUser = (userId: string, updates: Partial<Omit<User, 'password' | 'passwordHash'> & { password?: string }>) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;
  
    const updatedUser = { ...userToUpdate, ...updates, updatedAt: new Date().toISOString() };
    
    if (updates.password) {
        updatedUser.passwordHash = mockHash(updates.password);
    }
    // @ts-ignore
    delete updatedUser.password;
    
    setUsers(users.map(u => (u.id === userId ? updatedUser : u)));
    if(user?.id === userId) {
      setUser(updatedUser);
    }
  };


  const value = { user, loading, login, logout, register, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
