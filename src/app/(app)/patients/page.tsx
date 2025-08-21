
'use client';

import { usePatients } from "@/hooks/use-patients";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { PatientForm } from "./patient-form";
import type { Patient } from "@/types/domain";
import { useAuth } from "@/hooks/use-auth";
import { AssignPackageModal } from "./assign-package-modal";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientCard } from "./patient-card";

export default function PatientsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { patients, addPatient, updatePatient, deletePatient } = usePatients();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>(undefined);
    const [currentPage, setCurrentPage] = useState(1);
    const PATIENTS_PER_PAGE = 10;

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

    const paginatedPatients = useMemo(() => {
        const startIndex = (currentPage - 1) * PATIENTS_PER_PAGE;
        const endIndex = startIndex + PATIENTS_PER_PAGE;
        return patients.slice(startIndex, endIndex);
    }, [patients, currentPage]);

    const totalPages = Math.ceil(patients.length / PATIENTS_PER_PAGE);
    const canGoNext = currentPage < totalPages;
    const canGoPrev = currentPage > 1;

    return (
        <div className="flex flex-col gap-8 h-full">
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
                 <CardHeader className="border-b">
                    <div className="grid grid-cols-4 gap-4 px-4 font-semibold text-sm text-muted-foreground">
                        <div className="col-span-2">Name</div>
                        <div>Package Status</div>
                        <div className="text-right">Actions</div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 p-2 md:p-4 overflow-y-auto">
                    {paginatedPatients.length > 0 ? (
                        <div className="space-y-2">
                             {paginatedPatients.map(patient => (
                                <PatientCard 
                                    key={patient.id}
                                    patient={patient}
                                    onView={handleViewPatient}
                                    onEdit={handleEditPatient}
                                    onAssignPackage={handleAssignPackage}
                                    onDelete={handleDeletePatient}
                                    canManage={canManagePatients}
                                />
                            ))}
                        </div>
                    ) : (
                         <div className="flex items-center justify-center h-full text-muted-foreground">
                            No patients found.
                        </div>
                    )}
                </CardContent>
                <CardFooter className="py-4 border-t">
                    <div className="flex items-center justify-end space-x-2 w-full">
                         <div className="flex-1 text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            disabled={!canGoPrev}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={!canGoNext}
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
