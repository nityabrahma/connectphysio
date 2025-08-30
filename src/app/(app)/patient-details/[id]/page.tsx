
"use client";

import { useRealtimeDb } from "@/hooks/use-realtime-db";
import {
  Patient,
  Session,
  Therapist,
  TreatmentPlan,
  Treatment,
  Questionnaire,
} from "@/types/domain";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay, parse } from "date-fns";
import {
  Mail,
  Phone,
  ArrowLeft,
  Edit,
  Trash2,
  PackagePlus,
  PlusCircle,
  MoreVertical,
  FilePlus,
  Calendar as CalendarIcon,
  Stethoscope,
  StickyNote,
  History,
  Info,
  HeartPulse,
  Clock,
  Check,
  LogOut,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { generateId } from "@/lib/ids";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FormattedHealthNotes } from "@/components/formatted-health-notes";
import { ConsultationNotesForm } from "./consultation-notes-form";
import { EndSessionForm } from "../../dashboard/end-session-form";
import { Textarea } from "@/components/ui/textarea";


const ViewSessionModal = ({
  session,
  isOpen,
  onOpenChange,
  getTherapistName,
}: {
  session: Session | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  getTherapistName: (id: string) => string;
}) => {
  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Session Details</DialogTitle>
          <DialogDescription>
            Completed on {format(new Date(session.date), "EEE, MMM d, yyyy")}{" "}
            with {getTherapistName(session.therapistId)}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto -mr-6 pr-6">
          <div className="space-y-6 py-4">
            <div>
              <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                <Stethoscope size={18} /> Health Notes
              </h4>
              <div className="p-4 border rounded-lg">
                <FormattedHealthNotes notes={session.healthNotes} />
              </div>
            </div>
            {session.notes && (
              <div>
                <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                  <StickyNote size={18} /> Internal Notes
                </h4>
                <div className="p-4 border rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground">
                    {session.notes}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const NewTreatmentPlanModal = ({
  isOpen,
  onOpenChange,
  onSubmit,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => void;
}) => {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim());
      setName("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start New Treatment Plan</DialogTitle>
          <DialogDescription>
            Give this new treatment plan a descriptive name.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="plan-name">Treatment Plan Name</Label>
          <Input
            id="plan-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Post-Surgery Knee Rehab"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            Create Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const UpdateTreatmentModal = ({
    isOpen,
    onOpenChange,
    onSubmit,
    treatmentToEdit,
} : {
    isOpen: boolean,
    onOpenChange: (open: boolean) => void,
    onSubmit: (description: string, treatmentDate?: string) => void,
    treatmentToEdit?: Treatment,
}) => {
    const [description, setDescription] = useState("");
    const isEditing = !!treatmentToEdit;

    useEffect(() => {
        if(isOpen) {
            setDescription(treatmentToEdit?.description || "");
        }
    }, [isOpen, treatmentToEdit]);
    
    const handleSubmit = () => {
        if (description.trim()) {
            onSubmit(description.trim(), treatmentToEdit?.date);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Treatment' : 'Add New Treatment'}</DialogTitle>
                    <DialogDescription>
                       {isEditing ? 'Update the details for this treatment entry.' : 'Add a new set of prescribed exercises for this treatment plan. This will become the new active treatment.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="treatment-description">Treatment Description</Label>
                    <Textarea 
                        id="treatment-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter the group of exercises..."
                        rows={5}
                    />
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!description.trim()}>Save Treatment</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const SessionHistoryModal = ({
    isOpen,
    onOpenChange,
    sessions,
    setSessionToEdit,
    setSessionToView,
    getTherapistName,
    planName,
} : {
    isOpen: boolean,
    onOpenChange: (open: boolean) => void,
    sessions: Session[],
    setSessionToEdit: (s: Session) => void,
    setSessionToView: (s: Session) => void,
    getTherapistName: (id: string) => string,
    planName: string,
}) => {

    const upcomingSessions = useMemo(() => {
        return sessions.filter(
        (s) =>
            (s.status === "scheduled" || s.status === "checked-in")
        );
    }, [sessions]);

    const completedSessions = useMemo(() => {
        return sessions.filter((s) => s.status === "completed");
    }, [sessions]);

    return (
         <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Session History</DialogTitle>
                    <DialogDescription>
                        All sessions for treatment plan: <span className="font-semibold">{planName}</span>
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 flex flex-col min-h-0 pt-4">
                     <Tabs
                        defaultValue="upcoming"
                        className="w-full flex flex-col flex-1 min-h-0"
                    >
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                            <TabsTrigger value="completed">Completed</TabsTrigger>
                        </TabsList>
                        <div className="flex-1 mt-4 relative">
                            <div className="absolute inset-0 w-full h-full overflow-y-auto pr-4">
                                <TabsContent value="upcoming">
                                    <SessionList
                                    sessions={upcomingSessions}
                                    setSessionToEdit={setSessionToEdit}
                                    getTherapistName={getTherapistName}
                                    />
                                </TabsContent>
                                <TabsContent value="completed">
                                    <SessionList
                                    sessions={completedSessions}
                                    isCompletedList
                                    setSessionToView={setSessionToView}
                                    getTherapistName={getTherapistName}
                                    />
                                </TabsContent>
                            </div>
                        </div>
                    </Tabs>
                </div>
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
  const { toast } = useToast();
  const { user } = useAuth();
  const { getPatient, deletePatient } = usePatients();
  const patientId = params.id as string;
  const patient = getPatient(patientId);

  const [sessions, setSessions] = useRealtimeDb<Record<string, Session>>("sessions", {});
  const [therapists] = useRealtimeDb<Record<string, Therapist>>("therapists", {});
  const [treatmentPlans, setTreatmentPlans] = useRealtimeDb<Record<string, TreatmentPlan>>("treatmentPlans", {});
  const [questionnaires] = useRealtimeDb<Record<string, Questionnaire>>("questionnaires", {});

  const [sessionToEdit, setSessionToEdit] = useState<Session | null>(null);
  const [sessionToView, setSessionToView] = useState<Session | null>(null);
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [sessionToEnd, setSessionToEnd] = useState<Session | null>(null);
  const [isUpdateTreatmentModalOpen, setIsUpdateTreatmentModalOpen] = useState(false);
  const [treatmentToEdit, setTreatmentToEdit] = useState<Treatment | undefined>(undefined);

  const consultationForm = useMemo(() => {
    return Object.values(questionnaires).find(q => q.centreId === user?.centreId);
  }, [questionnaires, user]);
  
  const patientTreatmentPlans = useMemo(() => {
    return Object.values(treatmentPlans)
      .filter((tp) => tp.patientId === patientId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [treatmentPlans, patientId]);

  const [activeTreatmentPlanId, setActiveTreatmentPlanId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (patientTreatmentPlans.length > 0 && !activeTreatmentPlanId) {
      const activePlan =
        patientTreatmentPlans.find((p) => p.isActive) ||
        patientTreatmentPlans[0];
      setActiveTreatmentPlanId(activePlan.id);
    }
  }, [patientTreatmentPlans, activeTreatmentPlanId]);

  const activeTreatmentPlan = useMemo(() => {
    return (
      patientTreatmentPlans.find((p) => p.id === activeTreatmentPlanId) || null
    );
  }, [patientTreatmentPlans, activeTreatmentPlanId]);
  
  const sortedTreatments = useMemo(() => {
    if (!activeTreatmentPlan || !activeTreatmentPlan.treatments) return [];
    return [...activeTreatmentPlan.treatments].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activeTreatmentPlan]);

  const handleNewTreatmentPlan = (name: string) => {
    if (!patient) return;

    const updatedPlans: Record<string, TreatmentPlan> = {};
    Object.entries(treatmentPlans).forEach(([id, plan]) => {
        if (plan.patientId === patientId) {
            updatedPlans[id] = { ...plan, isActive: false };
        } else {
            updatedPlans[id] = plan;
        }
    });
    
    const newPlanId = generateId();
    const newPlan: TreatmentPlan = {
      id: newPlanId,
      patientId: patient.id,
      name: name,
      createdAt: new Date().toISOString(),
      isActive: true,
      history: "Initial consultation.",
      examination: "Initial examination.",
      treatments: [
        {
          date: new Date().toISOString(),
          description: "Initial Treatment Plan - Please update.",
          charges: 0,
        },
      ],
    };

    setTreatmentPlans({ ...updatedPlans, [newPlanId]: newPlan });
    setActiveTreatmentPlanId(newPlan.id);
    setIsNewPlanModalOpen(false);
    toast({ title: "New treatment plan started." });
  };

  const handleUpdateTreatment = (description: string, treatmentDate?: string) => {
    if (!activeTreatmentPlan) return;

    const planToUpdate = treatmentPlans[activeTreatmentPlan.id];
    let newTreatments: Treatment[];

    if (treatmentDate) { // Editing existing treatment
      newTreatments = (planToUpdate.treatments || []).map(t => 
        t.date === treatmentDate ? { ...t, description } : t
      );
      toast({ title: "Treatment Updated" });
    } else { // Adding new treatment
      const newTreatment: Treatment = {
        date: new Date().toISOString(),
        description,
        charges: 0,
      };
      newTreatments = [...(planToUpdate.treatments || []), newTreatment];
      toast({ title: "New Treatment Added" });
    }
    
    const updatedPlan = { ...planToUpdate, treatments: newTreatments };
    setTreatmentPlans({ ...treatmentPlans, [activeTreatmentPlan.id]: updatedPlan });
    setIsUpdateTreatmentModalOpen(false);
    setTreatmentToEdit(undefined);
  };

  const patientSessions = useMemo(() => {
    if (!activeTreatmentPlanId) return [];
    return Object.values(sessions)
      .filter(
        (s) =>
          s.patientId === patientId &&
          s.treatmentPlanId === activeTreatmentPlanId
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sessions, patientId, activeTreatmentPlanId]);

  const todaysSession = useMemo(() => {
    return patientSessions.find(s => isSameDay(new Date(s.date), new Date()));
  }, [patientSessions]);
  
  const latestSessionForPlan = useMemo(() => {
    if (todaysSession && (todaysSession.status === 'checked-in' || todaysSession.status === 'completed')) {
        return todaysSession;
    }

    const completedSessions = patientSessions.filter(s => s.status === 'completed');
    if (completedSessions.length > 0) {
      return completedSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    }
    
    return null;
  }, [patientSessions, todaysSession]);

  const handleNewAppointmentClick = () => {
    if (!activeTreatmentPlanId) {
      toast({
        variant: "destructive",
        title: "No active treatment plan",
        description:
          "Please create a treatment plan before scheduling an appointment.",
      });
      return;
    }
    router.push(
      `/appointments/new?patientId=${patientId}&treatmentPlanId=${activeTreatmentPlanId}`
    );
  };

  const handleDeletePatient = () => {
    if (patient) {
      deletePatient(patient.id);
      router.push("/patients");
    }
  };

  const handleUpdateSession = (updatedSession: Session) => {
    setSessions({ ...sessions, [updatedSession.id]: updatedSession });
    toast({ title: "Session Updated" });
    setSessionToEdit(null);
  };

  const handleUpdateConsultationNotes = (sessionId: string, healthNotes: string) => {
    const sessionToUpdate = sessions[sessionId];
    if (sessionToUpdate) {
        setSessions({ ...sessions, [sessionId]: { ...sessionToUpdate, healthNotes } });
        toast({ title: "Consultation notes saved." });
    }
  };
  
  const handleUpdateSessionStatus = (sessionId: string, status: Session['status']) => {
    const sessionToUpdate = sessions[sessionId];
    if (sessionToUpdate) {
        setSessions({ ...sessions, [sessionId]: { ...sessionToUpdate, status }});
        toast({ title: `Session ${status.charAt(0).toUpperCase() + status.slice(1)}` });
    }
  };
  
  const handleEndSessionSubmit = (sessionId: string, healthNotes: string, treatment: Omit<Treatment, 'date'>) => {
    const session = sessions[sessionId];
    if (!session || !activeTreatmentPlan) return;
    
    // Add treatment from session to the plan if description is provided
    if (treatment.description) {
        const newTreatment: Treatment = { ...treatment, date: new Date().toISOString() };
        const planToUpdate = treatmentPlans[activeTreatmentPlan.id];
        const updatedPlan = { ...planToUpdate, treatments: [...(planToUpdate.treatments || []), newTreatment] };
        setTreatmentPlans({ ...treatmentPlans, [activeTreatmentPlan.id]: updatedPlan });
    }

    setSessions({ ...sessions, [sessionId]: { ...session, status: 'completed', healthNotes } });
    toast({ title: 'Session Completed' });
    setSessionToEnd(null);
  }

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

  const getTherapistName = (therapistId: string) => {
    return (
      therapists[therapistId]?.name || "Unknown Therapist"
    );
  };
  
  const canManageSession = (session: Session) => {
    if (user?.role === 'admin' || user?.role === 'receptionist') return true;
    if (user?.role === 'therapist' && user.therapistId === session.therapistId) return true;
    return false;
  }

  return (
    <>
      <div className="flex flex-col gap-8 h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {patient.name}
              </h1>
              <p className="text-muted-foreground">Patient Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {patientTreatmentPlans.length > 0 && activeTreatmentPlanId && (
              <Select
                value={activeTreatmentPlanId}
                onValueChange={setActiveTreatmentPlanId}
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select a treatment plan..." />
                </SelectTrigger>
                <SelectContent>
                  {patientTreatmentPlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} (
                      {format(new Date(plan.createdAt), "MMM d, yyyy")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <PlusCircle /> New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={handleNewAppointmentClick}>
                  <CalendarIcon />
                  New Appointment
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsNewPlanModalOpen(true)}>
                  <FilePlus />
                  New Treatment Plan
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
                  <DropdownMenuItem
                    onSelect={() => router.push(`/patients/edit/${patient.id}`)}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit Details
                  </DropdownMenuItem>
                   <DropdownMenuItem onSelect={() => setIsHistoryModalOpen(true)}>
                        <History className="mr-2 h-4 w-4" /> View Session History
                    </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      router.push(`/assign-package/${patient.id}`)
                    }
                  >
                    <PackagePlus className="mr-2 h-4 w-4" /> Assign Package
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-destructive"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Patient
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the patient record for {patient.name} and all associated
                    data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeletePatient}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
          {/* Left Column: Patient Details, Medical History, Treatment */}
          <div className="lg:col-span-1 flex flex-col space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Info size={20}/>Patient Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Age</Label>
                            <p>{patient.age || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Gender</Label>
                            <p className="capitalize">{patient.gender || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Contact</Label>
                            <p>{patient.phone}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Email</Label>
                            <p>{patient.email}</p>
                        </div>
                        <div className="space-y-1 col-span-2">
                            <Label className="text-muted-foreground">Address</Label>
                            <p>{patient.address || "N/A"}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><HeartPulse size={20}/>Medical History</CardTitle>
                <CardDescription>General medical history for the patient.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm p-2 bg-muted/50 rounded-md mt-1 whitespace-pre-wrap">
                    {patient.pastMedicalHistory || "No past medical history provided."}
                </p>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Treatment History</CardTitle>
                    <CardDescription>
                    Plan: <span className="font-semibold">{activeTreatmentPlan?.name}</span>
                    </CardDescription>
                </div>
                 <Button variant="outline" size="sm" onClick={() => { setTreatmentToEdit(undefined); setIsUpdateTreatmentModalOpen(true); }}>
                    <PlusCircle className="mr-2 h-4 w-4"/> New
                 </Button>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0 pt-4 space-y-4">
                 <div className="flex-1 overflow-y-auto -mr-4 pr-4">
                    <div className="space-y-4">
                        {sortedTreatments.length > 0 ? (
                             sortedTreatments.map(treatment => (
                                <Card key={treatment.date}>
                                    <CardHeader className="p-4 flex-row items-start justify-between">
                                        <CardTitle className="text-base">
                                            Updated on {format(new Date(treatment.date), "MMM d, yyyy")}
                                        </CardTitle>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setTreatmentToEdit(treatment); setIsUpdateTreatmentModalOpen(true); }}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 text-sm">
                                        <p className="whitespace-pre-wrap">{treatment.description}</p>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">No treatment prescribed for this plan yet.</p>
                        )}
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Today's Session & Consultation Notes */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {todaysSession && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock size={20} /> Today's Session
                  </CardTitle>
                  <CardDescription>
                    {format(parse(todaysSession.startTime, "HH:mm", new Date()), "h:mm a")} - {format(parse(todaysSession.endTime, "HH:mm", new Date()), "h:mm a")} with {getTherapistName(todaysSession.therapistId)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                   <Badge variant="outline" className="capitalize">
                      {todaysSession.status}
                    </Badge>
                   <div className="flex gap-2 items-center">
                    {canManageSession(todaysSession) && todaysSession.status === 'scheduled' && (
                      <Button size="sm" onClick={() => handleUpdateSessionStatus(todaysSession.id, 'checked-in')}>
                        <Check className="mr-2 h-4 w-4" /> Check In
                      </Button>
                    )}
                    {canManageSession(todaysSession) && (todaysSession.status === 'checked-in' || todaysSession.status === 'completed') && (
                      <Button size="sm" variant="secondary" onClick={() => setSessionToEnd(todaysSession)}>
                        <LogOut className="mr-2 h-4 w-4" /> Update
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {consultationForm ? (
                <ConsultationNotesForm 
                    questionnaire={consultationForm}
                    session={latestSessionForPlan}
                    onUpdate={handleUpdateConsultationNotes}
                />
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Consultation Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-center py-8">
                            No consultation form has been set up by the administrator.
                        </p>
                    </CardContent>
                </Card>
            )}
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
      <NewTreatmentPlanModal
        isOpen={isNewPlanModalOpen}
        onOpenChange={setIsNewPlanModalOpen}
        onSubmit={handleNewTreatmentPlan}
      />
      <UpdateTreatmentModal 
        isOpen={isUpdateTreatmentModalOpen}
        onOpenChange={setIsUpdateTreatmentModalOpen}
        onSubmit={handleUpdateTreatment}
        treatmentToEdit={treatmentToEdit}
      />
      {activeTreatmentPlan && (
        <SessionHistoryModal 
            isOpen={isHistoryModalOpen}
            onOpenChange={setIsHistoryModalOpen}
            sessions={patientSessions}
            setSessionToEdit={setSessionToEdit}
            setSessionToView={setSessionToView}
            getTherapistName={getTherapistName}
            planName={activeTreatmentPlan.name}
        />
      )}
       {sessionToEnd && patient && (
        <EndSessionForm
          session={sessionToEnd}
          patient={patient}
          isOpen={!!sessionToEnd}
          onOpenChange={(isOpen) => !isOpen && setSessionToEnd(null)}
          onSubmit={handleEndSessionSubmit}
        />
      )}
    </>
  );
}

const SessionList = ({
  sessions,
  isCompletedList = false,
  setSessionToEdit,
  setSessionToView,
  getTherapistName,
}: {
  sessions: Session[];
  isCompletedList?: boolean;
  setSessionToEdit?: (s: Session) => void;
  setSessionToView?: (s: Session) => void;
  getTherapistName: (id: string) => string;
}) => {
  if (sessions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <CalendarIcon className="mx-auto h-12 w-12" />
        <p className="mt-4">No sessions found.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {sessions.map((session) => (
        <div
          key={session.id}
          className={cn(
            "p-3 bg-muted/30 rounded-lg w-full flex items-center justify-between text-left",
            isCompletedList
              ? "cursor-pointer hover:bg-muted/60 transition-colors"
              : ""
          )}
          onClick={() => {
            if (isCompletedList && setSessionToView) setSessionToView(session);
          }}
        >
          <div className="flex-1">
            <p className="font-semibold">
              {format(new Date(session.date), "EEE, MMM d, yyyy")} &middot;{" "}
              {format(parse(session.startTime, "HH:mm", new Date()), "h:mm a")}
            </p>
            <p className="text-sm text-muted-foreground">
              with {getTherapistName(session.therapistId)}
            </p>
          </div>
          <Badge variant="outline" className="capitalize mx-4">
            {session.status}
          </Badge>
          {!isCompletedList &&
            session.status !== "completed" &&
            setSessionToEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSessionToEdit(session);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
        </div>
      ))}
    </div>
  );
};
