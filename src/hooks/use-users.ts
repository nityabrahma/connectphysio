
'use client';

import { LS_KEYS } from '@/lib/constants';
import type { User, Therapist } from '@/types/domain';
import { generateId } from '@/lib/ids';
import { useToast } from './use-toast';
import { useAuth } from './use-auth';
import { useRealtimeDb } from './use-realtime-db';

// Mock password hashing for demo purposes. DO NOT use in production.
const mockHash = (password: string) => `hashed_${password}`;

export function useUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useRealtimeDb<Record<string, User>>('users', {});
  const [therapists, setTherapists] = useRealtimeDb<Record<string, Therapist>>('therapists', {});
  const { toast } = useToast();

  const centreUsers = Object.values(users).filter(u => u.centreId === currentUser?.centreId);

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
      setTherapists({ ...therapists, [therapistId]: newTherapist });
    }

    const newUser: User = {
      ...rest,
      id: newUserId,
      therapistId,
      passwordHash: mockHash(password),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUsers({ ...users, [newUserId]: newUser });
    toast({
      title: "User Created",
      description: `${newUser.name} has been added to the system.`
    })
    return newUser;
  };

  const getUser = (id: string) => {
    return users[id];
  };

  const updateUser = (id: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'passwordHash'> & { password?: string }>) => {
    const { password, ...rest } = updates;
    
    const userToUpdate = users[id];
    if (userToUpdate) {
        const updatedUser = { ...userToUpdate, ...rest, updatedAt: new Date().toISOString() };
        if (password) {
            updatedUser.passwordHash = mockHash(password);
        }
        if (updates.name && userToUpdate.therapistId) {
            const therapistToUpdate = therapists[userToUpdate.therapistId];
            if (therapistToUpdate) {
                setTherapists({ ...therapists, [userToUpdate.therapistId]: { ...therapistToUpdate, name: updates.name } });
            }
        }
        setUsers({ ...users, [id]: updatedUser });
        toast({
            title: "User Updated",
            description: `The details for ${updates.name} have been updated.`
        });
    }
  };

  const deleteUser = (id: string) => {
    const userToDelete = users[id];
    if (userToDelete) {
      if (userToDelete.therapistId) {
        const { [userToDelete.therapistId]: _, ...remainingTherapists } = therapists;
        setTherapists(remainingTherapists);
      }
      const { [id]: _, ...remainingUsers } = users;
      setUsers(remainingUsers);
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
