
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
import type { Patient, PackageDef, PackageSale } from "@/types/domain";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { LS_KEYS } from "@/lib/constants";
import { generateId } from "@/lib/ids";
import { addDays } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { usePatients } from "./use-patients";

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
    const [selectedPackageId, setSelectedPackageId] = useState<string>("");

    const availablePackages = packages.filter(p => p.centreId === user?.centreId);

    const handleConfirm = () => {
        const selectedPackage = availablePackages.find(p => p.id === selectedPackageId);

        if (!selectedPackage || !user) {
            toast({ variant: "destructive", title: "Please select a package." });
            return;
        }

        if (patient.packageSaleId) {
            toast({ variant: "destructive", title: "Patient already has an active package." });
            return;
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

        setPackageSales([...packageSales, newSale]);
        updatePatient(patient.id, { packageSaleId: newSale.id });

        toast({ title: "Package Assigned", description: `${selectedPackage.name} assigned to ${patient.name}.` });
        onOpenChange(false);
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Assign Package to {patient.name}</AlertDialogTitle>
                <AlertDialogDescription>
                    Select a package from the list to assign to this patient.
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
                        Assign Package
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

