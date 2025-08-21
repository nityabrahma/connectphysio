
'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Package, Clock } from 'lucide-react';
import type { Patient, Session } from '@/types/domain';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { LS_KEYS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';
import { isSameDay, format } from 'date-fns';
import { usePatients } from '@/hooks/use-patients';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const TodaysAppointmentsList = () => {
    const { user } = useAuth();
    const [sessions] = useLocalStorage<Session[]>(LS_KEYS.SESSIONS, []);
    const { patients } = usePatients();
    const [therapists] = useLocalStorage<any[]>(LS_KEYS.THERAPISTS, []);

    const todaysSessions = useMemo(() => {
        let filtered = sessions.filter(s => isSameDay(new Date(s.date), new Date()) && s.centreId === user?.centreId);
        if (user?.role === 'therapist') {
            filtered = filtered.filter(s => s.therapistId === user.therapistId);
        }
        return filtered.sort((a,b) => a.startTime.localeCompare(b.startTime));
    }, [sessions, user]);

    const groupedSessions = useMemo(() => {
      return todaysSessions.reduce<Record<string, Session[]>>((acc, session) => {
        if (!acc[session.patientId]) {
          acc[session.patientId] = [];
        }
        acc[session.patientId].push(session);
        return acc;
      }, {});
    }, [todaysSessions]);

    const getPatient = (patientId: string) => patients.find(p => p.id === patientId);
    const getTherapistName = (therapistId: string) => therapists.find(t => t.id === therapistId)?.name || 'Unknown';
    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

    if (todaysSessions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                <Calendar className="h-12 w-12 mb-4" />
                <p className="font-semibold">No appointments scheduled for today.</p>
                <p className="text-sm">Enjoy the quiet day!</p>
            </div>
        )
    }

    return (
        <ScrollArea className="h-full w-full px-6">
            <Accordion type="single" collapsible className="w-full space-y-4 pt-4">
              {Object.entries(groupedSessions).map(([patientId, patientSessions]) => {
              const patient = getPatient(patientId);
              if (!patient) return null;

              return (
                  <AccordionItem value={patientId} key={patientId} className="border-none">
                      <AccordionTrigger className="flex items-center gap-3 w-full text-left p-3 bg-muted/30 rounded-lg hover:no-underline">
                          <Avatar>
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {getInitials(patient.name)}
                              </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                              <p className="font-semibold">{patient.name}</p>
                              <p className="text-sm text-muted-foreground">{patientSessions.length} appointment(s) today</p>
                          </div>
                      </AccordionTrigger>
                      <AccordionContent>
                          <ul className="space-y-2 pt-2 pl-4 border-l ml-5">
                              {patientSessions.map(session => (
                                  <li key={session.id} className="p-4 bg-muted/50 rounded-lg flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                                      <div className="flex-1">
                                          <p className="font-semibold">{session.startTime} - {session.endTime}</p>
                                          <p className="text-sm text-muted-foreground">with {getTherapistName(session.therapistId)}</p>
                                          <div className="flex gap-2 mt-2 flex-wrap">
                                              <Badge variant={session.paymentStatus === 'paid' ? 'default' : 'secondary'} className="capitalize">{session.paymentStatus}</Badge>
                                              <Badge variant="outline" className="capitalize">{session.status}</Badge>
                                          </div>
                                      </div>
                                  </li>
                              ))}
                          </ul>
                      </AccordionContent>
                  </AccordionItem>
              );
              })}
            </Accordion>
        </ScrollArea>
    )
}

const AdminDashboard = () => {
    const { user } = useAuth();
    const [sessions] = useLocalStorage<Session[]>(LS_KEYS.SESSIONS, []);
    const [packageSales] = useLocalStorage<any[]>(LS_KEYS.PACKAGE_SALES, []);
    const { patients } = usePatients();

    const centrePackageSales = useMemo(() => packageSales.filter(p => p.centreId === user?.centreId), [packageSales, user]);
    const centrePatients = useMemo(() => patients.filter(p => p.centreId === user?.centreId), [patients, user]);
     const centreSessions = useMemo(() => sessions.filter(s => s.centreId === user?.centreId), [sessions, user]);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 overflow-auto h-full">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{centrePatients.length}</div>
                    <p className="text-xs text-muted-foreground">Total patients in centre</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Packages Sold</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{centrePackageSales.length}</div>
                    <p className="text-xs text-muted-foreground">Total packages sold</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{centreSessions.length}</div>
                    <p className="text-xs text-muted-foreground">All scheduled sessions</p>
                </CardContent>
            </Card>
        </div>
    );
};


const ReceptionistDashboard = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useLocalStorage<Session[]>(LS_KEYS.SESSIONS, []);
  
  const centreSessions = useMemo(() => {
    return sessions.filter(s => s.centreId === user?.centreId);
  }, [sessions, user]);

  const todaysSessions = useMemo(() => {
    return centreSessions.filter(s => isSameDay(new Date(s.date), new Date()));
  }, [centreSessions]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{todaysSessions.length}</div>
            <p className="text-xs text-muted-foreground">scheduled for today</p>
        </CardContent>
        </Card>
        <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Check-ins</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{todaysSessions.filter(s => s.status === 'scheduled').length}</div>
            <p className="text-xs text-muted-foreground">for upcoming sessions</p>
        </CardContent>
        </Card>
        <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{todaysSessions.filter(s => s.status === 'completed').length}</div>
            <p className="text-xs text-muted-foreground">sessions finished</p>
        </CardContent>
        </Card>
    </div>
  );
}

const TherapistDashboard = () => {
    const { user } = useAuth();
    const [sessions] = useLocalStorage<Session[]>(LS_KEYS.SESSIONS, []);
    const { patients } = usePatients();

    const therapistSessions = useMemo(() => {
        if (!user || !user.therapistId) return [];
        return sessions.filter(s => s.therapistId === user.therapistId);
    }, [sessions, user]);

    const todaysSessions = useMemo(() => {
        return therapistSessions.filter(s => isSameDay(new Date(s.date), new Date()));
    }, [therapistSessions]);
    
    const therapistPatients = useMemo(() => {
      const patientIds = new Set(therapistSessions.map(s => s.patientId));
      return patients.filter(p => patientIds.has(p.id));
    }, [therapistSessions, patients]);
    
    const nextAppointment = useMemo(() => {
        const now = new Date();
        return todaysSessions
            .filter(s => s.startTime > format(now, "HH:mm") && s.status === 'scheduled')
            .sort((a,b) => a.startTime.localeCompare(b.startTime))[0];
    }, [todaysSessions]);

    const getPatientName = (patientId: string) => patients.find(p => p.id === patientId)?.name || '...';


    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Your Appointments Today</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{todaysSessions.length}</div>
                    <p className="text-xs text-muted-foreground">
                        {todaysSessions.filter(s=> s.status === 'completed').length} completed, {todaysSessions.filter(s=> s.status !== 'completed').length} upcoming
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Your Patients</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{therapistPatients.length}</div>
                    <p className="text-xs text-muted-foreground">active this month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{nextAppointment?.startTime || 'None'}</div>
                    <p className="text-xs text-muted-foreground">
                        {nextAppointment ? `with ${getPatientName(nextAppointment.patientId)}` : 'No more appointments today'}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default function DashboardPage() {
  const { user } = useAuth();
  
  const renderDashboardContent = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'receptionist':
        return <ReceptionistDashboard />;
      case 'therapist':
        return <TherapistDashboard />;
      default:
        return <p>No dashboard view available for your role.</p>;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Here's a quick overview of your day.</p>
      </div>
      
      {renderDashboardContent()}

      <Card className="flex-1 flex flex-col min-h-0">
          <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-0">
              <TodaysAppointmentsList/>
          </CardContent>
      </Card>
    </div>
  );
}
