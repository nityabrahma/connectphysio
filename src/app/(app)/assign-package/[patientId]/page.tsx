
'use client';

import { useEffect, useState, useMemo } from 'react';
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
  Centre,
} from '@/types/domain';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { generateId } from '@/lib/ids';
import { addDays, format, isWeekend, differenceInDays, parse } from 'date-fns';
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
import { ArrowLeft, CalendarIcon, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';


type Frequency = "daily" | "daily_business" | "every_2_days" | "every_3_days" | "weekly";

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
  const [centres] = useLocalStorage<Centre[]>(LS_KEYS.CENTRES, []);

  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);
  const [selectedTime, setSelectedTime] = useState<string>('10:00');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [frequency, setFrequency] = useState<Frequency>('daily_business');

  const patient = getPatient(patientId);
  const availablePackages = packages.filter((p) => p.centreId === user?.centreId);
  const currentCentre = centres.find(c => c.id === user?.centreId);

  const selectedPackage = availablePackages.find((p) => p.id === selectedPackageId);

  useEffect(() => {
    if (selectedPackage && startDate) {
      let initialDates: Date[] = [];
      let currentDate = new Date(startDate);
      let attempts = 0; // Prevent infinite loop

      while (initialDates.length < selectedPackage.sessions && attempts < 365) {
        let nextDate = new Date(currentDate);

        if (initialDates.length > 0) {
          const lastDate = initialDates[initialDates.length - 1];
          switch (frequency) {
            case 'daily': nextDate = addDays(lastDate, 1); break;
            case 'every_2_days': nextDate = addDays(lastDate, 2); break;
            case 'every_3_days': nextDate = addDays(lastDate, 3); break;
            case 'weekly': nextDate = addDays(lastDate, 7); break;
            case 'daily_business':
              let tempDate = addDays(lastDate, 1);
              while (isWeekend(tempDate)) {
                tempDate = addDays(tempDate, 1);
              }
              nextDate = tempDate;
              break;
          }
        } else {
          if (frequency === 'daily_business' && isWeekend(nextDate)) {
            while (isWeekend(nextDate)) {
              nextDate = addDays(nextDate, 1);
            }
          }
        }
        
        const dayDifference = differenceInDays(nextDate, startDate);
        if (dayDifference >= selectedPackage.durationDays) {
            break; 
        }

        initialDates.push(nextDate);
        currentDate = nextDate; // for the next loop
        attempts++;
      }
      setSelectedDates(initialDates);
    } else {
      setSelectedDates([]);
    }
  }, [selectedPackageId, selectedPackage, startDate, frequency]);


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

  const timeSlots = useMemo(() => {
    if (!currentCentre) return [];
    
    const { openingTime, closingTime } = currentCentre;
    if (!openingTime || !closingTime) return [];

    const slots = [];
    const start = parse(openingTime, 'HH:mm', new Date());
    const end = parse(closingTime, 'HH:mm', new Date());

    let currentTime = start;
    while (currentTime < end) {
      slots.push(format(currentTime, 'HH:mm'));
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }
    return slots;
  }, [currentCentre]);

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

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (selectedPackage && dates && dates.length > selectedPackage.sessions) {
      toast({
        variant: 'destructive',
        title: 'Session limit reached',
        description: `You can only select up to ${selectedPackage.sessions} sessions for this package.`,
      });
      // Keep the selection at the limit
      setSelectedDates(dates.slice(0, selectedPackage.sessions));
    } else {
      setSelectedDates(dates);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 sticky top-0 py-4 z-10">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assign Package</h1>
          <p className="text-muted-foreground">Assign a new therapy package to a patient.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Patient Details</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Name</Label>
              <p className="font-semibold">{patient.name}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Email</Label>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                {patient.email}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Phone</Label>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                {patient.phone}
              </p>
            </div>
          </CardContent>
        </Card>

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
                      {p.name} - {p.sessions} sessions, {p.durationDays} days for {p.discountPercentage}% discount
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
                    Select your scheduling preferences. {selectedPackage.sessions} sessions will be automatically selected on the calendar below.
                    You can still manually adjust the dates. {selectedDates?.length || 0} of {selectedPackage.sessions} selected.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-1 space-y-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequency-select">Frequency</Label>
                      <Select value={frequency} onValueChange={(value: Frequency) => setFrequency(value)}>
                        <SelectTrigger id="frequency-select">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily (incl. weekends)</SelectItem>
                          <SelectItem value="daily_business">Daily (business days only)</SelectItem>
                          <SelectItem value="every_2_days">Every 2 Days</SelectItem>
                          <SelectItem value="every_3_days">Every 3 Days</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time-select">Session Time</Label>
                      <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger id="time-select">
                          <SelectValue placeholder="Select a time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map(time => (
                            <SelectItem key={time} value={time}>
                               {format(parse(time, 'HH:mm', new Date()), 'h:mm a')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="md:col-span-3 flex justify-center">
                    <Calendar
                      mode="multiple"
                      selected={selectedDates}
                      onSelect={handleDateSelect}
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
    </div>
  );
}
