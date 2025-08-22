
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Check, LogOut, PlusCircle, MoreVertical, UserPlus, Footprints, Calendar as CalendarIcon, User } from "lucide-react";
import { useMemo, useState } from "react";
import type { Patient, Session, Therapist, PackageSale } from "@/types/domain";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { LS_KEYS } from "@/lib/constants";
import { usePatients } from "@/hooks/use-patients";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isSameDay, isSameMonth, isSameWeek } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useRouter } from "next/navigation";


export default function AppointmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
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
    
    return dateFilteredSessions.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.startTime.localeCompare(b.startTime));
  }

  const handleUpdateSessionStatus = (sessionId: string, status: Session['status']) => {
    if (status === 'completed') {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        // Mark session as completed
        const updatedSessions = sessions.map(s => s.id === sessionId ? { ...s, status } : s);
        setSessions(updatedSessions);
        
        // Remove from today's appointments if it was today
        // This is handled by filtering logic in UI.
        
        toast({ title: `Session Completed` });
        return;
      }
    }
    setSessions(sessions.map(s => s.id === sessionId ? { ...s, status } : s));
    toast({ title: `Session ${status.charAt(0).toUpperCase() + status.slice(1)}` });
  };

  const handleDelete = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
    toast({ title: "Session cancelled", variant: "destructive" });
    setIsFormOpen(false);
  }

  const SessionList = ({ view }: { view: "day" | "week" | "month" }) => {
    const data = filteredSessions(view).filter(s => s.status !== 'completed');
    const getPatient = (patientId: string) => patients.find(p => p.id === patientId);
    const getTherapistName = (therapistsId: string) => therapists.find(t => t.id === therapistsId)?.name || 'Unknown';
    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    const canManageSession = (session: Session) => {
        if (user?.role === 'admin' || user?.role === 'receptionist') return true;
        if (user?.role === 'therapist' && user.therapistId === session.therapistId) return true;
        return false;
    }
    
    const canManagePayments = user?.role === 'admin' || user?.role === 'receptionist';

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
      <Accordion type="single" collapsible className="w-full space-y-4 pt-4">
        {Object.entries(groupedSessions).map(([patientId, patientSessions]) => {
          const patient = getPatient(patientId);
          if (!patient) return null;

          return (
            <AccordionItem value={patientId} key={patientId} className="border-none">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg w-full" onClick={(e) => e.stopPropagation()}>
                <AccordionTrigger className="flex-1 p-0 hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getInitials(patient.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">{patientSessions.length} appointment(s) this {view}</p>
                      </div>
                    </div>
                </AccordionTrigger>
              </div>
              <AccordionContent>
                  <ul className="space-y-2 pt-2 pl-4 border-l ml-5">
                      {patientSessions.map(session => (
                          <li key={session.id} className="p-4 bg-muted/50 rounded-lg flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                              <div className="flex-1">
                                  <p className="font-semibold">{format(new Date(session.date), 'EEE, MMM d')} &middot; {session.startTime} - {session.endTime}</p>
                                  <p className="text-sm text-muted-foreground">with {getTherapistName(session.therapistId)}</p>
                                  <div className="flex gap-2 mt-2 flex-wrap">
                                    <Badge variant="outline" className="capitalize">{session.status}</Badge>
                                  </div>
                              </div>
                              {canManageSession(session) && (
                                  <div className="flex gap-2 mt-4 sm:mt-0 flex-wrap items-center">
                                      {session.status === 'scheduled' && (user?.role === 'receptionist' || user?.role === 'admin') && (
                                          <Button size="sm" onClick={() => handleUpdateSessionStatus(session.id, 'checked-in')}><Check/> Check In</Button>
                                      )}
                                      {session.status === 'checked-in' && (
                                          <Button size="sm" onClick={() => handleUpdateSessionStatus(session.id, 'completed')}><LogOut/> End Session</Button>
                                      )}
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                            <MoreVertical className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                           <DropdownMenuItem onSelect={() => {
                                              router.push(`/appointments/edit/${session.id}`);
                                          }}>
                                              Edit Details
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                  </div>
                              )}
                          </li>
                      ))}
                  </ul>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    )
  }

  return (
    <div className="flex flex-col gap-8 h-full">
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        {user?.role !== 'therapist' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <PlusCircle />
                  New Appointment
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Footprints />
                    Walk-in
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onSelect={() => router.push('/patients?select=true')}>
                      <User /> Existing Patient
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => router.push('/patients/new?redirectToAppointment=true')}>
                      <UserPlus /> New Patient
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
        )}
      </div>
      
      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <CardContent className="p-4 md:p-6 grid md:grid-cols-3 gap-8 flex-1">
            <div className="md:col-span-1 flex justify-center">
                 <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md"
                />
            </div>
            <div className="md:col-span-2 flex flex-col min-h-0">
                 <Tabs defaultValue="month" className="w-full flex flex-col flex-1 min-h-0">
                    <TabsList>
                        <TabsTrigger value="day">Day</TabsTrigger>
                        <TabsTrigger value="week">Week</TabsTrigger>
                        <TabsTrigger value="month">Month</TabsTrigger>
                    </TabsList>
                    <div className="flex-1 mt-4 relative">
                      <ScrollArea className="absolute inset-0 w-full h-full pr-4">
                          <TabsContent value="day"><SessionList view="day" /></TabsContent>
                          <TabsContent value="week"><SessionList view="week" /></TabsContent>
                          <TabsContent value="month"><SessionList view="month" /></TabsContent>
                      </ScrollArea>
                    </div>
                </Tabs>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
