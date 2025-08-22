
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
import { useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Info } from "lucide-react"
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
import { Alert, AlertDescription } from "@/components/ui/alert"

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

export type SessionFormValues = z.infer<typeof formSchema>

interface SessionFormProps {
    onSubmit: (values: SessionFormValues) => void;
    onDelete?: (sessionId: string) => void;
    session?: Session;
    patients: Patient[];
    therapists: Therapist[];
    patientId?: string | null;
}

export function SessionForm({ onSubmit, onDelete, session, patients, therapists, patientId }: SessionFormProps) {
    const { user } = useAuth();
    const isEditing = !!session;

    const form = useForm<SessionFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            patientId: patientId || session?.patientId || "",
            therapistId: session?.therapistId || "",
            date: session ? new Date(session.date) : new Date(),
            startTime: session?.startTime || format(new Date(), 'HH:mm'),
            endTime: session?.endTime || format(new Date(Date.now() + 60 * 60 * 1000), 'HH:mm'),
            status: session?.status || 'scheduled',
            healthNotes: session?.healthNotes || "",
            notes: session?.notes || "",
        }
    });
    
    useEffect(() => {
        if (patientId) {
            form.setValue('patientId', patientId);
        }
    }, [patientId, form]);

    const handleFormSubmit = (values: SessionFormValues) => {
        onSubmit(values);
    }


    const canEditHealthNotes = user?.role === 'admin' || user?.role === 'therapist';

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="patientId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Patient</FormLabel>
                                <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value} 
                                    value={field.value}
                                    disabled={!!patientId}
                                >
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
                    
                     {!isEditing && (
                      <p className="text-sm text-destructive md:col-span-2 -mb-2">
                        Note: The date and time are automatically set to the current date and time.
                      </p>
                    )}

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

                <div className="flex justify-between items-center pt-4">
                    {isEditing && session && onDelete && user?.role !== 'therapist' ? (
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
                    ) : <div />}
                    <Button type="submit">{isEditing ? 'Save Changes' : 'Create Session'}</Button>
                </div>
            </form>
        </Form>
    )
}
