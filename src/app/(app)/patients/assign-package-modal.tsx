
"use client"

import { useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Patient, PackageDef, PackageSale, Session, Therapist } from "@/types/domain";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { LS_KEYS } from "@/lib/constants";
import { generateId } from "@/lib/ids";
import { addDays, format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { usePatients } from "@/hooks/use-patients";

interface AssignPackageModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    patient: Patient;
}

export function AssignPackageModal({ isOpen, onOpenChange, patient }: AssignPackageModalProps) {
    const { user } = useAuth();
    const { updatePatient } = usePatients();
    const { toast } = useToast();
    const [packages] = useLocalStorage<PackageDef[]>(LS_KEYS.PACKAGES, []);
    const [packageSales, setPackageSales] = useLocalStorage<PackageSale[]>(LS_KEYS.PACKAGE_SALES, []);
    const [sessions, setSessions] = useLocalStorage<Session[]>(LS_KEYS.SESSIONS, []);
    const [therapists] = useLocalStorage<Therapist[]>(LS_KEYS.THERAPISTS, []);

    const [selectedPackageId, setSelectedPackageId] = useState<string>("");

    const availablePackages = packages.filter(p => p.centreId === user?.centreId);

    const handleConfirm = () => {
        const selectedPackage = availablePackages.find(p => p.id === selectedPackageId);

        if (!selectedPackage || !user) {
            toast({ variant: "destructive", title: "Please select a package." });
            return;
        }

        if (patient.packageSaleId) {
             const existingSale = packageSales.find(s => s.id === patient.packageSaleId);
             if (existingSale && existingSale.status === 'active') {
                toast({ variant: "destructive", title: "Patient already has an active package." });
                return;
             }
        }
        
        const newSale: PackageSale = {
          id: generateId(),
          patientId: patient.id,
          packageId: selectedPackage.id,
          centreId: user.centreId,
          startDate: new Date().toISOString(),
          expiryDate: addDays(new Date(), selectedPackage.durationDays).toISOString(),
          sessionsTotal: selectedPackage.sessions,
          sessionsUsed: 0,
          status: "active",
        };

        // Automatic session scheduling
        const newSessions: Session[] = [];
        const availableTherapists = therapists.filter(t => t.centreId === user.centreId);
        if (availableTherapists.length === 0) {
            toast({ variant: "destructive", title: "No therapists available to schedule sessions." });
            return;
        }
        
        let currentDate = new Date();
        for (let i = 0; i < selectedPackage.sessions; i++) {
            // Simple logic: assign to the first available therapist
            const assignedTherapist = availableTherapists[0];

            const newSession: Session = {
                id: generateId(),
                patientId: patient.id,
                therapistId: assignedTherapist.id,
                centreId: user.centreId,
                date: format(currentDate, "yyyy-MM-dd"),
                startTime: "10:00", // Default start time
                endTime: "11:00", // Default end time
                status: 'scheduled',
                paymentStatus: 'unpaid',
                packageSaleId: newSale.id,
                createdAt: new Date().toISOString(),
            };
            newSessions.push(newSession);
            currentDate = addDays(currentDate, 1); // Schedule next session for the next day
        }

        setSessions([...sessions, ...newSessions]);
        setPackageSales([...packageSales, newSale]);
        updatePatient(patient.id, { packageSaleId: newSale.id });

        toast({ title: "Package Assigned", description: `${selectedPackage.name} assigned to ${patient.name} and ${newSessions.length} sessions scheduled.` });
        onOpenChange(false);
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Assign Package to {patient.name}</AlertDialogTitle>
                <AlertDialogDescription>
                    Select a package from the list to assign to this patient. This will automatically schedule their sessions.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Label htmlFor="package-select">Package</Label>
                   <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                        <SelectTrigger id="package-select">
                            <SelectValue placeholder="Select a package" />
                        </SelectTrigger>
                        <SelectContent>
                            {availablePackages.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.name} - ${p.price}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm} disabled={!selectedPackageId}>
                        Assign & Schedule
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
