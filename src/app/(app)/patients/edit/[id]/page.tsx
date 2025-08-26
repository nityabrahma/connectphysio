
'use client';

import { PatientForm, type PatientFormValues } from '../../patient-form';
import { usePatients } from '@/hooks/use-patients';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Patient } from '@/types/domain';

export default function EditPatientPage() {
  const router = useRouter();
  const params = useParams();
  const { getPatient, updatePatient } = usePatients();
  
  const patientId = params.id as string;
  const patient = getPatient(patientId);

  const handleFormSubmit = (values: PatientFormValues & { centreId: string }) => {
    updatePatient(patientId, values);
    router.push(`/patient-details/${patientId}`);
  };

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-2xl font-semibold mb-4">Patient not found</h2>
        <p className="text-muted-foreground mb-6">
          The patient you are looking for does not exist or could not be loaded.
        </p>
        <Button asChild>
          <Link href="/patients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patients
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Patient</h1>
            <p className="text-muted-foreground">Update the details for {patient.name}.</p>
        </div>
      </div>
      <Card>
        <CardContent className="p-6">
          <PatientForm onSubmit={handleFormSubmit} patient={patient} />
        </CardContent>
      </Card>
    </div>
  );
}

