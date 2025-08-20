
'use client';

import { useLocalStorage } from './use-local-storage';
import { LS_KEYS } from '@/lib/constants';
import type { User, Therapist } from '@/types/domain';
import { generateId } from '@/lib/ids';
import { useToast } from './use-toast';
import { useAuth } from './use-auth';

// Mock password hashing for demo purposes. DO NOT use in production.
const mockHash = (password: string) => `hashed_${password}`;

export function useUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useLocalStorage<User[]>(LS_KEYS.USERS, []);
  const [therapists, setTherapists] = useLocalStorage<Therapist[]>(LS_KEYS.THERAPISTS, []);
  const { toast } = useToast();

  const centreUsers = users.filter(u => u.centreId === currentUser?.centreId);

  const addUser = (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'passwordHash'> & { password?: string }) => {
    const { password, ...rest } = userData;

    if (!password) {
        toast({
            title: "Error",
            description: `Password is required for new user.`,
            variant: "destructive",
        })
        return null;
    }
    
    const newUserId = generateId();
    let therapistId: string | undefined = undefined;

    if (userData.role === 'therapist') {
      therapistId = generateId();
      const newTherapist: Therapist = {
        id: therapistId,
        name: userData.name,
        centreId: userData.centreId,
        workingDays: [1,2,3,4,5],
        startHour: '09:00',
        endHour: '17:00',
        slotMinutes: 60,
      };
      setTherapists([...therapists, newTherapist]);
    }

    const newUser: User = {
      ...rest,
      id: newUserId,
      therapistId,
      passwordHash: mockHash(password),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUsers([...users, newUser]);
    toast({
      title: "User Created",
      description: `${newUser.name} has been added to the system.`
    })
    return newUser;
  };

  const getUser = (id: string) => {
    return users.find(p => p.id === id);
  };

  const updateUser = (id: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'passwordHash'> & { password?: string }>) => {
    const { password, ...rest } = updates;
    
    setUsers(users.map(u => {
        if (u.id === id) {
            const updatedUser = { ...u, ...rest, updatedAt: new Date().toISOString() };
            if (password) {
                updatedUser.passwordHash = mockHash(password);
            }
            if (updates.name && u.therapistId) {
              setTherapists(therapists.map(t => t.id === u.therapistId ? { ...t, name: updates.name as string } : t));
            }
            return updatedUser;
        }
        return u;
    }));
    toast({
      title: "User Updated",
      description: `The details for ${updates.name} have been updated.`
    })
  };

  const deleteUser = (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete) {
      if (userToDelete.therapistId) {
        setTherapists(therapists.filter(t => t.id !== userToDelete.therapistId));
      }
      setUsers(users.filter(u => u.id !== id));
      toast({
        title: "User Deleted",
        description: `The account for ${userToDelete.name} has been deleted.`,
        variant: "destructive",
      })
    }
  };

  return {
    users: centreUsers,
    addUser,
    getUser,
    updateUser,
    deleteUser,
  };
}
