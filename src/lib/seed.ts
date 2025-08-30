
// lib/seed.ts
import { ref, set } from 'firebase/database';
import { db } from './firebase';
import { generateId } from './ids';
import type { User, Centre, Therapist, PackageDef, Patient, TreatmentPlan, Session, TreatmentDef, ExaminationDef, Questionnaire } from '@/types/domain';

// Mock password hashing for demo purposes. DO NOT use in production.
const mockHash = (password: string) => `hashed_${password}`;

export const seedInitialData = async () => {
  console.log('Starting data seeding...');
  
  const centre1Id = generateId();

  // --- Centres ---
  const centres: Centre[] = [
    { id: centre1Id, name: 'ConnectPhysio London', openingTime: '09:00', closingTime: '18:00' },
  ];

  // --- Users & Therapists ---
  const therapist1Id = generateId();
  const therapist2Id = generateId();

  const users: User[] = [
    { id: generateId(), name: 'Admin User', email: 'admin@connectphysio.com', passwordHash: mockHash('password123'), role: 'admin', centreId: centre1Id, centreName: 'ConnectPhysio London', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), name: 'Receptionist User', email: 'receptionist@connectphysio.com', passwordHash: mockHash('password123'), role: 'receptionist', centreId: centre1Id, centreName: 'ConnectPhysio London', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), name: 'Dr. Emily Carter', email: 'emily.carter@connectphysio.com', passwordHash: mockHash('password123'), role: 'therapist', therapistId: therapist1Id, centreId: centre1Id, centreName: 'ConnectPhysio London', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), name: 'Dr. Ben Hanson', email: 'ben.hanson@connectphysio.com', passwordHash: mockHash('password123'), role: 'therapist', therapistId: therapist2Id, centreId: centre1Id, centreName: 'ConnectPhysio London', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];
  
  const therapists: Therapist[] = [
    { id: therapist1Id, name: 'Dr. Emily Carter', centreId: centre1Id, specialty: 'Sports Injury', workingDays: [1, 2, 3, 4, 5], startHour: '09:00', endHour: '17:00', slotMinutes: 60 },
    { id: therapist2Id, name: 'Dr. Ben Hanson', centreId: centre1Id, specialty: 'Post-operative Rehab', workingDays: [1, 2, 3, 4, 5], startHour: '10:00', endHour: '18:00', slotMinutes: 60 },
  ];

  // --- Patients ---
  const patient1Id = generateId();
  const patient2Id = generateId();
  const patients: Patient[] = [
    { id: patient1Id, name: 'John Smith', phone: '555-0101', email: 'john.smith@example.com', centreId: centre1Id, age: 45, gender: 'male', address: '123 Oak Lane, London', pastMedicalHistory: 'Hypertension', createdAt: new Date().toISOString() },
    { id: patient2Id, name: 'Maria Garcia', phone: '555-0102', email: 'maria.garcia@example.com', centreId: centre1Id, age: 32, gender: 'female', address: '456 Pine Street, London', pastMedicalHistory: 'Asthma', createdAt: new Date().toISOString() },
  ];

  // --- Packages & Treatments ---
  const packages: PackageDef[] = [
    { id: generateId(), name: '5-Session Pack', centreId: centre1Id, sessions: 5, durationDays: 30, discountPercentage: 10 },
    { id: generateId(), name: '10-Session Pack', centreId: centre1Id, sessions: 10, durationDays: 60, discountPercentage: 15 },
  ];

  const treatmentDefs: TreatmentDef[] = [
    { id: generateId(), name: 'Ultrasound Therapy', price: 50, centreId: centre1Id },
    { id: generateId(), name: 'Manual Therapy', price: 70, centreId: centre1Id },
  ];
  
  const examinationDefs: ExaminationDef[] = [
      { id: generateId(), name: 'Range of Motion Test', description: 'Assesses joint mobility.', centreId: centre1Id },
      { id: generateId(), name: 'Gait Analysis', description: 'Evaluates walking patterns.', centreId: centre1Id },
  ]

  // --- Treatment Plans & Sessions ---
  const plan1Id = generateId();
  const treatmentPlans: TreatmentPlan[] = [
    { id: plan1Id, patientId: patient1Id, name: 'Knee Rehab', createdAt: new Date().toISOString(), isActive: true, treatments: [{ date: new Date().toISOString(), description: 'Ice pack and light stretching', charges: 0 }] },
  ];

  const sessions: Session[] = [
    { id: generateId(), date: new Date().toISOString().split('T')[0], startTime: '10:00', endTime: '11:00', therapistId: therapist1Id, patientId: patient1Id, centreId: centre1Id, treatmentPlanId: plan1Id, status: 'scheduled', createdAt: new Date().toISOString() },
    { id: generateId(), date: new Date().toISOString().split('T')[0], startTime: '14:00', endTime: '15:00', therapistId: therapist2Id, patientId: patient2Id, centreId: centre1Id, status: 'scheduled', createdAt: new Date().toISOString() },
  ];

  // --- Questionnaires ---
  const consultationQuestionnaireId = generateId();
  const consultationQuestionnaires: Questionnaire[] = [{
      id: consultationQuestionnaireId,
      title: "Default Follow-up Form",
      centreId: centre1Id,
      createdAt: new Date().toISOString(),
      questions: [
        { id: generateId(), label: "Pain Intensity (0-10)", type: 'slider', min: 0, max: 10, step: 1 },
        { id: generateId(), label: "Treatments Done", type: 'text', placeholder: "e.g., Ultrasound, IFT, Hot Pack" },
        { id: generateId(), label: "Range of Motion", type: 'text', placeholder: "e.g., Improved, Unchanged" },
        { id: generateId(), label: "Follow-up Plan", type: 'text', placeholder: "e.g., Continue with exercises, Re-assess next session" }
      ]
  }];
  
  const sessionQuestionnaireId = generateId();
  const sessionQuestionnaires: Questionnaire[] = [{
      id: sessionQuestionnaireId,
      title: "Default Session Form",
      centreId: centre1Id,
      createdAt: new Date().toISOString(),
      questions: [
        { id: generateId(), label: "Pain Level Pre-Treatment (0-10)", type: 'slider', min: 0, max: 10, step: 1 },
        { id: generateId(), label: "Pain Level Post-Treatment (0-10)", type: 'slider', min: 0, max: 10, step: 1 },
        { id: generateId(), label: "Specific Modalities Used", type: 'text', placeholder: "e.g., Ultrasound, Manual Therapy" },
      ]
  }];
  

  const dataToSeed = {
    centres: centres.reduce((acc, item) => ({ ...acc, [item.id]: item }), {}),
    users: users.reduce((acc, item) => ({ ...acc, [item.id]: item }), {}),
    therapists: therapists.reduce((acc, item) => ({ ...acc, [item.id]: item }), {}),
    patients: patients.reduce((acc, item) => ({ ...acc, [item.id]: item }), {}),
    packages: packages.reduce((acc, item) => ({ ...acc, [item.id]: item }), {}),
    treatmentDefs: treatmentDefs.reduce((acc, item) => ({ ...acc, [item.id]: item }), {}),
    examinationDefs: examinationDefs.reduce((acc, item) => ({ ...acc, [item.id]: item }), {}),
    treatmentPlans: treatmentPlans.reduce((acc, item) => ({ ...acc, [item.id]: item }), {}),
    sessions: sessions.reduce((acc, item) => ({ ...acc, [item.id]: item }), {}),
    questionnaires: consultationQuestionnaires.reduce((acc, item) => ({ ...acc, [item.id]: item }), {}),
    sessionQuestionnaires: sessionQuestionnaires.reduce((acc, item) => ({ ...acc, [item.id]: item }), {}),
    packageSales: {},
  };
  
  try {
    await set(ref(db), dataToSeed);
    console.log('Data seeded successfully.');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
};
