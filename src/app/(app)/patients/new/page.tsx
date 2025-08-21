
'use client';

import { PatientForm, type PatientFormValues } from '../patient-form';
import { usePatients } from '@/hooks/use-patients';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NewPatientPage() {
  const router = useRouter();
  const { addPatient } = usePatients();

  const handleFormSubmit = (values: PatientFormValues & { centreId: string }) => {
    const newPatient = addPatient(values);
    if (newPatient) {
      router.push(`/patient-details/${newPatient.id}`);
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
