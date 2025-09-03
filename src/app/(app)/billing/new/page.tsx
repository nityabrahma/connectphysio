
'use client';

import { useState, useMemo } from 'react';
import type { Patient, Session, TreatmentDef, PackageSale, PackageDef, Bill } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, User, Calendar as CalendarIcon, Pencil } from 'lucide-react';
import { SelectPatientDialog } from './select-patient-dialog';
import { SelectSessionDialog } from './select-session-dialog';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { ManualSessionDialog, type ManualSessionFormValues } from './manual-session-dialog';
import { useRealtimeDb } from '@/hooks/use-realtime-db';
import { TreatmentSelector, type BillableTreatment } from './treatment-selector';
import { useAuth } from '@/hooks/use-auth';
import { useBills } from '@/hooks/use-bills';

type DisplaySession = {
    date: string | Date;
    startTime: string;
    endTime: string;
    status: Session['status'] | 'manual';
}

export default function NewBillPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addBill } = useBills();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [displaySession, setDisplaySession] = useState<DisplaySession | null>(null);
  const [selectedTreatments, setSelectedTreatments] = useState<BillableTreatment[]>([]);

  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [isManualSessionDialogOpen, setIsManualSessionDialogOpen] = useState(false);

  const [treatmentDefs] = useRealtimeDb<Record<string, TreatmentDef>>('treatmentDefs', {});
  const [packages] = useRealtimeDb<Record<string, PackageDef>>('packages', {});

  const availableTreatments = useMemo(() => 
    Object.values(treatmentDefs).filter(t => t.centreId === user?.centreId), 
  [treatmentDefs, user]);

  const availablePackages = useMemo(() =>
    Object.values(packages).filter(p => p.centreId === user?.centreId),
  [packages, user]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setDisplaySession(null); 
    setSelectedTreatments([]);
    setIsPatientDialogOpen(false);
  };

  const handleSessionSelect = (session: Session) => {
    setDisplaySession({
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
    });
    setIsSessionDialogOpen(false);
  };

  const handleManualSessionSubmit = (values: ManualSessionFormValues) => {
    setDisplaySession({
      date: values.date,
      startTime: values.startTime,
      endTime: values.endTime,
      status: 'manual',
    });
    setIsManualSessionDialogOpen(false);
  }

  const resetPatient = () => {
    setSelectedPatient(null);
    setDisplaySession(null);
    setSelectedTreatments([]);
  }

  const resetSession = () => {
    setDisplaySession(null);
    setSelectedTreatments([]);
  }

  const handleGenerateBill = (billData: Omit<Bill, 'id' | 'billNumber' | 'patientId' | 'centreId' | 'createdAt' | 'sessionDate'>) => {
    if (!selectedPatient || !user || !displaySession) return;
    
    addBill({
      ...billData,
      patientId: selectedPatient.id,
      centreId: user.centreId,
      sessionDate: format(new Date(displaySession.date), 'yyyy-MM-dd'),
    });
    
    router.push('/billing');
  }

  return (
    <>
      <div className="flex flex-col gap-8 h-full">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Bill</h1>
            <p className="text-muted-foreground">Select a patient and session to generate a bill.</p>
          </div>
        </div>

        <div className="space-y-6">
            {/* Step 1: Patient Selection */}
            {!selectedPatient && (
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Step 1: Select a Patient</h3>
                            <p className="text-muted-foreground mb-4">Start by choosing a patient to bill.</p>
                            <Button onClick={() => setIsPatientDialogOpen(true)}>
                                <User className="mr-2 h-4 w-4" /> Select Patient
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
            
            {/* Step 2 & 3: Show Patient Info and then Session Info */}
            {selectedPatient && (
                <Card>
                    <CardContent className="p-6 space-y-6">
                        {/* Patient Info Display */}
                        <div className="p-4 border rounded-lg bg-muted/50">
                             <div className="flex items-start justify-between">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Patient</Label>
                                    <p className="font-semibold text-lg">{selectedPatient.name}</p>
                                    <div className="text-sm text-muted-foreground mt-2 space-y-1">
                                      <p>{selectedPatient.email}</p>
                                      <p className="capitalize">
                                        {selectedPatient.age && `${selectedPatient.age} years`}
                                        {selectedPatient.age && selectedPatient.gender && " · "}
                                        {selectedPatient.gender}
                                      </p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={resetPatient}>
                                    <Pencil className="mr-2 h-4 w-4"/>
                                    Change Patient
                                </Button>
                            </div>
                        </div>

                        {/* Step 2: Session Selection */}
                        {!displaySession && (
                            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">Step 2: Choose Session</h3>
                                <p className="text-muted-foreground mb-4">Select a past session or enter one manually.</p>
                                <div className="flex gap-4">
                                    <Button onClick={() => setIsSessionDialogOpen(true)}>
                                        <CalendarIcon className="mr-2 h-4 w-4" /> Select from History
                                    </Button>
                                    <Button variant="secondary" onClick={() => setIsManualSessionDialogOpen(true)}>
                                        select date/time
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Session Info Display */}
                        {displaySession && (
                            <div className="p-4 border rounded-lg bg-muted/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Session</Label>
                                        <p className="font-semibold">
                                            {format(new Date(displaySession.date), "PPP")}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {displaySession.startTime} - {displaySession.endTime}
                                            <span className="capitalize ml-2 text-xs p-1 bg-background rounded-md">{displaySession.status}</span>
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={resetSession}>
                                        <Pencil className="mr-2 h-4 w-4"/>
                                        Change Session
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {selectedPatient && displaySession && (
                 <TreatmentSelector 
                    availableTreatments={availableTreatments}
                    selectedTreatments={selectedTreatments}
                    onSelectTreatments={setSelectedTreatments}
                    availablePackages={availablePackages}
                    onGenerateBill={handleGenerateBill}
                />
            )}
        </div>
      </div>

      <SelectPatientDialog
        isOpen={isPatientDialogOpen}
        onOpenChange={setIsPatientDialogOpen}
        onSelect={handlePatientSelect}
      />

      {selectedPatient && (
        <>
            <SelectSessionDialog
            isOpen={isSessionDialogOpen}
            onOpenChange={setIsSessionDialogOpen}
            onSelect={handleSessionSelect}
            patient={selectedPatient}
            />
            <ManualSessionDialog
                isOpen={isManualSessionDialogOpen}
                onOpenChange={setIsManualSessionDialogOpen}
                onSubmit={handleManualSessionSubmit}
            />
        </>
      )}
    </>
  );
}
