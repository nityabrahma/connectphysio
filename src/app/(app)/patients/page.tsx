'use client';

import { usePatients } from "@/hooks/use-patients";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { PatientForm } from "./patient-form";
import type { Patient } from "@/types/domain";

export default function PatientsPage() {
    const { patients, addPatient, updatePatient, deletePatient } = usePatients();
    const [isFormOpen, setIsFormOpen] = useState(false);
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

    const handleFormSubmit = (values: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (selectedPatient) {
            updatePatient(selectedPatient.id, values);
        } else {
            addPatient(values);
        }
        setIsFormOpen(false);
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
                <Button onClick={handleAddPatient}>
                    <PlusCircle />
                    Add New Patient
                </Button>
            </div>
            
            <DataTable 
                columns={columns({ onEdit: handleEditPatient, onDelete: handleDeletePatient })} 
                data={patients} 
            />

            <PatientForm 
                isOpen={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSubmit={handleFormSubmit}
                patient={selectedPatient}
            />
        </div>
    );
}
