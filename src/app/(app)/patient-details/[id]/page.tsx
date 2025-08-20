
'use client';

import { useLocalStorage } from '@/hooks/use-local-storage';
import { LS_KEYS } from '@/lib/constants';
import type { Patient, Session, Therapist } from '@/types/domain';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, isFuture, parseISO } from 'date-fns';
import { Mail, Phone, User, Calendar as CalendarIcon, ChevronDown, ChevronRight, Stethoscope, StickyNote, ArrowLeft } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useMemo, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useParams, useRouter } from 'next/navigation';
import { usePatients } from '@/hooks/use-patients';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { getPatient } = usePatients();
  const patientId = params.id as string;
  const patient = getPatient(patientId);

  const [sessions] = useLocalStorage<Session[]>(LS_KEYS.SESSIONS, []);
  const [therapists] = useLocalStorage<Therapist[]>(LS_KEYS.THERAPISTS, []);
  const [openCollapsibles, setOpenCollapsibles] = useState<Record<string, boolean>>({});

  const patientSessions = useMemo(() => {
    const now = new Date();
    return sessions
      .filter(s => s.patientId === patient?.id)
      .sort((a, b) => {
        const dateA = parseISO(`${a.date}T${a.startTime}`);
        const dateB = parseISO(`${b.date}T${b.startTime}`);
        const aIsFuture = isFuture(dateA);
        const bIsFuture = isFuture(dateB);

        if (aIsFuture && !bIsFuture) return -1; // Future dates first
        if (!aIsFuture && bIsFuture) return 1;

        if (aIsFuture && bIsFuture) {
          return dateA.getTime() - dateB.getTime(); // Sort upcoming dates chronologically
        }

        // Both are in the past, sort by most recent
        return dateB.getTime() - dateA.getTime();
      });
  }, [sessions, patient]);


  if (!patient) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl font-semibold mb-4">Patient not found</h2>
            <p className="text-muted-foreground mb-6">The patient you are looking for does not exist or could not be loaded.</p>
            <Button asChild>
                <Link href="/patients">
                    <ArrowLeft/>
                    Back to Patients
                </Link>
            </Button>
        </div>
    );
  }

  const getTherapistName = (therapistId: string) => {
    return therapists.find(t => t.id === therapistId)?.name || 'Unknown';
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const toggleCollapsible = (sessionId: string) => {
    setOpenCollapsibles(prev => ({...prev, [sessionId]: !prev[sessionId]}));
  }

  return (
    <div className="flex flex-col gap-8 h-full">
        <div className="flex items-center gap-4">
             <Button variant="outline" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
             </Button>
             <h1 className="text-3xl font-bold tracking-tight">Patient Details</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 min-h-0">
          {/* Left Column: Patient Info */}
          <div className="md:col-span-1 space-y-6">
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
                              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0"/> <span>{patient.email}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm">
                              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0"/> <span>{patient.phone}</span>
                          </div>
                          {patient.age && (
                              <div className="flex items-center gap-2 mt-1 text-sm">
                                  <User className="w-4 h-4 text-muted-foreground flex-shrink-0"/> <span>{patient.age} years old</span>
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
                            <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">{patient.medicalInfo}</p>
                        </div>
                    )}
                    {patient.notes && (
                        <div className="mt-4">
                            <h4 className="font-semibold mb-1 text-sm">Internal Notes</h4>
                            <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">{patient.notes}</p>
                        </div>
                    )}
                     {!patient.medicalInfo && !patient.notes && (
                         <p className="text-sm text-muted-foreground">No additional information provided.</p>
                     )}
                </CardContent>
             </Card>
          </div>

          {/* Right Column: Session History */}
          <div className="md:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Session History</CardTitle>
                 <CardDescription>A log of all past and upcoming appointments for {patient.name}.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <ScrollArea className="flex-auto -mx-6 px-6">
                    <Table className="relative">
                    <TableHeader className="sticky top-0 bg-card z-10">
                        <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Therapist</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {patientSessions.length > 0 ? patientSessions.map((session) => (
                        <Collapsible asChild key={session.id} open={openCollapsibles[session.id] || false} onOpenChange={() => toggleCollapsible(session.id)}>
                            <>
                                <TableRow className="cursor-pointer">
                                    <TableCell className="w-12 px-4">
                                        <CollapsibleTrigger asChild>
                                            <button className="p-1">
                                                {openCollapsibles[session.id] ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
                                            </button>
                                        </CollapsibleTrigger>
                                    </TableCell>
                                    <TableCell>{format(new Date(session.date), 'yyyy-MM-dd')}</TableCell>
                                    <TableCell>{getTherapistName(session.therapistId)}</TableCell>
                                    <TableCell>
                                    <Badge variant="outline" className="capitalize">{session.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                    <Badge variant={session.paymentStatus === 'paid' ? 'default' : 'secondary'} className="capitalize">
                                        {session.paymentStatus}
                                    </Badge>
                                    </TableCell>
                                </TableRow>
                                <CollapsibleContent asChild>
                                    <tr className="bg-muted/50">
                                        <TableCell colSpan={5} className="p-0">
                                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="font-semibold flex items-center gap-2 mb-2"><Stethoscope className="w-4 h-4" /> Health Notes</h4>
                                                    <p className="text-sm text-muted-foreground p-3 bg-background rounded-md min-h-[5rem]">{session.healthNotes || 'No health notes for this session.'}</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold flex items-center gap-2 mb-2"><StickyNote className="w-4 h-4" /> Internal Notes</h4>
                                                    <p className="text-sm text-muted-foreground p-3 bg-background rounded-md min-h-[5rem]">{session.notes || 'No internal notes for this session.'}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </tr>
                                </CollapsibleContent>
                            </>
                        </Collapsible>
                        )) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-48">
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <CalendarIcon className="w-12 h-12 mb-2" />
                                <p>No session history found for this patient.</p>
                            </div>
                            </TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                    </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
}
