
import { storage } from './storage';
import { LS_KEYS } from './constants';
import { generateId } from './ids';
import type { User, Therapist, Patient, PackageDef, PackageSale, Session } from '@/types/domain';

// Mock password hashing for demo purposes. DO NOT use in production.
const mockHash = (password: string) => `hashed_${password}`;

export const seedData = () => {
  // Clear out old data to ensure a clean slate
  storage.setItem(LS_KEYS.USERS, []);
  storage.setItem(LS_KEYS.THERAPISTS, []);
  storage.setItem(LS_KEYS.PACKAGES, []);
  storage.setItem(LS_KEYS.PATIENTS, []);
  storage.setItem(LS_KEYS.PACKAGE_SALES, []);
  storage.setItem(LS_KEYS.SESSIONS, []);
};
