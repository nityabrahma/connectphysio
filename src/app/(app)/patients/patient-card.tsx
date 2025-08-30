
"use client"

import type { PackageDef, Patient, PackageSale } from "@/types/domain"
import { MoreHorizontal, PackageCheck, Eye, Edit, Trash2, PlusCircle, CheckCircle } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { useRealtimeDb } from "@/hooks/use-realtime-db"

interface PatientCardProps {
    patient: Patient;
    onView: (patient: Patient) => void;
    onEdit: (patient: Patient) => void;
    onAssignPackage: (patient: Patient) => void;
    onNewAppointment: (patient: Patient) => void;
    onDelete: (patientId: string) => void;
    canManage: boolean;
    isSelecting?: boolean;
}

export function PatientCard({ patient, onView, onEdit, onAssignPackage, onNewAppointment, onDelete, canManage, isSelecting = false }: PatientCardProps) {
    const [packages] = useRealtimeDb<Record<string, PackageDef>>('packages', {});
    const [packageSales] = useRealtimeDb<Record<string, PackageSale>>('packageSales', {});

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

    const getPackageName = () => {
        if (!patient.packageSaleId) return <Badge variant="secondary">None</Badge>;
        
        const sale = packageSales[patient.packageSaleId];
        if (!sale) return <Badge variant="secondary">None</Badge>;
        
        const pkg = packages[sale.packageId];
        if (!pkg) return <Badge variant="outline">Unknown Package</Badge>;
        
        return <Badge variant={sale.status === 'active' ? 'default' : 'secondary'}>{pkg.name}</Badge>;
    }

    return (
        <div
            className={cn(
                "grid gap-4 items-center p-4 rounded-lg bg-card transition-colors",
                isSelecting ? "cursor-pointer hover:bg-muted/50" : "hover:bg-muted/50"
            )}
             style={{ gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr) minmax(0, 1fr)" }}
             onClick={isSelecting ? () => onView(patient) : undefined}
        >
            <div className="flex items-center gap-4">
                <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getInitials(patient.name)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <button onClick={() => onView(patient)} className={cn("hover:underline font-semibold text-primary text-left truncate", isSelecting && "pointer-events-none")}>
                        {patient.name}
                    </button>
                    <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                        {patient.age ? <span>{patient.age} years</span> : null}
                    </div>
                </div>
            </div>
            
            <div>
                {getPackageName()}
            </div>
            
            <div className="text-right">
                {isSelecting ? (
                     <Button size="sm" variant="outline" onClick={() => onView(patient)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Select
                    </Button>
                ) : (
                    <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => onNewAppointment(patient)}>
                                    <PlusCircle className="mr-2"/>New Appointment
                                </DropdownMenuItem>
                                {canManage && (
                                    <DropdownMenuItem onSelect={() => onAssignPackage(patient)}>
                                        <PackageCheck className="mr-2"/>Assign Package
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </AlertDialog>
                )}
            </div>
        </div>
    )
}
