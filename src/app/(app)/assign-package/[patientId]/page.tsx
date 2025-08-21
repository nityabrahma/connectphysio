
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usePatients } from '@/hooks/use-patients';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { LS_KEYS } from '@/lib/constants';
import type {
  Patient,
  PackageDef,
  PackageSale,
  Session,
  Therapist,
} from '@/types/domain';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { generateId } from '@/lib/ids';
import { addDays, format, isWeekend } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';

export default function AssignPackagePage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.patientId as string;

  const { user } = useAuth();
  const { getPatient, updatePatient } = usePatients();
  const { toast } = useToast();

  const [packages] = useLocalStorage<PackageDef[]>(LS_KEYS.PACKAGES, []);
  const [packageSales, setPackageSales] = useLocalStorage<PackageSale[]>(
    LS_KEYS.PACKAGE_SALES,
    []
  );
  const [sessions, setSessions] = useLocalStorage<Session[]>(
    LS_KEYS.SESSIONS,
    []
  );
  const [therapists] = useLocalStorage<Therapist[]>(LS_KEYS.THERAPISTS, []);

  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);
  const [selectedTime, setSelectedTime] = useState<string>('10:00');

  const patient = getPatient(patientId);
  const availablePackages = packages.filter((p) => p.centreId === user?.centreId);
  
  const selectedPackage = availablePackages.find((p) => p.id === selectedPackageId);

  useEffect(() => {
    if (selectedPackage) {
      const getNextBusinessDays = (count: number): Date[] => {
        const dates: Date[] = [];
        let currentDate = new Date();
        while (dates.length < count) {
          currentDate = addDays(currentDate, 1);
          if (!isWeekend(currentDate)) {
            dates.push(currentDate);
          }
        }
        return dates;
      };
      setSelectedDates(getNextBusinessDays(selectedPackage.sessions));
    } else {
      setSelectedDates([]);
    }
  }, [selectedPackageId, selectedPackage]);


  const handleConfirm = () => {
    setIsLoading(true);

    if (!selectedPackage || !user || !patient || !selectedDates || selectedDates.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a package and session dates.',
      });
      setIsLoading(false);
      return;
    }
    
    if (selectedDates.length !== selectedPackage.sessions) {
      toast({
        variant: 'destructive',
        title: 'Incorrect number of dates',
        description: `Please select exactly ${selectedPackage.sessions} dates for the sessions.`,
      });
      setIsLoading(false);
      return;
    }

    if (patient.packageSaleId) {
      const existingSale = packageSales.find(
        (s) => s.id === patient.packageSaleId
      );
      if (existingSale && existingSale.status === 'active') {
        toast({
          variant: 'destructive',
          title: 'Patient already has an active package.',
        });
        setIsLoading(false);
        return;
      }
    }

    const newSale: PackageSale = {
      id: generateId(),
      patientId: patient.id,
      packageId: selectedPackage.id,
      centreId: user.centreId,
      startDate: new Date().toISOString(),
      expiryDate: addDays(
        new Date(),
        selectedPackage.durationDays
      ).toISOString(),
      sessionsTotal: selectedPackage.sessions,
      sessionsUsed: 0,
      status: 'active',
    };

    const availableTherapists = therapists.filter(
      (t) => t.centreId === user.centreId
    );
    if (availableTherapists.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No therapists available to schedule sessions.',
      });
      setIsLoading(false);
      return;
    }

    const [startHour, startMinute] = selectedTime.split(':').map(Number);

    const newSessions = selectedDates.map(
      (sessionDate, i) => {
        const assignedTherapist =
          availableTherapists[i % availableTherapists.length];
        
        const endTimeDate = new Date(sessionDate);
        endTimeDate.setHours(startHour, startMinute + 60);

        const newSession: Session = {
          id: generateId(),
          patientId: patient.id,
          therapistId: assignedTherapist.id,
          centreId: user.centreId,
          date: format(sessionDate, 'yyyy-MM-dd'),
          startTime: selectedTime,
          endTime: format(endTimeDate, 'HH:mm'),
          status: 'scheduled',
          paymentStatus: 'unpaid',
          packageSaleId: newSale.id,
          createdAt: new Date().toISOString(),
          notes: i === 0 ? `Package sale notes: ${notes}` : undefined,
        };
        return newSession;
      }
    );

    setSessions([...sessions, ...newSessions]);
    setPackageSales([...packageSales, newSale]);
    updatePatient(patient.id, { packageSaleId: newSale.id });

    toast({
      title: 'Package Assigned',
      description: `${selectedPackage.name} assigned to ${patient.name} and ${newSessions.length} sessions scheduled.`,
    });
    router.push(`/patient-details/${patient.id}`);
  };

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-2xl font-semibold mb-4">Patient not found</h2>
        <p className="text-muted-foreground mb-6">
          The patient you are looking for does not exist or could not be loaded.
        </p>
        <Button asChild>
          <Link href="/patients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patients
          </Link>
        </Button>
      </div>
    );
  }
  
  const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8; // 8 AM to 5 PM
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Assign Package</h1>
            <p className="text-muted-foreground">Assign a new therapy package to {patient.name}.</p>
        </div>
      </div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Select a Package</CardTitle>
          <CardDescription>
            Choose from the available packages for your centre. This will pre-select dates on the calendar below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="package-select">Package</Label>
            <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
              <SelectTrigger id="package-select">
                <SelectValue placeholder="Select a package" />
              </SelectTrigger>
              <SelectContent>
                {availablePackages.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} - {p.sessions} sessions, {p.durationDays} days for ${p.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea 
              id="notes"
              placeholder="Any notes related to this package sale..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {selectedPackage && (
             <div className="space-y-4 pt-4 border-t">
                <div>
                  <h3 className="font-semibold text-lg">Schedule Sessions</h3>
                  <p className="text-muted-foreground text-sm">
                    Select {selectedPackage.sessions} dates for the sessions. {selectedDates?.length || 0} selected.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-1 space-y-2">
                    <Label htmlFor="time-select">Session Time</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger id="time-select">
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map(time => (
                           <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-3 flex justify-center">
                    <Calendar
                        mode="multiple"
                        selected={selectedDates}
                        onSelect={setSelectedDates}
                        disabled={{ before: new Date() }}
                        className="rounded-md"
                        numberOfMonths={2}
                    />
                  </div>
                </div>
             </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedPackageId || isLoading}
          >
            {isLoading ? 'Assigning...' : 'Assign & Schedule Sessions'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
