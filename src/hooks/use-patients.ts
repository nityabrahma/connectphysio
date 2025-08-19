'use client';

import { useLocalStorage } from './use-local-storage';
import { LS_KEYS } from '@/lib/constants';
import type { Patient } from '@/types/domain';
import { generateId } from '@/lib/ids';

export function usePatients() {
  const [patients, setPatients] = useLocalStorage<Patient[]>(LS_KEYS.PATIENTS, []);

  const addPatient = (patientData: Omit<Patient, 'id' | 'createdAt'>) => {
    const newPatient: Patient = {
      ...patientData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setPatients([...patients, newPatient]);
    return newPatient;
  };

  const getPatient = (id: string) => {
    return patients.find(p => p.id === id);
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients(patients.map(p => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)));
  };

  const deletePatient = (id: string) => {
    setPatients(patients.filter(p => p.id !== id));
  };

  return {
    patients,
    addPatient,
    getPatient,
    updatePatient,
    deletePatient,
  };
}
