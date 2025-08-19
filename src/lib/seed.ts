
import { storage } from './storage';
import { LS_KEYS } from './constants';
import { generateId } from './ids';
import type { User, Therapist, Patient, PackageDef, PackageSale, Session } from '@/types/domain';

// Mock password hashing for demo purposes. DO NOT use in production.
const mockHash = (password: string) => `hashed_${password}`;

export const demoUsers: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'passwordHash'>[] = [
    { name: 'Admin User', email: 'admin@demo.app', role: 'admin' },
];

const demoPasswords = {
    'admin@demo.app': 'admin123',
}

export const seedData = () => {
  const now = new Date().toISOString();

  // Seed Therapists
  const therapists: Therapist[] = [
    {
      id: 'therapist-1',
      name: 'Dr. Emily Carter',
      specialty: 'Cognitive Behavioral Therapy',
      workingDays: [1, 2, 3, 4, 5], // Mon-Fri
      startHour: '09:00',
      endHour: '17:00',
      slotMinutes: 60,
    },
    {
      id: 'therapist-2',
      name: 'Dr. David Lee',
      specialty: 'Family Therapy',
      workingDays: [1, 3, 5], // Mon, Wed, Fri
      startHour: '10:00',
      endHour: '18:00',
      slotMinutes: 60,
    },
    {
      id: 'therapist-3',
      name: 'Dr. Sarah Jones',
      specialty: 'Mindfulness Therapy',
      workingDays: [2, 4], // Tue, Thu
      startHour: '08:00',
      endHour: '16:00',
      slotMinutes: 60,
    },
  ];
  storage.setItem(LS_KEYS.THERAPISTS, therapists);
  
  // Seed Users
  const users: User[] = demoUsers.map(u => {
    const user: User = {
      id: generateId(),
      ...u,
      phone: '555-123-4567',
      therapistId: u.role === 'therapist' ? therapists[0].id : undefined,
      createdAt: now,
      updatedAt: now,
      passwordHash: mockHash(demoPasswords[u.email as keyof typeof demoPasswords]),
    };
    return user;
  });
  storage.setItem(LS_KEYS.USERS, users);

  // Seed Package Definitions
  const packageDefs: PackageDef[] = [
    {
      id: 'pkg-1',
      name: '7-Day Therapy Package',
      durationDays: 7,
      price: 499,
      sessions: 7,
      frequency: 'daily',
    },
    {
      id: 'pkg-2',
      name: '10-Day Therapy Package',
      durationDays: 10,
      price: 699,
      sessions: 10,
      frequency: 'daily',
    },
    {
      id: 'pkg-3',
      name: '14-Day Therapy Package',
      durationDays: 14,
      price: 899,
      sessions: 14,
      frequency: 'alternate',
    },
  ];
  storage.setItem(LS_KEYS.PACKAGES, packageDefs);


  // No mock patients, sales, or sessions seeded by default.
  // The application starts with a clean slate.
  storage.setItem(LS_KEYS.PATIENTS, []);
  storage.setItem(LS_KEYS.PACKAGE_SALES, []);
  storage.setItem(LS_KEYS.SESSIONS, []);
};
