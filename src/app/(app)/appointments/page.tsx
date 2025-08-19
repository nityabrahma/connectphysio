'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, PlusCircle } from "lucide-react";
import { useMemo, useState } from "react";
import type { Patient, Session, Therapist, User } from "@/types/domain";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { LS_KEYS } from "@/lib/constants";
import { usePatients } from "@/hooks/use-patients";
import { useUsers } from "@/hooks/use-users";
import { Calendar, dateFnsLocalizer, Views, type Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from "@/components/ui/button";
import { SessionForm } from "./session-form";
import { useToast } from "@/hooks/use-toast";
import { generateId } from "@/lib/ids";
import { useAuth } from "@/hooks/use-auth";


const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: enUS }),
  getDay,
  locales,
});

interface SessionEvent extends Event {
  resource?: Session;
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useLocalStorage<Session[]>(LS_KEYS.SESSIONS, []);
  const { patients } = usePatients();
  const { users } = useUsers();
  const [therapists] = useLocalStorage<Therapist[]>(LS_KEYS.THERAPISTS, []);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date, end: Date } | undefined>(undefined);

  const therapistsData: Therapist[] = useMemo(() => {
    const therapistUsers = users.filter(u => u.role === 'therapist');
    return therapists.filter(t => therapistUsers.some(u => u.therapistId === t.id));
  }, [users, therapists]);

  const events: SessionEvent[] = useMemo(() => {
    return sessions.map(session => {
      const patient = patients.find(p => p.id === session.patientId);
      const therapist = therapists.find(t => t.id === session.therapistId);
      const [hour, minute] = session.startTime.split(':').map(Number);
      const [endHour, endMinute] = session.endTime.split(':').map(Number);
      const start = new Date(session.date);
      start.setHours(hour, minute);
      const end = new Date(session.date);
      end.setHours(endHour, endMinute);
      
      return {
        title: `${patient?.name || 'Unknown Patient'} w/ ${therapist?.name || 'Unknown Therapist'}`,
        start,
        end,
        resource: session,
      };
    }).filter(event => {
      if (user?.role === 'therapist') {
        const therapistUser = users.find(u => u.id === user.id);
        return event.resource?.therapistId === therapistUser?.therapistId;
      }
      return true;
    });
  }, [sessions, patients, therapists, user, users]);

  const handleSelectSlot = ({ start, end }: { start: Date, end: Date }) => {
    if (user?.role === 'therapist') return; // Therapists can't create appointments from calendar
    setSelectedSession(undefined);
    setSelectedSlot({ start, end });
    setIsFormOpen(true);
  };

  const handleSelectEvent = (event: SessionEvent) => {
    if (user?.role === 'therapist') return;
    setSelectedSession(event.resource);
    setSelectedSlot(undefined);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (values: Omit<Session, 'id' | 'createdAt' | 'status'>) => {
    if (selectedSession) {
      // Update
      setSessions(sessions.map(s => s.id === selectedSession.id ? { ...selectedSession, ...values } : s));
      toast({ title: "Session updated" });
    } else {
      // Create
      const newSession: Session = {
        ...values,
        id: generateId(),
        createdAt: new Date().toISOString(),
        status: 'scheduled'
      };
      setSessions([...sessions, newSession]);
      toast({ title: "Session scheduled" });
    }
    setIsFormOpen(false);
  };
  
  const handleAddClick = () => {
    setSelectedSession(undefined);
    setSelectedSlot(undefined);
    setIsFormOpen(true);
  }

  const handleDelete = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
    toast({ title: "Session cancelled", variant: "destructive" });
    setIsFormOpen(false);
  }

  return (
    <div className="flex flex-col gap-8 h-[calc(100vh-10rem)]">
       <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        {user?.role !== 'therapist' && (
          <Button onClick={handleAddClick}>
              <PlusCircle />
              Schedule Session
          </Button>
        )}
      </div>
      <Card className="flex-1 flex flex-col">
        <CardContent className="p-2 md:p-4 flex-1">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ flex: 1 }}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            selectable={user?.role !== 'therapist'}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            defaultView={Views.WEEK}
          />
        </CardContent>
      </Card>

      <SessionForm 
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        onDelete={handleDelete}
        session={selectedSession}
        slot={selectedSlot}
        patients={patients}
        therapists={therapistsData}
      />
    </div>
  );
}
