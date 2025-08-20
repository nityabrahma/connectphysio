
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { Patient } from "@/types/domain"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
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
import { useAuth } from "@/hooks/use-auth"
import { ScrollArea } from "@/components/ui/scroll-area"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
  age: z.coerce.number().int().positive().optional().or(z.literal('')),
  medicalInfo: z.string().optional(),
  notes: z.string().optional(),
})

type PatientFormValues = z.infer<typeof formSchema>

interface PatientFormProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (values: PatientFormValues & { centreId: string }) => void;
    patient?: Patient;
}

export function PatientForm({ isOpen, onOpenChange, onSubmit, patient }: PatientFormProps) {
    const { user: currentUser } = useAuth();
    const form = useForm<PatientFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            age: '',
            medicalInfo: "",
            notes: "",
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (patient) {
                form.reset({
                    name: patient.name || "",
                    email: patient.email || "",
                    phone: patient.phone || "",
                    age: patient.age || '',
                    medicalInfo: patient.medicalInfo || "",
                    notes: patient.notes || "",
                });
            } else {
                form.reset({
                    name: "",
                    email: "",
                    phone: "",
                    age: '',
                    medicalInfo: "",
                    notes: "",
                });
            }
        }
    }, [patient, form, isOpen]);


    const isEditing = !!patient;

    const handleFormSubmit = (values: PatientFormValues) => {
        if (!currentUser) return;
        onSubmit({ ...values, centreId: currentUser.centreId });
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Update the details of the existing patient.' : 'Enter the details for the new patient.'}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="pr-4 -mr-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="john.doe@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="555-123-4567" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Age</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="35" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="medicalInfo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Medical Info (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Any relevant medical history..." {...field} />
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
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Initial consultation notes..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <DialogFooter className="pt-4 sticky bottom-0 bg-background">
                            <Button type="submit">{isEditing ? 'Save Changes' : 'Create Patient'}</Button>
                        </DialogFooter>
                    </form>
                </Form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
