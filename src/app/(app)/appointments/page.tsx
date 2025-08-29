
"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  LogOut,
  PlusCircle,
  UserPlus,
  User,
  Edit,
  DollarSign
} from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import type { Patient, Session, Therapist, Treatment, TreatmentPlan, Centre } from "@/types/domain";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { LS_KEYS } from "@/lib/constants";
import { usePatients } from "@/hooks/use-patients";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Calendar as MiniCalendar } from "@/components/ui/calendar";
import { format, parse } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { EndSessionForm } from "../dashboard/end-session-form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { CalendarEvent } from "@/components/big-calendar";
import { Calendar } from "@/components/big-calendar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";


export default function AppointmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const isMobile = useIsMobile();

  const [sessions, setSessions] = useLocalStorage<Session[]>(
    LS_KEYS.SESSIONS,
    []
  );
  const { patients } = usePatients();
  const [therapists] = useLocalStorage<Therapist[]>(LS_KEYS.THERAPISTS, []);
  const [treatmentPlans, setTreatmentPlans] = useLocalStorage<TreatmentPlan[]>(LS_KEYS.TREATMENT_PLANS, []);

  const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<"day" | "week">("day");
  
  const [sessionToEnd, setSessionToEnd] = useState<Session | null>(null);

  const centreSessions = useMemo(() => {
    let filtered = sessions.filter(
      (s) => s.centreId === user?.centreId && s.status !== "cancelled"
    );
    if (user?.role === "therapist") {
      filtered = filtered.filter((s) => s.therapistId === user?.therapistId);
    }
    return filtered.sort((a, b) => {
      const timeA = parse(
        `${a.date} ${a.startTime}`,
        "yyyy-MM-dd HH:mm",
        new Date()
      );
      const timeB = parse(
        `${b.date} ${b.startTime}`,
        "yyyy-MM-dd HH:mm",
        new Date()
      );
      return timeA.getTime() - timeB.getTime();
    });
  }, [sessions, user]);

  const events: CalendarEvent<Session>[] = useMemo(() => {
    return centreSessions.map((session) => {
      const start = parse(
        `${session.date} ${session.startTime}`,
        "yyyy-MM-dd HH:mm",
        new Date()
      );
      const end = parse(
        `${session.date} ${session.endTime}`,
        "yyyy-MM-dd HH:mm",
        new Date()
      );
      const patient = patients.find((p) => p.id === session.patientId);
      return {
        id: session.id,
        title: patient?.name || "Unknown Patient",
        start,
        end,
        resource: session,
      };
    });
  }, [centreSessions, patients]);

  const handleEndSessionSubmit = (sessionId: string, healthNotes: string, treatment: Omit<Treatment, 'date'>) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    const patientTreatmentPlans = treatmentPlans.filter(tp => tp.patientId === session.patientId);
    const activePlan = patientTreatmentPlans.find(tp => tp.isActive) || patientTreatmentPlans[0];

    if (activePlan) {
        const newTreatment: Treatment = { ...treatment, date: new Date().toISOString() };
        const updatedPlans = treatmentPlans.map(tp => 
            tp.id === activePlan.id 
                ? { ...tp, treatments: [...tp.treatments, newTreatment] } 
                : tp
        );
        setTreatmentPlans(updatedPlans);
    } else {
        toast({ title: "No active treatment plan found to add treatment to.", variant: 'destructive' });
    }

    setSessions(sessions.map(s => s.id === sessionId ? { ...s, status: 'completed', healthNotes } : s));
    toast({ title: 'Session Completed' });
    setSessionToEnd(null);
  }

  const onNavigate = (date: Date) => {
    setSelectedDate(date);
    setVisibleMonth(date);
  };

  const EventComponent = ({ event, total, index }: { event: CalendarEvent<Session>, total: number, index: number }) => {
    const patient = patients.find((p) => p.id === event.resource.patientId);
    const therapist = therapists.find(
      (t) => t.id === event.resource.therapistId
    );
    const getInitials = (name: string) =>
      name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

    const canManageSession = (session: Session) => {
      if (user?.role === "admin" || user?.role === "receptionist") return true;
      if (
        user?.role === "therapist" &&
        user.therapistId === session.therapistId
      )
        return true;
      return false;
    };

    const handleUpdateSessionStatus = (
      sessionId: string,
      status: Session["status"]
    ) => {
      setSessions(
        sessions.map((s) => (s.id === sessionId ? { ...s, status } : s))
      );
      toast({
        title: `Session ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      });
    };
    
    const width = total > 1 ? `${100 / total}%` : '100%';
    const left = total > 1 ? `${index * (100 / total)}%` : '0';

    return (
      <Popover>
        <PopoverTrigger asChild>
          <div
            className={cn(
              "p-1 h-full w-full cursor-pointer text-primary-foreground rounded-md border-l-4 absolute transition-colors",
              event.resource.status === "completed" &&
                "bg-green-500/80 border-green-700 hover:bg-green-500/90",
              event.resource.status === "checked-in" &&
                "bg-blue-500/80 border-blue-700 hover:bg-blue-500/90",
              event.resource.status === "scheduled" &&
                "bg-primary/80 border-primary hover:bg-primary/90"
            )}
             style={{ width, left }}
          >
            <p className="font-semibold text-xs truncate">{event.title}</p>
            <p className="text-xs text-primary-foreground/80">
              {format(event.start, "h:mm a")}
            </p>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 z-20">
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
                  <p className="text-sm text-muted-foreground">
                    {patient?.email}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-muted-foreground">When</span>
                <span className="col-span-2 font-semibold">
                  {format(event.start, "EEE, MMM d")} ·{" "}
                  {format(event.start, "h:mm a")} -{" "}
                  {format(event.end, "h:mm a")}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-muted-foreground">Therapist</span>
                <span className="col-span-2">{therapist?.name}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-muted-foreground">Status</span>
                <span className="col-span-2 capitalize">
                  {event.resource.status}
                </span>
              </div>
            </div>
            {canManageSession(event.resource) &&
              (event.resource.status !== "completed") && (
                <div className="flex gap-2 w-full pt-4 border-t">
                  {event.resource.status === "scheduled" && (
                    <Button
                      size="sm"
                      onClick={() =>
                        handleUpdateSessionStatus(
                          event.resource.id,
                          "checked-in"
                        )
                      }
                    >
                      <Check /> Check In
                    </Button>
                  )}
                  {event.resource.status === "checked-in" && (
                    <Button
                      size="sm"
                      onClick={() => setSessionToEnd(event.resource)}
                    >
                      <LogOut /> End Session
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={() =>
                      router.push(`/appointments/edit/${event.resource.id}`)
                    }
                  >
                    <Edit /> Edit
                  </Button>
                </div>
              )}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-8 h-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          {user?.role !== "therapist" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <PlusCircle />
                  New Appointment
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() =>
                    router.push("/patients/new?redirectToAppointment=true")
                  }
                >
                  <UserPlus /> New Patient
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => router.push("/patients?select=true")}
                >
                  <User /> Existing Patient
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
         <div className="flex flex-col lg:flex-row flex-1 gap-6 min-h-0">
          <Card className="w-full lg:max-w-xs">
            <CardContent className="p-2 md:p-4 flex flex-col gap-3 justify-start items-center h-full">
              <MiniCalendar
                mode="single"
                month={visibleMonth}
                onMonthChange={setVisibleMonth}
                selected={selectedDate}
                onSelect={(d) => {
                  if (d) {
                    setSelectedDate(d);
                    setActiveTab("day");
                  }
                }}
                className="rounded-md"
              />
              <Button
                variant="outline"
                onClick={() => {
                  const now = new Date();
                  setVisibleMonth(now);
                  setSelectedDate(now);
                  setActiveTab("day");
                }}
                className="w-full"
              >
                Today
              </Button>
            </CardContent>
          </Card>
          
          <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <CardContent className="p-0 md:p-0 flex-1 flex flex-col min-h-0">
              <Calendar
                events={events}
                view={activeTab}
                onViewChange={setActiveTab}
                currentDate={selectedDate}
                onDateChange={onNavigate}
                eventComponent={EventComponent}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {sessionToEnd && (
        <EndSessionForm
          session={sessionToEnd}
          patient={patients.find((p) => p.id === sessionToEnd.patientId)}
          isOpen={!!sessionToEnd}
          onOpenChange={(isOpen) => !isOpen && setSessionToEnd(null)}
          onSubmit={handleEndSessionSubmit}
        />
      )}
    </>
  );
}
