
'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Package, DollarSign, BarChart3, Clock } from 'lucide-react';
import type { Patient, Session } from '@/types/domain';
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

const renderAdminDashboard = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Packages Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+201 since last hour</p>
          </CardContent>
        </Card>
      </div>
    </>
  );

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
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        <Card>
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
          <CardContent>
            {filteredSessions.length > 0 ? (
              <ul className="space-y-4">
                {filteredSessions.map(session => (
                  <li key={session.id} className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-semibold">{getPatientName(session.patientId)}</p>
                      <p className="text-sm text-muted-foreground">{session.startTime} - {session.endTime}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 md:mt-0">
                      <Badge variant={session.status === 'checked-in' ? 'default' : 'secondary'} className="capitalize">{session.status}</Badge>
                      {session.status === 'scheduled' && (
                        <Button size="sm" onClick={() => handleCheckIn(session.id)}>Check In</Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-8">No appointments match the current filter.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

const renderTherapistDashboard = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Appointments Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">2 completed, 3 upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">active this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+28</div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">11:00 AM</div>
            <p className="text-xs text-muted-foreground">with Olivia Bennett</p>
          </CardContent>
        </Card>
      </div>
    </>
  );

export default function DashboardPage() {
  const { user } = useAuth();
  
  const renderDashboardContent = () => {
    switch (user?.role) {
      case 'admin':
        return renderAdminDashboard();
      case 'receptionist':
        return <ReceptionistDashboard />;
      case 'therapist':
        return renderTherapistDashboard();
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
