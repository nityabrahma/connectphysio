
'use client';

import { PatientForm, type PatientFormValues } from '../patient-form';
import { usePatients } from '@/hooks/use-patients';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { LS_KEYS } from '@/lib/constants';
import type { TreatmentPlan } from '@/types/domain';
import { generateId } from '@/lib/ids';
import { useToast } from '@/hooks/use-toast';

export default function NewPatientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addPatient } = usePatients();
  const [treatmentPlans, setTreatmentPlans] = useLocalStorage<TreatmentPlan[]>(LS_KEYS.TREATMENT_PLANS, []);
  const { toast } = useToast();

  const redirectToAppointment = searchParams.get('redirectToAppointment');

  const handleFormSubmit = (values: PatientFormValues & { centreId: string, initialTreatmentPlanName: string }) => {
    const { initialTreatmentPlanName, ...patientData } = values;
    const newPatient = addPatient(patientData);
    
    if (newPatient) {
      if (initialTreatmentPlanName.trim()) {
        const newPlan: TreatmentPlan = {
          id: generateId(),
          patientId: newPatient.id,
          name: initialTreatmentPlanName,
          createdAt: new Date().toISOString(),
          isActive: true,
          history: "Initial consultation.",
          examination: "Initial examination.",
          treatments: [],
        };
        setTreatmentPlans([...treatmentPlans, newPlan]);
        toast({ title: "Initial treatment plan created." });
      }

      if (redirectToAppointment) {
        router.push(`/appointments/new?patientId=${newPatient.id}`);
      } else {
        router.push(`/patient-details/${newPatient.id}`);
      }
    } else {
      router.push('/patients');
    }
  };

  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Patient</h1>
            <p className="text-muted-foreground">Enter the details for the new patient.</p>
        </div>
      </div>
      <Card>
        <CardContent className="p-6">
          <PatientForm onSubmit={handleFormSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
