
'use client';

import { SessionForm, type SessionFormValues } from '../session-form';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { Patient, Session, Therapist } from '@/types/domain';
import { LS_KEYS } from '@/lib/constants';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { generateId } from '@/lib/ids';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { usePatients } from '@/hooks/use-patients';


export default function NewAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const { patients } = usePatients();
  const [therapists] = useLocalStorage<Therapist[]>(LS_KEYS.THERAPISTS, []);
  const [sessions, setSessions] = useLocalStorage<Session[]>(LS_KEYS.SESSIONS, []);

  const patientId = searchParams.get('patientId');

  const centreTherapists = useMemo(() => {
    return therapists.filter(t => t.centreId === user?.centreId);
  }, [therapists, user]);

  const handleFormSubmit = (values: SessionFormValues) => {
    if (!user) return;
    
    const newSession: Session = {
        id: generateId(),
        ...values,
        date: format(values.date, "yyyy-MM-dd"),
        centreId: user.centreId,
        createdAt: new Date().toISOString(),
    };
    
    setSessions([...sessions, newSession]);
    toast({ title: 'Appointment Scheduled' });
    router.push('/appointments');
  };

  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">New Appointment</h1>
            <p className="text-muted-foreground">Fill in the details to schedule a new session.</p>
        </div>
      </div>
      <Card>
         <CardContent className="p-6">
          <SessionForm
            onSubmit={handleFormSubmit}
            patients={patients}
            therapists={centreTherapists}
            patientId={patientId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
