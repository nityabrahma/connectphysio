
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Check, LogOut, PlusCircle, UserPlus, User, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import { useMemo, useState } from "react";
import type { Patient, Session, Therapist } from "@/types/domain";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { LS_KEYS } from "@/lib/constants";
import { usePatients } from "@/hooks/use-patients";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Calendar as MiniCalendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parse, startOfWeek, getDay } from "date-fns";
import {enUS} from 'date-fns/locale/en-US'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { EndSessionForm } from "../dashboard/end-session-form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  Views,
  type Event,
} from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { cn } from "@/lib/utils";

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

interface SessionEvent extends Event {
  resource: Session;
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [sessions, setSessions] = useLocalStorage<Session[]>(LS_KEYS.SESSIONS, []);
  const { patients } = usePatients();
  const [therapists] = useLocalStorage<Therapist[]>(LS_KEYS.THERAPISTS, []);

  // Left sidebar visible month + selected date for main calendar
  const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Tabs: today | week | month
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('today');

  const [sessionToEnd, setSessionToEnd] = useState<Session | null>(null);

  const centreSessions = useMemo(() => {
    let filtered = sessions.filter(s => s.centreId === user?.centreId && s.status !== 'cancelled');
    if (user?.role === 'therapist') {
      filtered = filtered.filter(s => s.therapistId === user?.therapistId);
    }
    return filtered.sort((a, b) => {
      const timeA = parse(`${a.date} ${a.startTime}`, 'yyyy-MM-dd HH:mm', new Date());
      const timeB = parse(`${b.date} ${b.startTime}`, 'yyyy-MM-dd HH:mm', new Date());
      return timeA.getTime() - timeB.getTime();
    });
  }, [sessions, user]);

  const events: SessionEvent[] = useMemo(() => {
    return centreSessions.map(session => {
      const start = parse(`${session.date} ${session.startTime}`, 'yyyy-MM-dd HH:mm', new Date());
      const end = parse(`${session.date} ${session.endTime}`, 'yyyy-MM-dd HH:mm', new Date());
      const patient = patients.find(p => p.id === session.patientId);
      return {
        title: patient?.name || 'Unknown Patient',
        start,
        end,
        resource: session,
      };
    });
  }, [centreSessions, patients]);

  const handleEndSessionSubmit = (sessionId: string, healthNotes: string | undefined) => {
    if (!healthNotes || healthNotes.trim() === '' || healthNotes.trim() === '{}') {
      toast({ title: 'Please fill out the session form to complete the session.', variant: 'destructive' });
      return;
    }
    setSessions(sessions.map(s => s.id === sessionId ? { ...s, status: 'completed', healthNotes } : s));
    toast({ title: 'Session Completed' });
    setSessionToEnd(null);
  };

  // Custom event (popover like Google Calendar)
  const EventComponent = ({ event }: { event: SessionEvent }) => {
    const patient = patients.find(p => p.id === event.resource.patientId);
    const therapist = therapists.find(t => t.id === event.resource.therapistId);
    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

    const canManageSession = (session: Session) => {
      if (user?.role === 'admin' || user?.role === 'receptionist') return true;
      if (user?.role === 'therapist' && user.therapistId === session.therapistId) return true;
      return false;
    };

    const handleUpdateSessionStatus = (sessionId: string, status: Session['status']) => {
      setSessions(sessions.map(s => s.id === sessionId ? { ...s, status } : s));
      toast({ title: `Session ${status.charAt(0).toUpperCase() + status.slice(1)}` });
    };

    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className="p-1 h-full w-full cursor-pointer text-primary-foreground">
            <p className="font-semibold text-xs truncate">{event.title}</p>
            <p className="text-xs text-primary-foreground/80">{format(event.start as Date, 'h:mm a')}</p>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {patient && getInitials(patient.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium leading-none">{patient?.name}</h4>
                  <p className="text-sm text-muted-foreground">{patient?.email}</p>
                </div>
              </div>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-muted-foreground">When</span>
                <span className="col-span-2 font-semibold">
                  {format(event.start as Date, 'EEE, MMM d')} · {format(event.start as Date, 'h:mm a')} - {format(event.end as Date, 'h:mm a')}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-muted-foreground">Therapist</span>
                <span className="col-span-2">{therapist?.name}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-muted-foreground">Status</span>
                <span className="col-span-2 capitalize">{event.resource.status}</span>
              </div>
            </div>
            {canManageSession(event.resource) && event.resource.status !== 'completed' && (
              <div className="flex gap-2 w-full pt-4 border-t">
                {event.resource.status === 'scheduled' && (
                  <Button size="sm" onClick={() => handleUpdateSessionStatus(event.resource.id, 'checked-in')}><Check /> Check In</Button>
                )}
                {event.resource.status === 'checked-in' && (
                  <Button size="sm" onClick={() => setSessionToEnd(event.resource)}><LogOut /> End Session</Button>
                )}
                <Button variant="outline" size="sm" className="ml-auto" onClick={() => router.push(`/appointments/edit/${event.resource.id}`)}><Edit /> Edit</Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // Map tabs to BigCalendar view
  const viewForTab = (tab: 'today' | 'week' | 'month') => {
    if (tab === 'today') return Views.DAY;
    if (tab === 'week') return Views.WEEK;
    return Views.MONTH;
  };

  const onNavigate = (date: Date) => {
    setSelectedDate(date);
    setVisibleMonth(date);
  };

  return (
    <>
      <div className="flex flex-col gap-8 h-full">
        {/* Header */}
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
                <DropdownMenuItem onSelect={() => router.push('/patients/new?redirectToAppointment=true')}>
                  <UserPlus /> New Patient
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push('/patients?select=true')}>
                  <User /> Existing Patient
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Main Grid */}
        <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <CardContent className="p-4 md:p-6 grid md:grid-cols-4 gap-6 flex-1 min-h-0">
            {/* LEFT: Month mini calendar + controls */}
            <div className="md:col-span-1 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => setVisibleMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium">{format(visibleMonth, 'MMMM yyyy')}</div>
                <Button variant="ghost" size="icon" onClick={() => setVisibleMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <MiniCalendar
                mode="single"
                month={visibleMonth}
                onMonthChange={setVisibleMonth}
                selected={selectedDate}
                onSelect={(d) => { if (d) { setSelectedDate(d); setActiveTab('today'); } }}
                className="rounded-md"
              />
              <Button variant="outline" onClick={() => { const now = new Date(); setVisibleMonth(now); setSelectedDate(now); setActiveTab('today'); }}>Today</Button>
            </div>

            {/* RIGHT: Tabs + BigCalendar */}
            <div className="md:col-span-3 flex flex-col min-h-0">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex flex-col flex-1 min-h-0">
                <div className="flex items-center justify-between">
                  <TabsList>
                    <TabsTrigger value="today">Today</TabsTrigger>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">This Month</TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">{format(selectedDate, 'EEE, dd MMM yyyy')}</div>
                    <Button variant="outline" size="sm" onClick={() => { const now = new Date(); setSelectedDate(now); setVisibleMonth(now); setActiveTab('today'); }}>Today</Button>
                  </div>
                </div>

                <div className="mt-4 flex-1 min-h-0">
                  {/* Single BigCalendar instance controlled by tab */}
                  <div className="h-[72vh] md:h-[70vh] w-full rounded-lg border">
                    <BigCalendar
                      localizer={localizer}
                      events={events}
                      startAccessor="start"
                      endAccessor="end"
                      date={selectedDate}
                      onNavigate={onNavigate}
                      view={viewForTab(activeTab)}
                      toolbar={false}
                      components={{ event: EventComponent }}
                      eventPropGetter={(event) => {
                        const status = (event as SessionEvent).resource.status;
                        const className = cn(
                            'rounded-md border-l-4 p-0',
                            status === 'completed' && 'bg-green-500/80 border-green-700',
                            status === 'checked-in' && 'bg-blue-500/80 border-blue-700',
                            status === 'scheduled' && 'bg-primary/80 border-primary',
                        );
                        return { className };
                      }}
                    />
                  </div>
                </div>

                {/* Hidden contents just to satisfy Tabs structure (we use one calendar instance) */}
                <TabsContent value="today" />
                <TabsContent value="week" />
                <TabsContent value="month" />
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>

      {sessionToEnd && (
        <EndSessionForm
          session={sessionToEnd}
          patient={patients.find(p => p.id === sessionToEnd.patientId)}
          isOpen={!!sessionToEnd}
          onOpenChange={(isOpen) => !isOpen && setSessionToEnd(null)}
          onSubmit={handleEndSessionSubmit}
        />
      )}
    </>
  );
}

    