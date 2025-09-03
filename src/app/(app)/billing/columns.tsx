
"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Bill } from "@/types/domain"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export type BillWithPatientName = Bill & { patientName: string };

export const columns: ColumnDef<BillWithPatientName>[] = [
  {
    accessorKey: "billNumber",
    header: "Bill #",
  },
  {
    accessorKey: "patientName",
    header: "Patient",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        return <span>{format(new Date(date), "MMM d, yyyy")}</span>
    }
  },
  {
    accessorKey: "grandTotal",
    header: "Amount",
     cell: ({ row }) => {
      const amount = parseFloat(row.getValue("grandTotal"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)
 
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        
        let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
        if (status === 'paid') variant = 'default';
        if (status === 'unpaid') variant = 'outline';

        return <Badge variant={variant} className="capitalize">{status}</Badge>
    }
  },
]
