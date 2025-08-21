
"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { LS_KEYS } from "@/lib/constants";
import type { Patient, Session, Therapist } from "@/types/domain";
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
import { format, isFuture, parseISO } from "date-fns";
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
import { PatientForm } from "../../patients/patient-form";


export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { getPatient, deletePatient, updatePatient } = usePatients();
  const patientId = params.id as string;
  const patient = getPatient(patientId);

  const [sessions, setSessions] = useLocalStorage<Session[]>(
    LS_KEYS.SESSIONS,
    []
  );
  const [therapists] = useLocalStorage<Therapist[]>(LS_KEYS.THERAPISTS, []);

  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  
  const handleNewAppointmentClick = () => {
    router.push(`/appointments/new?patientId=${patientId}`);
  };
  
  const handlePatientFormSubmit = (values: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (patient) {
        updatePatient(patient.id, values);
    }
    setIsPatientFormOpen(false);
  };

  const handleDeletePatient = () => {
    if(patient) {
        deletePatient(patient.id);
        router.push('/patients');
    }
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

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
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
        <div className="md:col-span-2 flex flex-col min-h-full">
           <Card className="flex flex-col min-h-full">
            <CardHeader>
                <CardTitle>Coming soon</CardTitle>
                <CardDescription>
                Session history will be displayed here in a future update.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                    <CalendarIcon className="mx-auto h-12 w-12" />
                    <p className="mt-4">Session history is under construction.</p>
                </div>
            </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
