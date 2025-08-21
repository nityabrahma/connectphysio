
'use client';

import { useState } from 'react';
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
import { addDays, format } from 'date-fns';
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

  const patient = getPatient(patientId);
  const availablePackages = packages.filter((p) => p.centreId === user?.centreId);

  const handleConfirm = () => {
    setIsLoading(true);
    const selectedPackage = availablePackages.find(
      (p) => p.id === selectedPackageId
    );

    if (!selectedPackage || !user || !patient) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a package and ensure patient data is available.',
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

    let currentDate = new Date();
    const newSessions = Array.from({ length: selectedPackage.sessions }).map(
      (_, i) => {
        const assignedTherapist =
          availableTherapists[i % availableTherapists.length];
        const sessionDate = addDays(currentDate, i * 2); // Schedule every other day

        const newSession: Session = {
          id: generateId(),
          patientId: patient.id,
          therapistId: assignedTherapist.id,
          centreId: user.centreId,
          date: format(sessionDate, 'yyyy-MM-dd'),
          startTime: '10:00', // Default start time
          endTime: '11:00', // Default end time
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
            Choose from the available packages for your centre. Assigning a package will automatically schedule the corresponding number of sessions.
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
