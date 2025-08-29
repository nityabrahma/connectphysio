
"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { LS_KEYS } from "@/lib/constants";
import type {
  Patient,
  Session,
  Therapist,
  TreatmentPlan,
  Treatment,
  Centre,
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
import { format, isFuture, parseISO, isSameDay } from "date-fns";
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
  Printer,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useMemo, useState, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FormattedHealthNotes } from "@/components/formatted-health-notes";
import { useReactToPrint } from "react-to-print";
import { PrintableInvoice } from "@/components/printable-invoice";


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
        <ScrollArea className="flex-1 -mr-6 pr-6">
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
        </ScrollArea>
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

const EditClinicalNotesModal = ({
  plan,
  isOpen,
  onOpenChange,
  onUpdate,
}: {
  plan: TreatmentPlan | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (
    planId: string,
    updates: { history: string; examination: string }
  ) => void;
}) => {
  const [history, setHistory] = useState("");
  const [examination, setExamination] = useState("");

  useEffect(() => {
    if (plan) {
      setHistory(plan.history || "");
      setExamination(plan.examination || "");
    }
  }, [plan]);

  const handleSubmit = () => {
    if (plan) {
      onUpdate(plan.id, { history, examination });
    }
  };

  if (!plan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Clinical Notes</DialogTitle>
          <DialogDescription>
            Update notes for treatment plan: {plan.name}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="history">Current Problem / History</Label>
            <Textarea
              id="history"
              value={history}
              onChange={(e) => setHistory(e.target.value)}
              rows={5}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="examination">Examination</Label>
            <Textarea
              id="examination"
              value={examination}
              onChange={(e) => setExamination(e.target.value)}
              rows={5}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SessionHistoryModal = ({
    isOpen,
    onOpenChange,
    sessions,
    setSessionToEdit,
    setSessionToView,
    getTherapistName,
    planName,
    onPrintInvoice,
} : {
    isOpen: boolean,
    onOpenChange: (open: boolean) => void,
    sessions: Session[],
    setSessionToEdit: (s: Session) => void,
    setSessionToView: (s: Session) => void,
    getTherapistName: (id: string) => string,
    planName: string,
    onPrintInvoice: (session: Session) => void,
}) => {

    const upcomingSessions = useMemo(() => {
        return sessions.filter(
        (s) =>
            (s.status === "scheduled" || s.status === "checked-in") &&
            (isFuture(parseISO(s.date)) ||
            format(new Date(s.date), "yyyy-MM-dd") ===
                format(new Date(), "yyyy-MM-dd"))
        );
    }, [sessions]);

    const completedSessions = useMemo(() => {
        return sessions.filter((s) => s.status === "completed" || s.status === "paid");
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
                            <ScrollArea className="absolute inset-0 w-full h-full pr-4">
                            <TabsContent value="upcoming">
                                <SessionList
                                sessions={upcomingSessions}
                                setSessionToEdit={setSessionToEdit}
                                getTherapistName={getTherapistName}
                                onPrintInvoice={onPrintInvoice}
                                />
                            </TabsContent>
                            <TabsContent value="completed">
                                <SessionList
                                sessions={completedSessions}
                                isCompletedList
                                setSessionToView={setSessionToView}
                                getTherapistName={getTherapistName}
                                onPrintInvoice={onPrintInvoice}
                                />
                            </TabsContent>
                            </ScrollArea>
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
  const [centres, setCentres] = useLocalStorage<Centre[]>(LS_KEYS.CENTRES, []);
  const [treatmentPlans, setTreatmentPlans] = useLocalStorage<TreatmentPlan[]>(
    LS_KEYS.TREATMENT_PLANS,
    []
  );

  const [sessionToEdit, setSessionToEdit] = useState<Session | null>(null);
  const [sessionToView, setSessionToView] = useState<Session | null>(null);
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [isEditNotesModalOpen, setIsEditNotesModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const printRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const handlePrint = useReactToPrint({
    content: () => {
      const activeSessionId = Object.keys(printRefs.current).find(id => printRefs.current[id]);
      return activeSessionId ? printRefs.current[activeSessionId] : null;
    },
    onAfterPrint: () => {
      Object.keys(printRefs.current).forEach(id => printRefs.current[id] = null);
    }
  });


  const patientTreatmentPlans = useMemo(() => {
    return treatmentPlans
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
    if (!activeTreatmentPlan) return [];
    return [...activeTreatmentPlan.treatments].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activeTreatmentPlan]);

  const handleNewTreatmentPlan = (name: string) => {
    if (!patient) return;

    const updatedPlans = treatmentPlans.map((p) =>
      p.patientId === patientId ? { ...p, isActive: false } : p
    );

    const newPlan: TreatmentPlan = {
      id: generateId(),
      patientId: patient.id,
      name: name,
      createdAt: new Date().toISOString(),
      isActive: true,
      history: "Initial consultation.",
      examination: "Initial examination.",
      treatments: [
        {
          date: new Date().toISOString(),
          description: "Initial Treatment",
          charges: 0,
        },
      ],
    };

    setTreatmentPlans([...updatedPlans, newPlan]);
    setActiveTreatmentPlanId(newPlan.id);
    setIsNewPlanModalOpen(false);
    toast({ title: "New treatment plan started." });
  };

  const handleUpdateClinicalNotes = (
    planId: string,
    updates: { history: string; examination: string }
  ) => {
    setTreatmentPlans(
      treatmentPlans.map((plan) =>
        plan.id === planId ? { ...plan, ...updates } : plan
      )
    );
    setIsEditNotesModalOpen(false);
    toast({ title: "Clinical notes updated." });
  };

  const handlePrintInvoice = (session: Session) => {
    const currentCentre = centres.find(c => c.id === user?.centreId);
    if (!currentCentre) return;

    const invoiceCounter = (currentCentre.invoiceCounter || 0) + 1;
    setCentres(centres.map(c => c.id === currentCentre.id ? { ...c, invoiceCounter } : c));
    
    setSessions(sessions.map(s => s.id === session.id ? { ...s, status: 'paid', invoiceNumber: invoiceCounter } : s));
    
    printRefs.current = { [session.id]: printRefs.current[session.id] };
    handlePrint();

    toast({ title: "Session marked as paid" });
  };

  const patientSessions = useMemo(() => {
    if (!activeTreatmentPlanId) return [];
    return sessions
      .filter(
        (s) =>
          s.patientId === patientId &&
          s.treatmentPlanId === activeTreatmentPlanId
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sessions, patientId, activeTreatmentPlanId]);

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
    setSessions(
      sessions.map((s) => (s.id === updatedSession.id ? updatedSession : s))
    );
    toast({ title: "Session Updated" });
    setSessionToEdit(null);
  };

  const todaysCheckedInSession = useMemo(() => {
    return patientSessions.find(
      (s) =>
        s.status === "checked-in" && isSameDay(new Date(s.date), new Date())
    );
  }, [patientSessions]);

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
      therapists.find((t) => t.id === therapistId)?.name || "Unknown Therapist"
    );
  };

  return (
    <>
      <div className="flex flex-col gap-8 h-full overflow-hidden">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0 size-full">
          {/* Left Column: Patient Details & Medical History */}
          <div className="lg:col-span-1 flex flex-col min-h-0 space-y-6">
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
          </div>

          {/* Right Column: Clinical Notes & Treatment */}
          <div className="lg:col-span-2 flex flex-col min-h-0 space-y-6">
            <Card>
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle>Clinical Notes</CardTitle>
                  <CardDescription>
                    Notes specific to the selected treatment plan.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditNotesModalOpen(true)}
                  disabled={!activeTreatmentPlan}
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="history">
                  <TabsList>
                    <TabsTrigger value="history">Current Problem</TabsTrigger>
                    <TabsTrigger value="examination">Examination</TabsTrigger>
                  </TabsList>
                  <TabsContent value="history" className="pt-4 text-sm">
                    <p className="p-2 bg-muted/50 rounded-md mt-1 whitespace-pre-wrap">
                      {activeTreatmentPlan?.history || "No history provided for this plan."}
                    </p>
                  </TabsContent>
                  <TabsContent value="examination" className="pt-4 space-y-4 text-sm">
                    <p className="p-2 bg-muted/50 rounded-md mt-1 whitespace-pre-wrap">
                      {activeTreatmentPlan?.examination || "No examination notes for this plan."}
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            <Card className="flex flex-col min-h-full">
              <CardHeader>
                <CardTitle>Treatment</CardTitle>
                <CardDescription>
                  Plan: <span className="font-semibold">{activeTreatmentPlan?.name}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0 pt-4 space-y-4">
                 <ScrollArea className="flex-1 -mr-4 pr-4">
                    <div className="space-y-4">
                        {sortedTreatments.length > 0 ? sortedTreatments.map((treatment, index) => (
                             <Card key={treatment.date} className={cn(index > 0 && "opacity-60")}>
                                <CardHeader className="p-4">
                                    <CardTitle className="text-base">
                                        {format(new Date(treatment.date), "EEE, MMM d, yyyy")}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 text-sm">
                                    <p>{treatment.description}</p>
                                    <p className="font-semibold mt-2">Charges: ₹{treatment.charges}</p>
                                </CardContent>
                            </Card>
                        )) : (
                            <p className="text-sm text-muted-foreground text-center py-8">No treatments recorded for this plan.</p>
                        )}
                    </div>
                </ScrollArea>
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
      
      {patientSessions.map(session => (
        <div key={session.id} style={{ display: 'none' }}>
            <PrintableInvoice
                ref={el => (printRefs.current[session.id] = el)}
                session={session}
            />
        </div>
      ))}

      <NewTreatmentPlanModal
        isOpen={isNewPlanModalOpen}
        onOpenChange={setIsNewPlanModalOpen}
        onSubmit={handleNewTreatmentPlan}
      />
      <EditClinicalNotesModal
        plan={activeTreatmentPlan}
        isOpen={isEditNotesModalOpen}
        onOpenChange={setIsEditNotesModalOpen}
        onUpdate={handleUpdateClinicalNotes}
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
            onPrintInvoice={handlePrintInvoice}
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
  onPrintInvoice,
}: {
  sessions: Session[];
  isCompletedList?: boolean;
  setSessionToEdit?: (s: Session) => void;
  setSessionToView?: (s: Session) => void;
  getTherapistName: (id: string) => string;
  onPrintInvoice: (session: Session) => void;
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
              {session.startTime}
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
            {isCompletedList && session.status === "completed" && (
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onPrintInvoice(session); }}>
                    <Printer className="h-4 w-4" />
                </Button>
            )}
        </div>
      ))}
    </div>
  );
};
