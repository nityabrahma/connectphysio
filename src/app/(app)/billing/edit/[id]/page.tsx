
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Patient, TreatmentDef, PackageDef, Bill } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, CalendarIcon } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { useRealtimeDb } from '@/hooks/use-realtime-db';
import { TreatmentSelector, type BillableTreatment } from '@/app/(app)/billing/new/treatment-selector';
import { useAuth } from '@/hooks/use-auth';
import { useBills } from '@/hooks/use-bills';
import { usePatients } from '@/hooks/use-patients';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, parse } from 'date-fns';

export default function EditBillPage() {
  const router = useRouter();
  const params = useParams();
  const billId = params.id as string;
  
  const { user } = useAuth();
  const { getBill, updateBill } = useBills();
  const { getPatient } = usePatients();

  const [treatmentDefs] = useRealtimeDb<Record<string, TreatmentDef>>('treatmentDefs', {});
  const [packages] = useRealtimeDb<Record<string, PackageDef>>('packages', {});

  const bill = useMemo(() => getBill(billId), [billId, getBill]);
  const patient = useMemo(() => bill ? getPatient(bill.patientId) : null, [bill, getPatient]);
  
  const [selectedTreatments, setSelectedTreatments] = useState<BillableTreatment[]>([]);
  const [sessionDate, setSessionDate] = useState<Date | undefined>();

  useEffect(() => {
    if (bill) {
      const initialTreatments = bill.treatments.map(t => ({
        id: t.treatmentDefId,
        name: t.name,
        price: t.price,
        customPrice: t.price,
        centreId: user?.centreId || '',
      }));
      setSelectedTreatments(initialTreatments);
      
      if (bill.sessionDate) {
        // Fix: Parse the date string correctly to avoid timezone issues.
        const parsedDate = parse(bill.sessionDate, 'yyyy-MM-dd', new Date());
        setSessionDate(parsedDate);
      } else {
        // Fallback for older bills without a sessionDate
        setSessionDate(new Date(bill.createdAt));
      }
    }
  }, [bill, user]);

  const availableTreatments = useMemo(() => 
    Object.values(treatmentDefs).filter(t => t.centreId === user?.centreId), 
  [treatmentDefs, user]);

  const availablePackages = useMemo(() =>
    Object.values(packages).filter(p => p.centreId === user?.centreId),
  [packages, user]);

  const handleUpdateBill = useCallback((billData: Omit<Bill, 'id' | 'billNumber' | 'patientId' | 'centreId' | 'createdAt' | 'sessionDate'>) => {
    if (!bill || !sessionDate) return;
    
    updateBill(bill.id, { 
        ...billData,
        sessionDate: format(sessionDate, 'yyyy-MM-dd'),
    });
    router.push('/billing');
  }, [bill, updateBill, router, sessionDate]);
  
  if (!bill || !patient) {
     return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-2xl font-semibold mb-4">Bill not found</h2>
        <p className="text-muted-foreground mb-6">
          The bill you are looking for does not exist or could not be loaded.
        </p>
        <Button asChild>
          <Link href="/billing">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Billing
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-8 h-full">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Bill {bill.billNumber}</h1>
            <p className="text-muted-foreground">Modify the details for this bill.</p>
          </div>
        </div>

        <div className="space-y-6">
            <Card>
                <CardContent className="p-6 grid md:grid-cols-2 gap-6">
                    <div className="p-4 border rounded-lg bg-muted/50">
                        <div>
                            <Label className="text-xs text-muted-foreground">Patient</Label>
                            <p className="font-semibold text-lg">{patient.name}</p>
                        </div>
                    </div>
                     <div className="p-4 border rounded-lg bg-muted/50">
                        <div>
                            <Label className="text-xs text-muted-foreground">Session Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-full justify-start text-left font-normal mt-2",
                                    !sessionDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {sessionDate ? format(sessionDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={sessionDate}
                                    onSelect={setSessionDate}
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <TreatmentSelector 
                availableTreatments={availableTreatments}
                selectedTreatments={selectedTreatments}
                onSelectTreatments={setSelectedTreatments}
                availablePackages={availablePackages}
                onGenerateBill={handleUpdateBill}
                isEditing={true}
                initialBillData={bill}
            />
        </div>
      </div>
    </>
  );
}
