
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
import { useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Invalid email address."),
    phone: z.string().min(10, "Phone number must be at least 10 digits."),
    age: z.coerce.number().int().positive().optional().or(z.literal('')),
    medicalInfo: z.string().optional(),
    notes: z.string().optional(),
})

export type PatientFormValues = z.infer<typeof formSchema>

interface PatientFormProps {
    onSubmit: (values: PatientFormValues & { centreId: string }) => void;
    patient?: Patient;
}

export function PatientForm({ onSubmit, patient }: PatientFormProps) {
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
        if (patient) {
            form.reset({
                name: patient.name || "",
                email: patient.email || "",
                phone: patient.phone || "",
                age: patient.age || '',
                medicalInfo: patient.medicalInfo || "",
                notes: patient.notes || "",
            });
        }
    }, [patient, form]);


    const isEditing = !!patient;

    const handleFormSubmit = (values: PatientFormValues) => {
        if (!currentUser) return;
        onSubmit({ ...values, centreId: currentUser.centreId });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>
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
                <div className="flex justify-end">
                    <Button type="submit">{isEditing ? 'Save Changes' : 'Create Patient'}</Button>
                </div>
            </form>
        </Form>
    )
}
