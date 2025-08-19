
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


  // Seed Patients
  const patients: Patient[] = [
    { id: 'patient-1', name: 'Sophia Clark', email: 'sophia.c@example.com', phone: '555-0101', age: 34, createdAt: now },
    { id: 'patient-2', name: 'Ethan Carter', email: 'ethan.c@example.com', phone: '555-0102', age: 28, createdAt: now },
    { id: 'patient-3', name: 'Olivia Bennett', email: 'olivia.b@example.com', phone: '555-0103', age: 45, createdAt: now },
    { id: 'patient-4', name: 'Liam Foster', email: 'liam.f@example.com', phone: '555-0104', age: 22, createdAt: now },
    { id: 'patient-5', name: 'Ava Morgan', email: 'ava.m@example.com', phone: '555-0105', age: 31, createdAt: now },
  ];
  

  // Seed Package Sales
  const packageSales: PackageSale[] = [
    {
      id: 'sale-1',
      patientId: patients[0].id,
      packageId: packageDefs[0].id,
      startDate: new Date().toISOString().split('T')[0],
      sessionsTotal: 7,
      sessionsUsed: 2,
      status: 'active',
    },
    {
      id: 'sale-2',
      patientId: patients[2].id,
      packageId: packageDefs[2].id,
      startDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString().split('T')[0],
      sessionsTotal: 14,
      sessionsUsed: 8,
      status: 'active',
    },
  ];
  storage.setItem(LS_KEYS.PACKAGE_SALES, packageSales);
  
  // Link package sales to patients
  patients[0].packageSaleId = packageSales[0].id;
  patients[2].packageSaleId = packageSales[1].id;
  storage.setItem(LS_KEYS.PATIENTS, patients);

  // Seed Sessions for Today
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const sessions: Session[] = [
      { id: generateId(), date: todayStr, startTime: '09:00', endTime: '10:00', therapistId: therapists[0].id, patientId: patients[0].id, packageSaleId: packageSales[0].id, status: 'completed', createdAt: now, notes: "Session was productive." },
      { id: generateId(), date: todayStr, startTime: '10:30', endTime: '11:30', therapistId: therapists[0].id, patientId: patients[2].id, packageSaleId: packageSales[1].id, status: 'checked-in', createdAt: now },
      { id: generateId(), date: todayStr, startTime: '11:45', endTime: '12:45', therapistId: therapists[1].id, patientId: patients[1].id, status: 'scheduled', createdAt: now },
      { id: generateId(), date: todayStr, startTime: '13:30', endTime: '14:30', therapistId: therapists[0].id, patientId: patients[3].id, status: 'scheduled', createdAt: now },
      { id: generateId(), date: todayStr, startTime: '15:00', endTime: '16:00', therapistId: therapists[2].id, patientId: patients[4].id, status: 'scheduled', createdAt: now },
  ];
  storage.setItem(LS_KEYS.SESSIONS, sessions);
};
