
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Check, LogOut, PlusCircle, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import type { Patient, Session, Therapist, PackageSale } from "@/types/domain";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { LS_KEYS } from "@/lib/constants";
import { usePatients } from "@/hooks/use-patients";
import { Button } from "@/components/ui/button";
import { SessionForm } from "./session-form";
import { useToast } from "@/hooks/use-toast";
import { generateId } from "@/lib/ids";
import { useAuth } from "@/hooks/use-auth";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isSameDay, isSameMonth, isSameWeek } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useLocalStorage<Session[]>(LS_KEYS.SESSIONS, []);
  const { patients } = usePatients();
  const [therapists] = useLocalStorage<Therapist[]>(LS_KEYS.THERAPISTS, []);
  const [packageSales] = useLocalStorage<PackageSale[]>(LS_KEYS.PACKAGE_SALES, []);


  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const centreTherapists = useMemo(() => {
    return therapists.filter(t => t.centreId === user?.centreId);
  }, [therapists, user]);
  
  const centreSessions = useMemo(() => {
    return sessions.filter(s => s.centreId === user?.centreId);
  }, [sessions, user]);
  
  const filteredSessions = (view: "day" | "week" | "month") => {
    if (!selectedDate) return [];
    
    let dateFilteredSessions = centreSessions.filter(session => {
        const sessionDate = new Date(session.date);
        switch (view) {
            case "day": return isSameDay(sessionDate, selectedDate);
            case "week": return isSameWeek(sessionDate, selectedDate);
            case "month": return isSameMonth(sessionDate, selectedDate);
            default: return false;
        }
    });

    if (user?.role === 'therapist') {
      dateFilteredSessions = dateFilteredSessions.filter(s => s.therapistId === user?.therapistId);
    }
    
    return dateFilteredSessions.sort((a,b) => a.startTime.localeCompare(b.startTime));
  }

  const handleFormSubmit = (values: Omit<Session, 'id' | 'createdAt' | 'status'>) => {
    if (selectedSession) {
      setSessions(sessions.map(s => s.id === selectedSession.id ? { ...selectedSession, ...values } : s));
      toast({ title: "Session updated" });
    } else {
      const patient = patients.find(p => p.id === values.patientId);
      let packageSaleId = patient?.packageSaleId;
      
      if(packageSaleId) {
        const sale = packageSales.find(s => s.id === packageSaleId);
        if (sale && sale.sessionsUsed < sale.sessionsTotal) {
          setPackageSales(sales => sales.map(s => s.id === packageSaleId ? { ...s, sessionsUsed: s.sessionsUsed + 1 } : s));
        } else {
           toast({ variant: "destructive", title: "Package Limit Reached", description: "This patient has used all sessions in their package." });
           // We might want to prevent session creation here, but for now we'll just notify
        }
      }

      const newSession: Session = {
        ...values,
        id: generateId(),
        createdAt: new Date().toISOString(),
        status: 'scheduled',
        packageSaleId,
      };
      setSessions([...sessions, newSession]);
      toast({ title: "Session scheduled" });
    }
    setIsFormOpen(false);
  };

  const handleUpdateSessionStatus = (sessionId: string, status: Session['status']) => {
    setSessions(sessions.map(s => s.id === sessionId ? { ...s, status } : s));
    toast({ title: `Session ${status.charAt(0).toUpperCase() + status.slice(1)}` });
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
    const getPatient = (patientId: string) => patients.find(p => p.id === patientId);
    const getTherapistName = (therapistId: string) => therapists.find(t => t.id === therapistId)?.name || 'Unknown';
    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    const canManageSession = (session: Session) => {
        if (user?.role === 'admin' || user?.role === 'receptionist') return true;
        if (user?.role === 'therapist' && user.therapistId === session.therapistId) return true;
        return false;
    }

    const groupedSessions = useMemo(() => {
      return data.reduce<Record<string, Session[]>>((acc, session) => {
        if (!acc[session.patientId]) {
          acc[session.patientId] = [];
        }
        acc[session.patientId].push(session);
        return acc;
      }, {});
    }, [data]);


    if (data.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
            <p>No appointments for this {view}.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4 pt-4">
        {Object.entries(groupedSessions).map(([patientId, patientSessions]) => {
          const patient = getPatient(patientId);
          if (!patient) return null;

          return (
            <Collapsible key={patientId} defaultOpen={true}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg w-full">
                   <div className="flex items-center gap-3">
                     <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getInitials(patient.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-left">{patient.name}</p>
                        <p className="text-sm text-muted-foreground text-left">{patientSessions.length} appointment(s) this {view}</p>
                      </div>
                   </div>
                   <ChevronDown className="h-5 w-5 transition-transform [&[data-state=open]]:rotate-180" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                  <ul className="space-y-2 pt-2 pl-4 border-l ml-5">
                      {patientSessions.map(session => (
                          <li key={session.id} className="p-4 bg-muted/50 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                              <div className="flex-1">
                                  <p className="font-semibold">{format(new Date(session.date), 'EEE, MMM d')} &middot; {session.startTime} - {session.endTime}</p>
                                  <p className="text-sm text-muted-foreground">with {getTherapistName(session.therapistId)}</p>
                                  <div className="flex gap-2 mt-2 flex-wrap">
                                    <Badge variant={session.paymentStatus === 'paid' ? 'default' : 'secondary'} className="capitalize">{session.paymentStatus}</Badge>
                                    <Badge variant="outline" className="capitalize">{session.status}</Badge>
                                  </div>
                              </div>
                              {canManageSession(session) && (
                                  <div className="flex gap-2 mt-4 sm:mt-0 flex-wrap">
                                      {session.status === 'scheduled' && user?.role === 'receptionist' && (
                                          <Button size="sm" onClick={() => handleUpdateSessionStatus(session.id, 'checked-in')}><Check/> Check In</Button>
                                      )}
                                      {session.status === 'checked-in' && (
                                          <Button size="sm" onClick={() => handleUpdateSessionStatus(session.id, 'completed')}><LogOut/> End Session</Button>
                                      )}
                                      <Button variant="ghost" size="sm" onClick={() => {
                                          setSelectedSession(session);
                                          setIsFormOpen(true);
                                      }}>
                                          Edit
                                      </Button>
                                  </div>
                              )}
                          </li>
                      ))}
                  </ul>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
        therapists={centreTherapists}
      />
    </div>
  );
}
