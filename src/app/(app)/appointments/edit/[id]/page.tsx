
'use client';

import { SessionForm, type SessionFormValues } from '../../session-form';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { Patient, Session, Therapist } from '@/types/domain';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useMemo } from 'react';
import { usePatients } from '@/hooks/use-patients';
import Link from 'next/link';
import { useRealtimeDb } from '@/hooks/use-realtime-db';
import { format } from 'date-fns';

export default function EditAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const sessionId = params.id as string;

  const { patients } = usePatients();
  const [therapists] = useRealtimeDb<Record<string, Therapist>>('therapists', {});
  const [sessions, setSessions] = useRealtimeDb<Record<string, Session>>('sessions', {});

  const session = useMemo(() => sessions[sessionId], [sessions, sessionId]);

  const centreTherapists = useMemo(() => {
    return Object.values(therapists).filter(t => t.centreId === user?.centreId);
  }, [therapists, user]);

  const handleFormSubmit = (values: SessionFormValues) => {
    if (!session) return;
    const updatedSession = { 
        ...session, 
        ...values,
        date: format(values.date, "yyyy-MM-dd"),
    };
    setSessions({ ...sessions, [sessionId]: updatedSession });
    toast({ title: 'Appointment Updated' });
    router.push('/appointments');
  };

  const handleDelete = () => {
    const { [sessionId]: _, ...remainingSessions } = sessions;
    setSessions(remainingSessions);
    toast({ title: "Session cancelled", variant: "destructive" });
    router.push('/appointments');
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-2xl font-semibold mb-4">Appointment not found</h2>
        <p className="text-muted-foreground mb-6">
          The appointment you are looking for does not exist or could not be loaded.
        </p>
        <Button asChild>
          <Link href="/appointments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Appointments
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
            <h1 className="text-3xl font-bold tracking-tight">Edit Appointment</h1>
            <p className="text-muted-foreground">Update the details for this session.</p>
        </div>
      </div>
      <Card>
         <CardContent className="p-6">
          <SessionForm
            onSubmit={handleFormSubmit}
            onDelete={handleDelete}
            session={session}
            patients={patients}
            therapists={centreTherapists}
          />
        </CardContent>
      </Card>
    </div>
  );
}
