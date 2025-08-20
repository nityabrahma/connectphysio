
import { storage } from './storage';
import { LS_KEYS } from './constants';
import { generateId } from './ids';
import type { User, Therapist, Patient, PackageDef, PackageSale, Session } from '@/types/domain';

// Mock password hashing for demo purposes. DO NOT use in production.
const mockHash = (password: string) => `hashed_${password}`;

export const seedData = () => {
  const users = storage.getItem<User[]>(LS_KEYS.USERS) || [];

  // Only seed data if there are no users, to prevent overwriting on reload.
  if (users.length === 0) {
    console.log('No users found. Seeding initial admin data...');
    const centreId = generateId();
    const adminUser: User = {
      id: generateId(),
      name: 'Admin User',
      email: 'admin@demo.app',
      passwordHash: mockHash('admin123'),
      role: 'admin',
      centreId: centreId,
      centreName: 'ConnectPhysio HQ',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storage.setItem(LS_KEYS.USERS, [adminUser]);

    // Clear out other data to ensure a clean slate for the new admin
    storage.setItem(LS_KEYS.THERAPISTS, []);
    storage.setItem(LS_KEYS.PACKAGES, []);
    storage.setItem(LS_KEYS.PATIENTS, []);
    storage.setItem(LS_KEYS.PACKAGE_SALES, []);
    storage.setItem(LS_KEYS.SESSIONS, []);
  }
};
