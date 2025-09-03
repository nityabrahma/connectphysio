
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useBills } from "@/hooks/use-bills";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { usePatients } from "@/hooks/use-patients";

export default function BillingPage() {
  const router = useRouter();
  const { bills } = useBills();
  const { patients } = usePatients();

  // Create a map for quick patient lookup
  const patientMap = new Map(patients.map(p => [p.id, p.name]));

  const billsWithPatientNames = bills.map(bill => ({
    ...bill,
    patientName: patientMap.get(bill.patientId) || 'Unknown Patient',
  }));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <Button onClick={() => router.push('/billing/new')}>
          <PlusCircle />
          New Bill
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Generated Bills</CardTitle>
          <CardDescription>A history of all generated invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          {bills.length > 0 ? (
            <DataTable columns={columns} data={billsWithPatientNames} />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
                <DollarSign className="h-16 w-16 mb-4" />
                <p>No bills have been generated yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
