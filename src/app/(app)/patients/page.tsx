
'use client';

import { usePatients } from "@/hooks/use-patients";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { PatientForm } from "./patient-form";
import type { Patient } from "@/types/domain";
import { useAuth } from "@/hooks/use-auth";
import { AssignPackageModal } from "./assign-package-modal";

export default function PatientsPage() {
    const { user } = useAuth();
    const { patients, addPatient, updatePatient, deletePatient } = usePatients();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>(undefined);

    const handleAddPatient = () => {
        setSelectedPatient(undefined);
        setIsFormOpen(true);
    };

    const handleEditPatient = (patient: Patient) => {
        setSelectedPatient(patient);
        setIsFormOpen(true);
    };

    const handleDeletePatient = (patientId: string) => {
        deletePatient(patientId);
    };

    const handleAssignPackage = (patient: Patient) => {
        setSelectedPatient(patient);
        setIsPackageModalOpen(true);
    };

    const handleFormSubmit = (values: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (selectedPatient) {
            updatePatient(selectedPatient.id, values);
        } else {
            addPatient(values);
        }
        setIsFormOpen(false);
    };
    
    const canManagePatients = user?.role === 'admin' || user?.role === 'receptionist';

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
                {canManagePatients && (
                    <Button onClick={handleAddPatient}>
                        <PlusCircle />
                        Add New Patient
                    </Button>
                )}
            </div>
            
            <DataTable 
                columns={columns({ 
                    onEdit: handleEditPatient, 
                    onDelete: handleDeletePatient,
                    onAssignPackage: handleAssignPackage,
                    canManage: canManagePatients,
                })} 
                data={patients} 
            />

            {canManagePatients && (
                 <PatientForm 
                    isOpen={isFormOpen}
                    onOpenChange={setIsFormOpen}
                    onSubmit={handleFormSubmit}
                    patient={selectedPatient}
                />
            )}

            {selectedPatient && canManagePatients && (
                <AssignPackageModal
                    isOpen={isPackageModalOpen}
                    onOpenChange={setIsPackageModalOpen}
                    patient={selectedPatient}
                />
            )}
        </div>
    );
}
