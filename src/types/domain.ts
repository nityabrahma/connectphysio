export type ID = string;

export type Role = "admin" | "receptionist" | "therapist";

export type User = {
  id: ID;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  therapistId?: ID; // link if role === "therapist"
  centreName?: string; // only for admin
  createdAt: string;
  updatedAt: string;
  passwordHash: string;
};

export type AuthSession = {
  userId: ID;
  token: string;
  issuedAt: string;
  expiresAt?: string;
};

export type Patient = {
  id: ID;
  name: string;
  phone: string;
  email: string;
  age?: number;
  medicalInfo?: string;
  createdAt: string;
  updatedAt?: string;
  packageSaleId?: ID; // active package sale
  notes?: string;
};

export type Therapist = {
  id: ID;
  name: string;
  specialty?: string;
  workingDays: number[]; // 0-6 (Sun-Sat)
  startHour: string; // "09:00"
  endHour: string; // "17:00"
  slotMinutes: number; // 60
};

export type PackageDef = {
  id: ID;
  name: string; // "7-Day Therapy Package"
  durationDays: number; // 7 | 10 | 14
  price: number; // 499, 699, 899
  sessions: number;
  frequency?: "daily" | "alternate" | "custom";
};

export type PackageSale = {
  id: ID;
  patientId: ID;
  packageId: ID;
  startDate: string;
  sessionsTotal: number;
  sessionsUsed: number;
  expiryDate?: string;
  status: "active" | "expired" | "completed";
};

export type Session = {
  id: ID;
  date: string; // ISO date part YYYY-MM-DD
  startTime: string; // "10:00"
  endTime: string; // "11:00"
  therapistId: ID;
  patientId: ID;
  packageSaleId?: ID;
  status: "scheduled" | "checked-in" | "completed" | "cancelled" | "no-show";
  notes?: string;
  createdAt: string;
};

export type CheckIn = {
  id: ID;
  sessionId: ID;
  at: string; // ISO DateTime
  notes?: string; // Optional notes at check-in
};
