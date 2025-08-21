
'use client';

import { usePatients } from "@/hooks/use-patients";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Patient } from "@/types/domain";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientCard } from "./patient-card";
import { Input } from "@/components/ui/input";

export default function PatientsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { patients, deletePatient } = usePatients();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const PATIENTS_PER_PAGE = 10;

    const isSelecting = searchParams.get('select') === 'true';

    const handleAddPatient = () => {
        const query = isSelecting ? '?redirectToAppointment=true' : '';
        router.push(`/patients/new${query}`);
    };

    const handleEditPatient = (patient: Patient) => {
        router.push(`/patients/edit/${patient.id}`);
    };

    const handleDeletePatient = (patientId: string) => {
        deletePatient(patientId);
    };

    const handleAssignPackage = (patient: Patient) => {
        router.push(`/assign-package/${patient.id}`);
    };
    
    const handleNewAppointment = (patient: Patient) => {
      router.push(`/appointments/new?patientId=${patient.id}`);
    };

    const handleViewPatient = (patient: Patient) => {
        if (isSelecting) {
            router.push(`/appointments/new?patientId=${patient.id}`);
        } else {
            router.push(`/patient-details/${patient.id}`);
        }
    };

    const canManagePatients = user?.role === 'admin' || user?.role === 'receptionist';

    const filteredPatients = useMemo(() => {
        return patients.filter(patient =>
            patient.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [patients, searchTerm]);

    const paginatedPatients = useMemo(() => {
        const startIndex = (currentPage - 1) * PATIENTS_PER_PAGE;
        const endIndex = startIndex + PATIENTS_PER_PAGE;
        return filteredPatients.slice(startIndex, endIndex);
    }, [filteredPatients, currentPage]);

    const totalPages = Math.ceil(filteredPatients.length / PATIENTS_PER_PAGE);
    const canGoNext = currentPage < totalPages;
    const canGoPrev = currentPage > 1;

    return (
        <div className="flex flex-col gap-8 h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{isSelecting ? 'Select a Patient' : 'Patients'}</h1>
                    <p className="text-muted-foreground">
                        {isSelecting ? 'Choose a patient to create a walk-in appointment for.' : 'Manage all patient records for your centre.'}
                    </p>
                </div>
                {canManagePatients && (
                    <Button onClick={handleAddPatient}>
                        <PlusCircle />
                        Add New Patient
                    </Button>
                )}
            </div>

            <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <CardHeader className="border-b shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by name..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 p-2 md:p-4 overflow-y-auto">
                    {paginatedPatients.length > 0 ? (
                        <div className="space-y-2">
                            {paginatedPatients.map(patient => (
                                <PatientCard
                                    key={patient.id}
                                    patient={patient}
                                    onView={handleViewPatient}
                                    onEdit={handleEditPatient}
                                    onAssignPackage={handleAssignPackage}
                                    onNewAppointment={handleNewAppointment}
                                    onDelete={handleDeletePatient}
                                    canManage={canManagePatients}
                                    isSelecting={isSelecting}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p>No patients found{searchTerm ? ' for your search' : ''}.</p>
                        </div>
                    )}
                </CardContent>
                
                {totalPages > 1 && (
                    <CardFooter className="py-4 border-t shrink-0">
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
                )}
            </Card>
        </div>
    );
}

    