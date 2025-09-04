
'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Printer } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { useBills } from '@/hooks/use-bills';
import { usePatients } from '@/hooks/use-patients';
import Link from 'next/link';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

export default function ViewBillPage() {
  const router = useRouter();
  const params = useParams();
  const billId = params.id as string;
  
  const { getBill } = useBills();
  const { getPatient } = usePatients();

  const bill = useMemo(() => getBill(billId), [billId, getBill]);
  const patient = useMemo(() => bill ? getPatient(bill.patientId) : null, [bill, getPatient]);
  
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

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

  return (
    <>
      <div className="flex flex-col gap-8 h-full">
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bill Details</h1>
                    <p className="text-muted-foreground">Viewing invoice {bill.billNumber}</p>
                </div>
            </div>
            <Button variant="outline" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4"/>
                Print
            </Button>
        </div>

        <Card className="w-full max-w-4xl mx-auto print:shadow-none print:border-none">
            <CardHeader className="bg-muted/50 rounded-t-2xl">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl">Invoice</CardTitle>
                        <CardDescription>Bill Number: {bill.billNumber}</CardDescription>
                    </div>
                    <div className="text-left sm:text-right">
                        <p className="font-semibold">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">{patient.email}</p>
                        <p className="text-sm text-muted-foreground">{patient.phone}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                 <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <Label className="text-muted-foreground">Bill Date</Label>
                        <p>{format(new Date(bill.createdAt), "PPP")}</p>
                    </div>
                     <div>
                        <Label className="text-muted-foreground">Session Date</Label>
                        <p>{format(new Date(bill.sessionDate), "PPP")}</p>
                    </div>
                    <div>
                        <Label className="text-muted-foreground">Status</Label>
                        <p className="capitalize font-semibold">{bill.status}</p>
                    </div>
                 </div>

                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[60%]">Treatment</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bill.treatments.map((treatment) => (
                        <TableRow key={treatment.treatmentDefId}>
                            <TableCell className="font-medium">{treatment.name}</TableCell>
                            <TableCell className="text-right">{formatCurrency(treatment.price)}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
                
                <Separator />

                <div className="w-full sm:w-1/2 sm:ml-auto space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Subtotal per session</span>
                        <span>{formatCurrency(bill.treatments.reduce((sum, t) => sum + t.price, 0))}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Number of Sessions</span>
                        <span>x {bill.numberOfSessions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Before Discount</span>
                        <span className="font-semibold">{formatCurrency(bill.subtotal)}</span>
                    </div>
                    {bill.discount && (
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Discount ({bill.discount.packageName} - {bill.discount.percentage}%)</span>
                            <span className="text-destructive">- {formatCurrency(bill.discount.amount)}</span>
                        </div>
                    )}
                    <Separator />
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Grand Total</span>
                        <span>{formatCurrency(bill.grandTotal)}</span>
                    </div>
                </div>

            </CardContent>
            {bill.notes && (
                <CardFooter className="bg-muted/50 rounded-b-2xl p-4">
                    <p className="text-sm text-muted-foreground"><strong>Notes:</strong> {bill.notes}</p>
                </CardFooter>
            )}
        </Card>
      </div>
    </>
  );
}
