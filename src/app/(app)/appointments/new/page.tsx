
'use client';

import { SessionForm, type SessionFormValues } from '../session-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { Patient, Session, Therapist, TreatmentPlan } from '@/types/domain';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { generateId } from '@/lib/ids';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { usePatients } from '@/hooks/use-patients';
import { useRealtimeDb } from '@/hooks/use-realtime-db';


export default function NewAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const { patients } = usePatients();
  const [therapists] = useRealtimeDb<Record<string, Therapist>>('therapists', {});
  const [sessions, setSessions] = useRealtimeDb<Record<string, Session>>('sessions', {});
  const [treatmentPlans] = useRealtimeDb<Record<string, TreatmentPlan>>('treatmentPlans', {});

  const patientId = searchParams.get('patientId');

  const centreTherapists = useMemo(() => {
    return Object.values(therapists).filter(t => t.centreId === user?.centreId);
  }, [therapists, user]);

  const patientTreatmentPlans = useMemo(() => {
    if (!patientId) return [];
    return Object.values(treatmentPlans)
        .filter(tp => tp.patientId === patientId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [treatmentPlans, patientId]);

  const handleFormSubmit = (values: SessionFormValues) => {
    if (!user || !values.treatmentPlanId) {
        if(!values.treatmentPlanId) toast({ variant: 'destructive', title: "No treatment plan specified."});
        return;
    };
    
    const newSessionId = generateId();
    const newSession: Session = {
        id: newSessionId,
        patientId: values.patientId,
        therapistId: values.therapistId,
        treatmentPlanId: values.treatmentPlanId,
        date: format(values.date, "yyyy-MM-dd"),
        startTime: values.startTime,
        endTime: values.endTime,
        status: 'scheduled',
        centreId: user.centreId,
        createdAt: new Date().toISOString(),
    };
    
    setSessions({ ...sessions, [newSessionId]: newSession });
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
            treatmentPlans={patientTreatmentPlans}
          />
        </CardContent>
      </Card>
    </div>
  );
}
