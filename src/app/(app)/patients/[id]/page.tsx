
'use client';

import { usePatients } from '@/hooks/use-patients';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { LS_KEYS } from '@/lib/constants';
import type { Session, Therapist } from '@/types/domain';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Mail, Phone, User, Calendar as CalendarIcon } from 'lucide-react';

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.id as string;
  
  const { getPatient } = usePatients();
  const [sessions] = useLocalStorage<Session[]>(LS_KEYS.SESSIONS, []);
  const [therapists] = useLocalStorage<Therapist[]>(LS_KEYS.THERAPISTS, []);

  const patient = getPatient(patientId);
  const patientSessions = sessions
    .filter(s => s.patientId === patientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getTherapistName = (therapistId: string) => {
    return therapists.find(t => t.id === therapistId)?.name || 'Unknown';
  }

  if (!patient) {
    return <div>Patient not found.</div>;
  }
  
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="flex flex-col gap-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Patient Details</h1>
        <p className="text-muted-foreground">Session history and information for {patient.name}.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
            <Avatar className="w-16 h-16 text-xl">
                <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(patient.name)}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1">
                 <CardTitle className="text-2xl">{patient.name}</CardTitle>
                 <CardDescription>
                    <div className="flex items-center gap-2 mt-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground"/> <span>{patient.email}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground"/> <span>{patient.phone}</span>
                    </div>
                    {patient.age && (
                        <div className="flex items-center gap-2 mt-1 text-sm">
                            <User className="w-4 h-4 text-muted-foreground"/> <span>{patient.age} years old</span>
                        </div>
                    )}
                 </CardDescription>
            </div>
        </CardHeader>
        <CardContent>
            {patient.medicalInfo && (
                <div>
                    <h4 className="font-semibold mb-1">Medical Info</h4>
                    <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">{patient.medicalInfo}</p>
                </div>
            )}
             {patient.notes && (
                <div className="mt-4">
                    <h4 className="font-semibold mb-1">Internal Notes</h4>
                    <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">{patient.notes}</p>
                </div>
            )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Session History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Therapist</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patientSessions.length > 0 ? patientSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>{format(new Date(session.date), 'yyyy-MM-dd')}</TableCell>
                  <TableCell>{session.startTime} - {session.endTime}</TableCell>
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
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <CalendarIcon className="w-12 h-12 mb-2" />
                        <p>No session history found for this patient.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
