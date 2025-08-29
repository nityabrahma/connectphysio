
"use client"

import React, { forwardRef, useMemo } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { LS_KEYS } from "@/lib/constants";
import type { Centre, Patient, Session } from "@/types/domain";
import { useAuth } from "@/hooks/use-auth";
import { usePatients } from "@/hooks/use-patients";
import { format } from "date-fns";
import { FormattedHealthNotes } from "./formatted-health-notes";
import { Separator } from "./ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Icons } from "./icons";

interface PrintableInvoiceProps {
  session: Session;
}

export const PrintableInvoice = forwardRef<HTMLDivElement, PrintableInvoiceProps>(({ session }, ref) => {
  const { user } = useAuth();
  const { getPatient } = usePatients();
  const [centres] = useLocalStorage<Centre[]>(LS_KEYS.CENTRES, []);
  
  const patient = getPatient(session.patientId);
  const centre = centres.find(c => c.id === user?.centreId);

  const treatments = useMemo(() => {
    try {
        if (session.healthNotes) {
            const notes = JSON.parse(session.healthNotes);
            if (notes.treatment && notes.treatment.description && typeof notes.treatment.charges === 'number') {
                return [{
                    description: notes.treatment.description,
                    charges: notes.treatment.charges
                }];
            }
        }
    } catch (e) {
        console.error("Could not parse health notes for invoice:", e);
    }
    return [];
  }, [session.healthNotes]);

  const totalAmount = useMemo(() => {
    return treatments.reduce((acc, treatment) => acc + treatment.charges, 0);
  }, [treatments]);

  if (!patient || !centre) return null;

  return (
    <div ref={ref} className="p-8 font-sans text-gray-800">
        {/* Header */}
        <header className="flex justify-between items-start pb-6 border-b-2 border-gray-200">
            <div className="flex items-center gap-4">
                <Icons.logo className="h-16 w-16" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{centre.name}</h1>
                    {centre.gstNumber && <p className="text-sm text-gray-500">GSTIN: {centre.gstNumber}</p>}
                </div>
            </div>
             <div className="text-right">
                <h2 className="text-2xl font-semibold text-gray-700">INVOICE</h2>
                <p className="text-sm text-gray-500"># {session.invoiceNumber}</p>
            </div>
        </header>

        {/* Patient and Invoice Info */}
        <section className="grid grid-cols-2 gap-8 my-6">
            <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Bill To</h3>
                <p className="font-bold text-lg text-gray-900">{patient.name}</p>
                <p className="text-gray-600">{patient.address}</p>
                <p className="text-gray-600">{patient.phone}</p>
                <p className="text-gray-600">{patient.email}</p>
            </div>
            <div className="text-right">
                 <div className="mb-2">
                     <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Date: </span>
                     <span className="text-gray-700">{format(new Date(), "PPP")}</span>
                 </div>
                 <div>
                     <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Session Date: </span>
                     <span className="text-gray-700">{format(new Date(session.date), "PPP")}</span>
                 </div>
            </div>
        </section>

        {/* Health Notes */}
        <section className="mb-8">
             <h3 className="text-lg font-semibold text-gray-800 mb-2 pb-2 border-b">Session Notes</h3>
             <div className="p-4 bg-gray-50 rounded-lg">
                <FormattedHealthNotes notes={session.healthNotes} />
             </div>
        </section>
        
        {/* Treatments */}
        <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 pb-2 border-b">Treatment Details</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80%]">Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {treatments.map((treatment, index) => (
                        <TableRow key={index}>
                            <TableCell>{treatment.description}</TableCell>
                            <TableCell className="text-right">₹{treatment.charges.toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </section>

        {/* Total */}
         <section className="mt-8 flex justify-end">
            <div className="w-full max-w-xs">
                <Separator className="my-2"/>
                <div className="flex justify-between items-center py-2">
                    <span className="font-semibold text-gray-600">Subtotal</span>
                    <span className="text-gray-800">₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-gray-100 px-3 rounded-md">
                    <span className="font-bold text-lg text-gray-900">Total</span>
                    <span className="font-bold text-lg text-gray-900">₹{totalAmount.toFixed(2)}</span>
                </div>
            </div>
         </section>
   </div>
  )
});

PrintableInvoice.displayName = 'PrintableInvoice';
