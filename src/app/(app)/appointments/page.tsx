
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { useMemo, useState } from "react";
import type { Patient, Session, Therapist } from "@/types/domain";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { LS_KEYS } from "@/lib/constants";
import { usePatients } from "@/hooks/use-patients";
import { useUsers } from "@/hooks/use-users";
import { Button } from "@/components/ui/button";
import { SessionForm } from "./session-form";
import { useToast } from "@/hooks/use-toast";
import { generateId } from "@/lib/ids";
import { useAuth } from "@/hooks/use-auth";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isSameDay, isSameMonth, isSameWeek } from "date-fns";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useLocalStorage<Session[]>(LS_KEYS.SESSIONS, []);
  const { patients } = usePatients();
  const { users } = useUsers();
  const [therapists] = useLocalStorage<Therapist[]>(LS_KEYS.THERAPISTS, []);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const therapistsData: Therapist[] = useMemo(() => {
    const therapistUsers = users.filter(u => u.role === 'therapist');
    return therapists.filter(t => therapistUsers.some(u => u.therapistId === t.id));
  }, [users, therapists]);
  
  const filteredSessions = (view: "day" | "week" | "month") => {
    if (!selectedDate) return [];
    
    let dateFilteredSessions = sessions.filter(session => {
        const sessionDate = new Date(session.date);
        switch (view) {
            case "day": return isSameDay(sessionDate, selectedDate);
            case "week": return isSameWeek(sessionDate, selectedDate);
            case "month": return isSameMonth(sessionDate, selectedDate);
            default: return false;
        }
    });

    if (user?.role === 'therapist') {
      const therapistUser = users.find(u => u.id === user.id);
      dateFilteredSessions = dateFilteredSessions.filter(s => s.therapistId === therapistUser?.therapistId);
    }
    
    return dateFilteredSessions.sort((a,b) => a.startTime.localeCompare(b.startTime));
  }

  const handleFormSubmit = (values: Omit<Session, 'id' | 'createdAt' | 'status'>) => {
    if (selectedSession) {
      setSessions(sessions.map(s => s.id === selectedSession.id ? { ...selectedSession, ...values } : s));
      toast({ title: "Session updated" });
    } else {
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
    setIsFormOpen(true);
  }

  const handleDelete = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
    toast({ title: "Session cancelled", variant: "destructive" });
    setIsFormOpen(false);
  }

  const SessionList = ({ view }: { view: "day" | "week" | "month" }) => {
    const data = filteredSessions(view);
    const getPatientName = (patientId: string) => patients.find(p => p.id === patientId)?.name || 'Unknown';
    const getTherapistName = (therapistId: string) => therapists.find(t => t.id === therapistId)?.name || 'Unknown';

    if (data.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
            <p>No appointments for this {view}.</p>
        </div>
      );
    }

    return (
        <ul className="space-y-4 pt-4">
            {data.map(session => (
                <li key={session.id} className="p-4 bg-muted/50 rounded-lg flex justify-between items-center">
                    <div>
                        <p className="font-semibold">{format(new Date(session.date), 'EEE, MMM d')} &middot; {session.startTime} - {session.endTime}</p>
                        <p className="text-sm text-muted-foreground">{getPatientName(session.patientId)} with {getTherapistName(session.therapistId)}</p>
                    </div>
                    <Button variant="ghost" onClick={() => {
                        setSelectedSession(session);
                        setIsFormOpen(true);
                    }}>
                        Edit
                    </Button>
                </li>
            ))}
        </ul>
    )
  }

  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        {user?.role !== 'therapist' && (
          <Button onClick={handleAddClick}>
              <PlusCircle />
              New Appointment
          </Button>
        )}
      </div>
      
      <Card>
        <CardContent className="p-4 md:p-6 grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 flex justify-center">
                 <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md"
                />
            </div>
            <div className="md:col-span-2">
                 <Tabs defaultValue="month" className="w-full">
                    <TabsList>
                        <TabsTrigger value="day">Day</TabsTrigger>
                        <TabsTrigger value="week">Week</TabsTrigger>
                        <TabsTrigger value="month">Month</TabsTrigger>
                    </TabsList>
                    <TabsContent value="day"><SessionList view="day" /></TabsContent>
                    <TabsContent value="week"><SessionList view="week" /></TabsContent>
                    <TabsContent value="month"><SessionList view="month" /></TabsContent>
                </Tabs>
            </div>
        </CardContent>
      </Card>

      <SessionForm 
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        onDelete={handleDelete}
        session={selectedSession}
        slot={selectedDate ? { start: selectedDate, end: selectedDate } : undefined}
        patients={patients}
        therapists={therapistsData}
      />
    </div>
  );
}
