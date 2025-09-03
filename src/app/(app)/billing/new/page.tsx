
'use client';

import { useState } from 'react';
import type { Patient, Session } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User, Calendar as CalendarIcon, Mail, Phone } from 'lucide-react';
import { SelectPatientDialog } from './select-patient-dialog';
import { SelectSessionDialog } from './select-session-dialog';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { ManualSessionDialog, type ManualSessionFormValues } from './manual-session-dialog';

type DisplaySession = {
    date: string | Date;
    startTime: string;
    endTime: string;
    status: Session['status'] | 'manual';
}

export default function NewBillPage() {
  const router = useRouter();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [displaySession, setDisplaySession] = useState<DisplaySession | null>(null);

  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [isManualSessionDialogOpen, setIsManualSessionDialogOpen] = useState(false);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setDisplaySession(null); // Reset session when patient changes
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

        <Card>
          <CardHeader>
            <CardTitle>Billing Details</CardTitle>
            <CardDescription>Start by selecting a patient and then a session, or enter session details manually.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Patient Selection */}
              <div className="space-y-2">
                <Label>Patient</Label>
                <Button variant="outline" className="w-full justify-start text-left h-auto" onClick={() => setIsPatientDialogOpen(true)}>
                  {selectedPatient ? (
                    <div className="p-2">
                      <p className="font-semibold">{selectedPatient.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedPatient.email}</p>
                    </div>
                  ) : (
                    <span className="p-2 text-muted-foreground">Click to select a patient</span>
                  )}
                </Button>
              </div>

              {/* Session Selection / Manual Entry */}
              <div className="space-y-2">
                <Label>Session</Label>
                {displaySession ? (
                     <div className="p-2 border rounded-md text-sm">
                      <p className="font-semibold">Session on {format(new Date(displaySession.date), "PPP")}</p>
                      <p className="text-muted-foreground">{displaySession.startTime} - {displaySession.endTime}</p>
                      <div className="flex gap-2 mt-2">
                         <Button variant="outline" size="sm" onClick={() => setIsSessionDialogOpen(true)} disabled={!selectedPatient}>Change Session</Button>
                         <Button variant="outline" size="sm" onClick={() => setDisplaySession(null)}>Clear</Button>
                      </div>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="outline" className="w-full" onClick={() => setIsSessionDialogOpen(true)} disabled={!selectedPatient}>
                            Select Session
                        </Button>
                         <Button variant="outline" className="w-full" onClick={() => setIsManualSessionDialogOpen(true)} disabled={!selectedPatient}>
                            Enter Manually
                        </Button>
                    </div>
                )}
              </div>
            </div>

            {selectedPatient && displaySession && (
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Selected Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base"><User /> Patient Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {selectedPatient.name}</p>
                      <p className="flex items-center gap-2"><strong><Mail size={14}/></strong> {selectedPatient.email}</p>
                      <p className="flex items-center gap-2"><strong><Phone size={14}/></strong> {selectedPatient.phone}</p>
                    </CardContent>
                  </Card>
                   <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base"><CalendarIcon /> Session Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p><strong>Date:</strong> {format(new Date(displaySession.date), "MMMM d, yyyy")}</p>
                      <p><strong>Time:</strong> {displaySession.startTime} - {displaySession.endTime}</p>
                       <p><strong>Status:</strong> <span className="capitalize">{displaySession.status}</span></p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            
          </CardContent>
        </Card>
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
