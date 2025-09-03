

export type ID = string;

export type Role = "admin" | "receptionist" | "therapist";

export type Centre = {
    id: ID;
    name: string;
    openingTime: string; // "09:00"
    closingTime: string; // "18:00"
}

export type User = {
  id: ID;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  centreId: ID;
  centreName: string; // Add centre name to user
  therapistId?: ID; // link if role === "therapist"
  createdAt: string;
  updatedAt: string;
  passwordHash: string;
};

export type AuthSession = {
  token: string;
  userId: string; // Keep userId for quick client-side access if needed
};

export type Patient = {
  id: ID;
  name: string;
  phone: string;
  email: string;
  centreId: ID;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  pastMedicalHistory?: string; // Other issues like diabetes, BP, etc. - stays with patient
  createdAt: string;
  updatedAt?: string;
  packageSaleId?: ID; // active package sale
  notes?: string;
};

export type Therapist = {
  id: ID;
  name: string;
  centreId: ID;
  specialty?: string;
  workingDays: number[]; // 0-6 (Sun-Sat)
  startHour: string; // "09:00"
  endHour: string; // "17:00"
  slotMinutes: number; // 60
};

export type PackageDef = {
  id: ID;
  name: string; // "7-Day Therapy Package"
  centreId: ID;
  durationDays: number; // 7 | 10 | 14
  discountPercentage: number;
  sessions: number;
  frequency?: "daily" | "alternate" | "custom";
};

export type PackageSale = {
  id: ID;
  patientId: ID;
  packageId: ID;
  centreId: ID;
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
  centreId: ID;
  packageSaleId?: ID;
  treatmentPlanId?: ID;
  status: "scheduled" | "checked-in" | "completed" | "cancelled";
  healthNotes?: string; // Stored as a JSON string of questionnaire answers
  notes?: string;
  createdAt: string;
};

export type CheckIn = {
  id: ID;
  sessionId: ID;
  at: string; // ISO DateTime
  notes?: string; // Optional notes at check-in
};

// Questionnaire Types
export type QuestionType = 'text' | 'slider';

export type Question = {
  id: ID;
  label: string;
  type: QuestionType;
  placeholder?: string;
  min?: number;      // for slider
  max?: number;      // for slider
  step?: number;     // for slider
};

export type Questionnaire = {
  id: ID;
  name: string;
  centreId: ID;
  questions: Question[];
  createdAt: string;
  updatedAt?: string;
};


// New Domain Types

export type Treatment = {
    date: string; // ISO DateTime
    treatments: string[];
    charges: number;
}

export type TreatmentDef = {
  id: ID;
  name: string;
  description?: string;
  price: number;
  centreId: ID;
};

export type ExaminationDef = {
  id: ID;
  name: string;
  description?: string;
  centreId: ID;
}

export type TreatmentPlan = {
    id: ID;
    patientId: ID;
    name: string; // e.g., "Post-Surgery Knee Rehab"
    history?: string; // Current problem for this specific plan
    examination?: string; // Observations for this specific plan
    createdAt: string; // ISO DateTime
    isActive: boolean;
    treatments: Treatment[];
}

export type Diagnosis = {
    id: ID;
    patientId: ID;
    description: string;
    date: string; // ISO DateTime
}

export type Experiment = {
    id: ID;
    patientId: ID;
    description: string;
    date: string; // ISO DateTime
}

export type MedicalCondition = {
    id: ID;
    patientId: ID;
    condition: string;
    notes: string;
}
