'use client';

import { useLocalStorage } from './use-local-storage';
import { LS_KEYS } from '@/lib/constants';
import type { Patient } from '@/types/domain';
import { generateId } from '@/lib/ids';
import { useToast } from './use-toast';

export function usePatients() {
  const [patients, setPatients] = useLocalStorage<Patient[]>(LS_KEYS.PATIENTS, []);
  const { toast } = useToast();

  const addPatient = (patientData: Omit<Patient, 'id' | 'createdAt'>) => {
    const newPatient: Patient = {
      ...patientData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setPatients([...patients, newPatient]);
    toast({
      title: "Patient Added",
      description: `${newPatient.name} has been added to the system.`
    })
    return newPatient;
  };

  const getPatient = (id: string) => {
    return patients.find(p => p.id === id);
  };

  const updatePatient = (id: string, updates: Partial<Omit<Patient, 'id' | 'createdAt'>>) => {
    setPatients(patients.map(p => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)));
    toast({
      title: "Patient Updated",
      description: `The details for ${updates.name} have been updated.`
    })
  };

  const deletePatient = (id: string) => {
    const patientToDelete = patients.find(p => p.id === id);
    if (patientToDelete) {
      setPatients(patients.filter(p => p.id !== id));
      toast({
        title: "Patient Deleted",
        description: `The record for ${patientToDelete.name} has been deleted.`,
        variant: "destructive",
      })
    }
  };

  return {
    patients,
    addPatient,
    getPatient,
    updatePatient,
    deletePatient,
  };
}
