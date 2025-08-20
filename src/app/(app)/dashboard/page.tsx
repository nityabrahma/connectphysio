
'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Package, DollarSign, Clock } from 'lucide-react';
import type { Session } from '@/types/domain';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { LS_KEYS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { add, isAfter, isBefore, isSameDay, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { usePatients } from '@/hooks/use-patients';
import { ScrollArea } from '@/components/ui/scroll-area';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [sessions] = useLocalStorage<Session[]>(LS_KEYS.SESSIONS, []);
    const [packageSales] = useLocalStorage<any[]>(LS_KEYS.PACKAGE_SALES, []);
    const { patients } = usePatients();

    const centreSessions = useMemo(() => sessions.filter(s => s.centreId === user?.centreId), [sessions, user]);
    const centrePackageSales = useMemo(() => packageSales.filter(p => p.centreId === user?.centreId), [packageSales, user]);
    const centrePatients = useMemo(() => patients.filter(p => p.centreId === user?.centreId), [patients, user]);

    const totalRevenue = useMemo(() => {
        return centreSessions
            .filter(s => s.paymentStatus === 'paid')
            .reduce((acc, session) => {
                 // Simplistic revenue calculation, can be improved with real package prices
                 // Assuming a flat rate per session for this demo
                return acc + 100;
            }, 0);
    }, [centreSessions]);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Based on paid sessions</p>
                </CardContent>
            </Card>
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
  const { patients } = usePatients();
  const [filter, setFilter] = useState('today');
  const { toast } = useToast();

  const centreSessions = useMemo(() => {
    return sessions.filter(s => s.centreId === user?.centreId);
  }, [sessions, user]);

  const todaysSessions = useMemo(() => {
    return centreSessions.filter(s => isSameDay(new Date(s.date), new Date()));
  }, [centreSessions]);

  const filteredSessions = useMemo(() => {
    const now = new Date();
    const oneHourFromNow = add(now, { hours: 1 });
    
    let filtered = centreSessions;

    switch (filter) {
      case 'within_hour':
        filtered = centreSessions.filter(s => {
          const startTime = new Date(`${s.date}T${s.startTime}`);
          return isAfter(startTime, now) && isBefore(startTime, oneHourFromNow);
        });
        break;
      case 'today':
        filtered = centreSessions.filter(s => isSameDay(new Date(s.date), now));
        break;
      case 'this_week':
        filtered = centreSessions.filter(s => {
          const sessionDate = new Date(s.date);
          return isWithinInterval(sessionDate, { start: startOfWeek(now), end: endOfWeek(now) });
        });
        break;
    }
    // sort by start time
    return filtered.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [filter, centreSessions]);

  const handleCheckIn = (sessionId: string) => {
    setSessions(sessions.map(s => 
        s.id === sessionId ? { ...s, status: 'checked-in' } : s
    ));
    toast({
        title: "Patient Checked-In",
        description: "The patient's status has been updated."
    });
  }

  const getPatientName = (patientId: string) => {
    return patients.find(p => p.id === patientId)?.name || "Unknown Patient";
  }

  return (
    <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
        <div className="grid gap-4 md:grid-cols-2">
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
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{patients.length}</div>
                <p className="text-xs text-muted-foreground">in the system</p>
            </CardContent>
            </Card>
        </div>
      <div>
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Upcoming Appointments</CardTitle>
              <p className="text-sm text-muted-foreground">Manage patient check-ins for today.</p>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full md:w-[180px] mt-4 md:mt-0">
                <SelectValue placeholder="Filter..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="within_hour">Within 1 hour</SelectItem>
                <SelectItem value="today">All Today</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-auto">
                {filteredSessions.length > 0 ? (
                <ul className="space-y-4 pr-4">
                    {filteredSessions.map(session => (
                    <li key={session.id} className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-muted/50 rounded-lg gap-4">
                        <div className="flex-1">
                        <p className="font-semibold">{getPatientName(session.patientId)}</p>
                        <p className="text-sm text-muted-foreground">{session.startTime} - {session.endTime}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-2 md:mt-0 flex-wrap">
                        <Badge variant={session.status === 'checked-in' ? 'default' : 'secondary'} className="capitalize">{session.status}</Badge>
                        {session.status === 'scheduled' && (
                            <Button size="sm" onClick={() => handleCheckIn(session.id)}>Check In</Button>
                        )}
                        </div>
                    </li>
                    ))}
                </ul>
                ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground text-center py-8">No appointments match the current filter.</p>
                </div>
                )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
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
            .filter(s => isAfter(new Date(`${s.date}T${s.startTime}`), now) && s.status === 'scheduled')
            .sort((a,b) => a.startTime.localeCompare(b.startTime))[0];
    }, [todaysSessions]);

    const getPatientName = (patientId: string) => patients.find(p => p.id === patientId)?.name || '...';


    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                    <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{therapistSessions.filter(s => s.status === 'completed').length}</div>
                    <p className="text-xs text-muted-foreground">this month</p>
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
    </div>
  );
}
