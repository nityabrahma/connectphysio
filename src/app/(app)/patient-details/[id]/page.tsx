
"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { LS_KEYS } from "@/lib/constants";
import type { Patient, Session, Therapist, Questionnaire } from "@/types/domain";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format, isFuture, parse, parseISO } from "date-fns";
import {
  Mail,
  Phone,
  User,
  Calendar as CalendarIcon,
  Stethoscope,
  StickyNote,
  ArrowLeft,
  Edit,
  Trash2,
  PackagePlus,
  PlusCircle,
  MoreVertical,
  MessageSquareQuote,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams, useRouter } from "next/navigation";
import { usePatients } from "@/hooks/use-patients";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditSessionModal } from "./edit-session-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";


const FormattedHealthNotes = ({ notes }: { notes?: string }) => {
    if (!notes) return <p className="text-sm text-muted-foreground">No health notes recorded for this session.</p>;
    
    const [questionnaires] = useLocalStorage<Questionnaire[]>(LS_KEYS.QUESTIONNAIRES, []);

    try {
      const parsedNotes = JSON.parse(notes);
      if (typeof parsedNotes !== 'object' || !parsedNotes.questionnaireId || !parsedNotes.answers) {
        throw new Error("Invalid notes format");
      }
      
      const questionnaire = questionnaires.find(q => q.id === parsedNotes.questionnaireId);
      if (!questionnaire) {
        return <p className="bg-secondary/50 p-3 rounded-md text-sm">Questionnaire used for this session could not be found.</p>;
      }

      return (
        <div className="space-y-4">
          <h5 className="font-semibold text-foreground">{questionnaire.title}</h5>
          <ul className="space-y-3">
            {questionnaire.questions.map(q => {
              const answer = parsedNotes.answers[q.id];
              return (
                <li key={q.id} className="text-sm">
                  <p className="font-medium text-foreground">{q.label}</p>
                  <p className="text-muted-foreground pl-2 mt-1 bg-secondary/30 p-2 rounded-md">{Array.isArray(answer) ? answer.join(', ') : answer || 'N/A'}</p>
                </li>
              )
            })}
          </ul>
        </div>
      );
    } catch (e) {
      // Fallback for old plain text notes
      return <p className="bg-secondary/50 p-3 rounded-md text-sm">{notes}</p>;
    }
};

const ViewSessionModal = ({ session, isOpen, onOpenChange, getTherapistName }: { session: Session | null; isOpen: boolean; onOpenChange: (open: boolean) => void; getTherapistName: (id: string) => string; }) => {
    if (!session) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Session Details</DialogTitle>
                    <DialogDescription>
                        Completed on {format(new Date(session.date), 'EEE, MMM d, yyyy')} with {getTherapistName(session.therapistId)}.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 -mr-6 pr-6">
                    <div className="space-y-6 py-4">
                        <div>
                            <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2"><Stethoscope size={18}/> Health Notes</h4>
                            <div className="p-4 border rounded-lg">
                                <FormattedHealthNotes notes={session.healthNotes} />
                            </div>
                        </div>
                        {session.notes && (
                           <div>
                                <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2"><StickyNote size={18}/> Internal Notes</h4>
                                <div className="p-4 border rounded-lg bg-secondary/50">
                                  <p className="text-sm text-muted-foreground">{session.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { getPatient, deletePatient } = usePatients();
  const patientId = params.id as string;
  const patient = getPatient(patientId);

  const [sessions, setSessions] = useLocalStorage<Session[]>(
    LS_KEYS.SESSIONS,
    []
  );
  const [therapists] = useLocalStorage<Therapist[]>(LS_KEYS.THERAPISTS, []);

  const [sessionToEdit, setSessionToEdit] = useState<Session | null>(null);
  const [sessionToView, setSessionToView] = useState<Session | null>(null);

  const patientSessions = useMemo(() => {
    return sessions
      .filter((s) => s.patientId === patientId)
      .sort((a, b) => {
          const timeA = parse(`${a.date} ${a.startTime}`, 'yyyy-MM-dd HH:mm', new Date());
          const timeB = parse(`${b.date} ${b.startTime}`, 'yyyy-MM-dd HH:mm', new Date());
          return timeB.getTime() - timeA.getTime();
      });
  }, [sessions, patientId]);

  const upcomingSessions = useMemo(() => {
    return patientSessions.filter(
      (s) =>
        (s.status === "scheduled" || s.status === "checked-in") &&
        (isFuture(parseISO(s.date)) || format(new Date(s.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
    );
  }, [patientSessions]);

  const completedSessions = useMemo(() => {
    return patientSessions.filter((s) => s.status === "completed");
  }, [patientSessions]);
  
  const handleNewAppointmentClick = () => {
    router.push(`/appointments/new?patientId=${patientId}`);
  };
  
  const handleDeletePatient = () => {
    if(patient) {
        deletePatient(patient.id);
        router.push('/patients');
    }
  }

  const handleUpdateSession = (updatedSession: Session) => {
    setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));
    toast({ title: 'Session Updated' });
    setSessionToEdit(null);
  };

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-2xl font-semibold mb-4">Patient not found</h2>
        <p className="text-muted-foreground mb-6">
          The patient you are looking for does not exist or could not be loaded.
        </p>
        <Button asChild>
          <Link href="/patients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patients
          </Link>
        </Button>
      </div>
    );
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const getTherapistName = (therapistId: string) => {
    return therapists.find(t => t.id === therapistId)?.name || 'Unknown Therapist';
  }


  const SessionList = ({ sessions, isCompletedList = false }: { sessions: Session[], isCompletedList?: boolean }) => {
    if (sessions.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          <CalendarIcon className="mx-auto h-12 w-12" />
          <p className="mt-4">No sessions found.</p>
        </div>
      );
    }
    
    if (isCompletedList) {
        return (
            <div className="w-full space-y-3">
                {sessions.map((session) => (
                   <button 
                    key={session.id} 
                    className="p-3 bg-muted/30 rounded-lg w-full flex items-center justify-between text-left hover:bg-muted/60 transition-colors"
                    onClick={() => setSessionToView(session)}
                   >
                       <div>
                            <p className="font-semibold">{format(new Date(session.date), 'EEE, MMM d, yyyy')} &middot; {session.startTime}</p>
                            <p className="text-sm text-muted-foreground">with {getTherapistName(session.therapistId)}</p>
                        </div>
                        <Badge variant="outline" className="capitalize">{session.status}</Badge>
                   </button>
                ))}
            </div>
        )
    }
  
    return (
        <Accordion type="single" collapsible className="w-full space-y-3">
            {sessions.map((session) => (
                <AccordionItem value={session.id} key={session.id} className="border-none">
                    <div className="p-3 bg-muted/30 rounded-lg w-full flex items-center justify-between">
                       <AccordionTrigger className="flex-1 p-0 hover:no-underline w-full">
                          <div className="flex justify-between items-center w-full">
                            <div className="text-left">
                                <p className="font-semibold">{format(new Date(session.date), 'EEE, MMM d, yyyy')} &middot; {session.startTime}</p>
                                <p className="text-sm text-muted-foreground">with {getTherapistName(session.therapistId)}</p>
                            </div>
                            <Badge variant="outline" className="capitalize mr-4">{session.status}</Badge>
                          </div>
                       </AccordionTrigger>
                       {(!isCompletedList && session.status !== 'completed') && (
                         <Button variant="outline" size="sm" onClick={() => setSessionToEdit(session)} className="ml-4">
                            <Edit className="h-4 w-4 mr-2" /> Edit
                         </Button>
                       )}
                    </div>
                    <AccordionContent className="py-2 px-4 text-sm text-muted-foreground space-y-3">
                         {session.healthNotes && (
                             <div className="pt-2">
                                <h4 className="font-semibold text-foreground flex items-center gap-2 mb-1"><Stethoscope size={16}/> Health Notes Summary</h4>
                                <p className="bg-secondary/50 p-2 rounded-md italic">Notes have been recorded for this session.</p>
                            </div>
                         )}
                         {session.notes && (
                            <div>
                                <h4 className="font-semibold text-foreground flex items-center gap-2 mb-1"><StickyNote size={16}/> Internal Notes</h4>
                                <p className="bg-secondary/50 p-2 rounded-md">{session.notes}</p>
                            </div>
                         )}
                         {!session.healthNotes && !session.notes && <p>No notes for this session.</p>}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-8 h-full overflow-hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">Patient Details</h1>
          </div>
          <div className="flex items-center gap-2">
              <Button onClick={handleNewAppointmentClick}>
                  <PlusCircle/> New Appointment
              </Button>
              <AlertDialog>
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
                              <MoreVertical className="h-4 w-4" />
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Patient Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => router.push(`/patients/edit/${patient.id}`)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => router.push(`/assign-package/${patient.id}`)}>
                              <PackagePlus className="mr-2 h-4 w-4" /> Assign Package
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete Patient
                              </DropdownMenuItem>
                          </AlertDialogTrigger>
                      </DropdownMenuContent>
                  </DropdownMenu>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the patient record for {patient.name} and all associated data.
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeletePatient} className="bg-destructive hover:bg-destructive/90">
                              Delete
                          </AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 min-h-0 size-full">
          {/* Left Column: Patient Info */}
          <div className="md:col-span-1 space-y-6 flex-[1/3]">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start gap-4 space-y-0">
                <Avatar className="w-16 h-16 text-xl">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(patient.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{patient.name}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-2 mt-2 text-sm break-all">
                      <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />{" "}
                      <span>{patient.email}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />{" "}
                      <span>{patient.phone}</span>
                    </div>
                    {patient.age && (
                      <div className="flex items-center gap-2 mt-1 text-sm">
                        <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />{" "}
                        <span>{patient.age} years old</span>
                      </div>
                    )}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                {patient.medicalInfo && (
                  <div>
                    <h4 className="font-semibold mb-1 text-sm">Medical Info</h4>
                    <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">
                      {patient.medicalInfo}
                    </p>
                  </div>
                )}
                {patient.notes && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-1 text-sm">Internal Notes</h4>
                    <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">
                      {patient.notes}
                    </p>
                  </div>
                )}
                {!patient.medicalInfo && !patient.notes && (
                  <p className="text-sm text-muted-foreground">
                    No additional information provided.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Session History */}
          <div className="md:col-span-2 flex flex-col min-h-0">
            <Card className="flex flex-col min-h-full">
              <CardHeader>
                <CardTitle>Session History</CardTitle>
                <CardDescription>
                  View upcoming and past appointments for this patient.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0 pt-4">
                <Tabs defaultValue="upcoming" className="w-full flex flex-col flex-1 min-h-0">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>
                  <div className="flex-1 mt-4 relative">
                      <ScrollArea className="absolute inset-0 w-full h-full pr-4">
                          <TabsContent value="upcoming">
                            <SessionList sessions={upcomingSessions} />
                          </TabsContent>
                          <TabsContent value="completed">
                              <SessionList sessions={completedSessions} isCompletedList />
                          </TabsContent>
                      </ScrollArea>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {sessionToEdit && (
        <EditSessionModal
            isOpen={!!sessionToEdit}
            onOpenChange={(isOpen) => !isOpen && setSessionToEdit(null)}
            session={sessionToEdit}
            onUpdate={handleUpdateSession}
        />
      )}
       <ViewSessionModal
            session={sessionToView}
            isOpen={!!sessionToView}
            onOpenChange={(isOpen) => !isOpen && setSessionToView(null)}
            getTherapistName={getTherapistName}
        />
    </>
  );
}

    