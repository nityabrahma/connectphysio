
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { Session } from "@/types/domain"
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
import { ScrollArea } from "@/components/ui/scroll-area"

const upcomingSchema = z.object({
  date: z.date({ required_error: "A date is required."}),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)."),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)."),
  status: z.enum(["scheduled", "checked-in", "completed", "cancelled"]),
});

const completedSchema = z.object({
  healthNotes: z.string().optional(),
  notes: z.string().optional(),
});


interface EditSessionModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    session: Session;
    onUpdate: (session: Session) => void;
}

export function EditSessionModal({ isOpen, onOpenChange, session, onUpdate }: EditSessionModalProps) {
    const isCompleted = session.status === 'completed';
    const formSchema = isCompleted ? completedSchema : upcomingSchema;

    const form = useForm({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        if (session) {
            form.reset({
                ...session,
                date: new Date(session.date),
            });
        }
    }, [session, form, isOpen]);


    const handleFormSubmit = (values: any) => {
        const updatedSession = { ...session, ...values };
        if (values.date) {
            updatedSession.date = format(values.date, "yyyy-MM-dd");
        }
        onUpdate(updatedSession);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Edit Session</DialogTitle>
                    <DialogDescription>
                        {isCompleted ? "Update notes for this completed session." : "Reschedule or update the status of this session."}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 -mr-6 pr-6">
                  <Form {...form}>
                      <form id="edit-session-form" onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
                        {!isCompleted && (
                            <>
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
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}
                        {isCompleted && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="healthNotes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Health Notes</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Session health notes..." {...field} rows={5} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Internal Notes (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Internal session notes..." {...field} rows={5} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}
                      </form>
                  </Form>
                </ScrollArea>
                <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end w-full pt-4 mt-auto">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit" form="edit-session-form">Save Changes</Button>
                 </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
