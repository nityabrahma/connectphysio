
"use client"

import type { Patient } from "@/types/domain"
import { MoreHorizontal, PackageCheck, Eye, Edit, Trash2, Mail, Phone } from "lucide-react"
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

interface PatientCardProps {
    patient: Patient;
    onView: (patient: Patient) => void;
    onEdit: (patient: Patient) => void;
    onAssignPackage: (patient: Patient) => void;
    onDelete: (patientId: string) => void;
    canManage: boolean;
}

export function PatientCard({ patient, onView, onEdit, onAssignPackage, onDelete, canManage }: PatientCardProps) {

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <div
            className="grid gap-4 items-center p-4 rounded-lg bg-card hover:bg-muted/50 transition-colors"
            style={{ gridTemplateColumns: "3fr 2fr 2fr 1fr" }}
        >
            <div className="flex items-center gap-4">
                <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getInitials(patient.name)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <button onClick={() => onView(patient)} className="hover:underline font-semibold text-primary text-left">
                        {patient.name}
                    </button>
                    <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {patient.email}</span>
                    </div>
                </div>
            </div>
            <div>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><Phone className="w-3 h-3" /> {patient.phone}</span>
            </div>
            <div>{patient.packageSaleId ? <Badge>Active</Badge> : <Badge variant="secondary">None</Badge>}</div>
            <div className="text-right">
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
                            <DropdownMenuItem onSelect={() => onView(patient)}>
                                <Eye className="mr-2"/>View History
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {canManage && (
                                <>
                                    <DropdownMenuItem onSelect={() => onEdit(patient)}>
                                        <Edit className="mr-2"/>Edit details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => onAssignPackage(patient)}>
                                        <PackageCheck className="mr-2"/>Assign Package
                                    </DropdownMenuItem>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                            <Trash2 className="mr-2"/>Delete patient
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the patient record for {patient.name}.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => onDelete(patient.id)}
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>

    )
}
