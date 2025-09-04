
"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Bill } from "@/types/domain"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { MoreHorizontal, Edit, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export type BillWithPatientName = Bill & { patientName: string };

type ColumnsProps = {
  onEdit: (billId: string) => void;
  onView: (billId: string) => void;
};

export const columns = ({ onEdit, onView }: ColumnsProps): ColumnDef<BillWithPatientName>[] => [
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
  {
    id: "actions",
    cell: ({ row }) => {
      const bill = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onView(bill.id)}>
              <Eye className="mr-2 h-4 w-4" />
              View Bill
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(bill.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Bill
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
