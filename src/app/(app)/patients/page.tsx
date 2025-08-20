
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
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useReactTable, getCoreRowModel, getPaginationRowModel } from "@tanstack/react-table";


export default function PatientsPage() {
    const { user } = useAuth();
    const router = useRouter();
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

    const handleViewPatient = (patient: Patient) => {
        router.push(`/patient-details/${patient.id}`);
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
    
    const tableColumns = columns({ 
        onEdit: handleEditPatient, 
        onDelete: handleDeletePatient,
        onAssignPackage: handleAssignPackage,
        onView: handleViewPatient,
        canManage: canManagePatients,
    });

    const table = useReactTable({
        data: patients,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="flex flex-col gap-8 h-full overflow-hidden">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
                    <p className="text-muted-foreground">Manage all patient records for your centre.</p>
                </div>
                {canManagePatients && (
                    <Button onClick={handleAddPatient}>
                        <PlusCircle />
                        Add New Patient
                    </Button>
                )}
            </div>
            
            <Card className="flex-1 flex flex-col min-h-0">
                <CardContent className="flex-1 min-h-0 p-4 md:p-6 overflow-y-auto relative">
                    <DataTable 
                        columns={tableColumns} 
                        data={patients} 
                        table={table}
                    />
                </CardContent>
                <CardFooter className="py-4 border-t">
                    <div className="flex items-center justify-end space-x-2 w-full">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </CardFooter>
            </Card>

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
