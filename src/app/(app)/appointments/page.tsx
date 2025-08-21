
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Check, LogOut, PlusCircle, ChevronDown, MoreVertical, DollarSign } from "lucide-react";
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
import { format, isSameDay, isSameMonth, isSameWeek, isFuture } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


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
  const [bulkUpdatePatient, setBulkUpdatePatient] = useState<Patient | null>(null);

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
  
  const handleUpdatePaymentStatus = (sessionId: string, paymentStatus: Session['paymentStatus']) => {
    setSessions(sessions.map(s => s.id === sessionId ? { ...s, paymentStatus } : s));
    toast({ title: `Payment status updated to ${paymentStatus}` });
  };
  
  const handleBulkUpdatePaymentStatus = (patientId: string, paymentStatus: Session['paymentStatus']) => {
    setSessions(sessions.map(s => {
      if (s.patientId === patientId && isFuture(new Date(`${s.date}T${s.startTime}`))) {
        return { ...s, paymentStatus };
      }
      return s;
    }));
    toast({ title: "Bulk Payment Update", description: `Upcoming sessions for ${bulkUpdatePatient?.name} set to ${paymentStatus}.` });
    setBulkUpdatePatient(null);
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
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg w-full">
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
                 {canManagePayments && (
                  <Button variant="ghost" size="sm" className="ml-2" onClick={(e) => { e.stopPropagation(); setBulkUpdatePatient(patient); }}>
                    <DollarSign className="mr-2 h-4 w-4" /> Bulk Update
                  </Button>
                )}
              </div>
              <AccordionContent>
                  <ul className="space-y-2 pt-2 pl-4 border-l ml-5">
                      {patientSessions.map(session => (
                          <li key={session.id} className="p-4 bg-muted/50 rounded-lg flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                              <div className="flex-1">
                                  <p className="font-semibold">{format(new Date(session.date), 'EEE, MMM d')} &middot; {session.startTime} - {session.endTime}</p>
                                  <p className="text-sm text-muted-foreground">with {getTherapistName(session.therapistId)}</p>
                                  <div className="flex gap-2 mt-2 flex-wrap">
                                    <Badge variant={session.paymentStatus === 'paid' ? 'default' : 'secondary'} className="capitalize">{session.paymentStatus}</Badge>
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
                                          <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                           <DropdownMenuItem onSelect={() => {
                                              setSelectedSession(session);
                                              setIsFormOpen(true);
                                          }}>
                                              Edit Details
                                          </DropdownMenuItem>
                                          {canManagePayments && (
                                            <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onSelect={() => handleUpdatePaymentStatus(session.id, 'paid')} disabled={session.paymentStatus === 'paid'}>
                                              Mark as Paid
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => handleUpdatePaymentStatus(session.id, 'unpaid')} disabled={session.paymentStatus === 'unpaid'}>
                                              Mark as Unpaid
                                            </DropdownMenuItem>
                                            </>
                                          )}
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

  const BulkUpdatePaymentDialog = () => {
    const [status, setStatus] = useState<Session['paymentStatus']>('unpaid');
    
    if (!bulkUpdatePatient) return null;

    return (
      <AlertDialog open={!!bulkUpdatePatient} onOpenChange={() => setBulkUpdatePatient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bulk Update Payments for {bulkUpdatePatient.name}</AlertDialogTitle>
            <AlertDialogDescription>
              This will update the payment status for all upcoming sessions for this patient. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label className="mb-2 block">Payment Status</Label>
            <RadioGroup defaultValue="unpaid" onValueChange={(value: Session['paymentStatus']) => setStatus(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unpaid" id="r-unpaid" />
                <Label htmlFor="r-unpaid">Unpaid</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paid" id="r-paid" />
                <Label htmlFor="r-paid">Paid</Label>
              </div>
            </RadioGroup>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleBulkUpdatePaymentStatus(bulkUpdatePatient.id, status)}>
              Update Sessions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <div className="flex flex-col gap-8 h-full">
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        {user?.role !== 'therapist' && (
          <Button onClick={handleAddClick}>
              <PlusCircle />
              New Appointment
          </Button>
        )}
      </div>
      
      <Card className="flex-1 flex flex-col min-h-0">
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
                 <Tabs defaultValue="month" className="w-full flex flex-col flex-1">
                    <TabsList>
                        <TabsTrigger value="day">Day</TabsTrigger>
                        <TabsTrigger value="week">Week</TabsTrigger>
                        <TabsTrigger value="month">Month</TabsTrigger>
                    </TabsList>
                    <div className="flex-1 mt-4 min-h-0">
                      <ScrollArea className="h-full w-full pr-4">
                          <TabsContent value="day"><SessionList view="day" /></TabsContent>
                          <TabsContent value="week"><SessionList view="week" /></TabsContent>
                          <TabsContent value="month"><SessionList view="month" /></TabsContent>
                      </ScrollArea>
                    </div>
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
      <BulkUpdatePaymentDialog />
    </div>
  );
}

    