
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { Patient, Session, Therapist } from "@/types/domain"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
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
import { useAuth } from "@/hooks/use-auth"
import { ScrollArea } from "@/components/ui/scroll-area"

const formSchema = z.object({
  patientId: z.string().min(1, "Patient is required."),
  therapistId: z.string().min(1, "Therapist is required."),
  date: z.date({ required_error: "A date is required."}),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)."),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)."),
  status: z.enum(["scheduled", "checked-in", "completed", "cancelled", "no-show"]),
  healthNotes: z.string().optional(),
  notes: z.string().optional(),
})

type SessionFormValues = z.infer<typeof formSchema>

interface SessionFormProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (values: Omit<Session, 'id' | 'createdAt'>) => void;
    onDelete: (sessionId: string) => void;
    session?: Session;
    slot?: { start: Date, end: Date };
    patients: Patient[];
    therapists: Therapist[];
}

export function SessionForm({ isOpen, onOpenChange, onSubmit, onDelete, session, slot, patients, therapists }: SessionFormProps) {
    const { user } = useAuth();
    const form = useForm<SessionFormValues>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        if (isOpen) {
            if (session) {
                form.reset({
                    patientId: session.patientId,
                    therapistId: session.therapistId,
                    date: new Date(session.date),
                    startTime: session.startTime,
                    endTime: session.endTime,
                    status: session.status,
                    healthNotes: session.healthNotes || "",
                    notes: session.notes || "",
                });
            } else if (slot) {
                form.reset({
                    patientId: "",
                    therapistId: "",
                    date: slot.start,
                    startTime: format(slot.start, "HH:mm"),
                    endTime: format(slot.end, "HH:mm"),
                    status: 'scheduled',
                    healthNotes: "",
                    notes: "",
                });
            }
             else {
                form.reset({
                    patientId: "",
                    therapistId: "",
                    date: new Date(),
                    startTime: "",
                    endTime: "",
                    status: 'scheduled',
                    healthNotes: "",
                    notes: "",
                });
            }
        }
    }, [session, slot, form, isOpen]);

    const handleFormSubmit = (values: SessionFormValues) => {
        if (!user) return;
        onSubmit({
            ...values,
            date: format(values.date, "yyyy-MM-dd"),
            centreId: user.centreId,
        });
    }


    const isEditing = !!session;
    const canEditHealthNotes = user?.role === 'admin' || user?.role === 'therapist';

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Session' : 'Schedule New Session'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Update the details of the existing session.' : 'Fill in the details for the new session.'}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="pr-4 -mr-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="patientId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Patient</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a patient" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="therapistId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Therapist</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a therapist" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                             {therapists.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                         />
                         <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                         </div>
                        {isEditing && (
                             <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                                <SelectItem value="checked-in">Checked In</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                                <SelectItem value="no-show">No Show</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        {isEditing && canEditHealthNotes && (
                            <FormField
                                control={form.control}
                                name="healthNotes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Health Notes</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Session health notes..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Internal Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Internal session notes..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                </ScrollArea>
                <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between w-full pt-4 sticky bottom-0 bg-background">
                    {isEditing && session && user?.role !== 'therapist' && (
                        <AlertDialog>
                        <AlertDialogTrigger asChild>
                        <Button type="button" variant="destructive">Delete Session</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently cancel this session.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => onDelete(session.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                        </AlertDialog>
                    )}
                    <div className="flex justify-end">
                        <Button type="button" onClick={form.handleSubmit(handleFormSubmit)}>{isEditing ? 'Save Changes' : 'Create Session'}</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
