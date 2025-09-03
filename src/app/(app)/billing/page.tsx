
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, PlusCircle, Calendar as CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useBills } from "@/hooks/use-bills";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { usePatients } from "@/hooks/use-patients";
import { useState, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function BillingPage() {
  const router = useRouter();
  const { bills } = useBills();
  const { patients } = usePatients();
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  // Create a map for quick patient lookup
  const patientMap = new Map(patients.map(p => [p.id, p.name]));

  const billsWithPatientNames = useMemo(() => {
    return bills.map(bill => ({
      ...bill,
      patientName: patientMap.get(bill.patientId) || 'Unknown Patient',
    }));
  }, [bills, patientMap]);
  
  const filteredBills = useMemo(() => {
    if (!date?.from) {
      return billsWithPatientNames;
    }
    const fromDate = date.from;
    // If only 'from' date is selected, 'to' date defaults to the same day for filtering purposes.
    const toDate = date.to || date.from;

    return billsWithPatientNames.filter(bill => {
      const billDate = new Date(bill.createdAt);
      // Set hours to 0 to compare dates only
      billDate.setHours(0, 0, 0, 0);
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);
      return billDate >= fromDate && billDate <= toDate;
    });
  }, [billsWithPatientNames, date]);

  const handleEditBill = (billId: string) => {
    router.push(`/billing/edit/${billId}`);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <div className="flex items-center gap-4">
           <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          <Button onClick={() => router.push('/billing/new')}>
            <PlusCircle />
            New Bill
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Generated Bills</CardTitle>
          <CardDescription>A history of all generated invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          {bills.length > 0 ? (
            <DataTable columns={columns({ onEdit: handleEditBill })} data={filteredBills} />
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
