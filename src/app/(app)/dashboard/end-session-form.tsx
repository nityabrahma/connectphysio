
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { Patient, Session, TreatmentPlan } from "@/types/domain"
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
} from "@/components/ui/dialog"
import { useEffect, useMemo } from "react"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LS_KEYS } from "@/lib/constants"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
    consultation: z.string().min(1, "Consultation notes are required."),
    therapy: z.string().min(1, "Therapy notes are required."),
    treatmentDescription: z.string().min(1, "Treatment description is required."),
    treatmentCharges: z.coerce.number().min(0, "Charges cannot be negative."),
    experiments: z.string().optional(),
    medicalConditions: z.string().optional(),
});

type EndSessionFormValues = z.infer<typeof formSchema>;

interface EndSessionFormProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (sessionId: string, healthNotes: string, treatment: { description: string, charges: number }) => void;
    session: Session;
    patient?: Patient;
}

export function EndSessionForm({ isOpen, onOpenChange, onSubmit, session, patient }: EndSessionFormProps) {
    const [treatmentPlans] = useLocalStorage<TreatmentPlan[]>(LS_KEYS.TREATMENT_PLANS, []);
    
    const activeTreatmentPlan = useMemo(() => {
        if (!patient) return null;
        const patientPlans = treatmentPlans.filter(tp => tp.patientId === patient.id);
        return patientPlans.find(tp => tp.isActive) || patientPlans[0] || null;
    }, [treatmentPlans, patient]);

    const form = useForm<EndSessionFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            consultation: "",
            therapy: "",
            treatmentDescription: "",
            treatmentCharges: 0,
            experiments: "",
            medicalConditions: "",
        }
    });

    useEffect(() => {
        if (isOpen) {
            form.reset();
        }
    }, [isOpen, form]);

    const handleFormSubmit = (values: EndSessionFormValues) => {
        const healthNotes = JSON.stringify({
            consultation: values.consultation,
            therapy: values.therapy,
            experiments: values.experiments,
            medicalConditions: values.medicalConditions,
            treatment: {
                description: values.treatmentDescription,
                charges: values.treatmentCharges,
            }
        });
        
        const newTreatment = {
            description: values.treatmentDescription,
            charges: values.treatmentCharges,
        };

        onSubmit(session.id, healthNotes, newTreatment);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
                <ScrollArea className="h-full">
                    <div className="p-6">
                        <DialogHeader>
                            <DialogTitle>Complete Session</DialogTitle>
                            <DialogDescription>
                                Fill out the clinical notes for {patient?.name}'s session before completing it. 
                                The treatment will be added to the plan: <span className="font-semibold">{activeTreatmentPlan?.name}</span>
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleFormSubmit)}>
                                <div className="space-y-4 py-4">
                                    <FormField
                                        control={form.control}
                                        name="consultation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Consultation Notes</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Details about the consultation..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="therapy"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Therapy Notes</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Details about the therapy provided..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="pt-4 mt-4 border-t">
                                        <h3 className="text-lg font-semibold mb-2">Treatment Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="treatmentDescription"
                                                render={({ field }) => (
                                                    <FormItem className="md:col-span-2">
                                                        <FormLabel>Treatment Description</FormLabel>
                                                        <FormControl>
                                                            <Textarea placeholder="e.g., Ultrasound Therapy, IFT" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="treatmentCharges"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Charges (₹)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="experiments"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Experiments (Optional)</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Details about any experiments conducted..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="medicalConditions"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Medical Conditions (Optional)</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Note any relevant medical conditions..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="flex-col-reverse sm:flex-row sm:justify-end w-full pt-4 flex gap-2">
                                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                                    <Button type="submit" disabled={!activeTreatmentPlan}>
                                        {activeTreatmentPlan ? 'Confirm & Complete' : 'No Active Plan'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
