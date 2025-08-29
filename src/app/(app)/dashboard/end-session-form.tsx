
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import type { Patient, Session, TreatmentPlan, Questionnaire } from "@/types/domain"
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
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LS_KEYS } from "@/lib/constants"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { Slider } from "@/components/ui/slider"
import Link from "next/link"

const answerSchema = z.object({
  questionId: z.string(),
  answer: z.any(),
});

const formSchema = z.object({
    treatmentDescription: z.string().optional(),
    answers: z.array(answerSchema),
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
    const { user } = useAuth();
    const [treatmentPlans] = useLocalStorage<TreatmentPlan[]>(LS_KEYS.TREATMENT_PLANS, []);
    const [questionnaires] = useLocalStorage<Questionnaire[]>(LS_KEYS.TREATMENT_QUESTIONNAIRES, []);

    const treatmentQuestionnaire = useMemo(() => {
        return questionnaires.find(q => q.centreId === user?.centreId);
    }, [questionnaires, user]);
    
    const activeTreatmentPlan = useMemo(() => {
        if (!patient) return null;
        const patientPlans = treatmentPlans.filter(tp => tp.patientId === patient.id);
        return patientPlans.find(tp => tp.isActive) || patientPlans[0] || null;
    }, [treatmentPlans, patient]);

    const form = useForm<EndSessionFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            treatmentDescription: "",
            answers: treatmentQuestionnaire?.questions.map(q => ({ questionId: q.id, answer: "" })) || [],
        }
    });
    
     const { fields } = useFieldArray({
        control: form.control,
        name: "answers"
    });

    useEffect(() => {
        if (isOpen) {
            form.reset({
                treatmentDescription: "",
                answers: treatmentQuestionnaire?.questions.map(q => ({ questionId: q.id, answer: "" })) || [],
            });
        }
    }, [isOpen, form, treatmentQuestionnaire]);

    const handleFormSubmit = (values: EndSessionFormValues) => {
        const healthNotes = JSON.stringify({
            treatment: {
                description: values.treatmentDescription,
                charges: 0,
            },
            answers: values.answers,
            questionnaireId: treatmentQuestionnaire?.id,
        });
        
        const newTreatment = {
            description: values.treatmentDescription || "",
            charges: 0,
        };

        onSubmit(session.id, healthNotes, newTreatment);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Complete Session</DialogTitle>
                    <DialogDescription>
                        Fill out the clinical notes for {patient?.name}'s session before completing it. 
                        The treatment will be added to the plan: <span className="font-semibold">{activeTreatmentPlan?.name}</span>
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto -mr-6 pr-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
                            <div className="space-y-4 py-4">
                                <div className="pt-4 mt-4 border-t">
                                    <h3 className="text-lg font-semibold mb-2">Treatment Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="treatmentDescription"
                                            render={({ field }) => (
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel>Treatment Description (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="e.g., Ultrasound Therapy, IFT. Leave blank to follow current plan." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {treatmentQuestionnaire ? (
                                    <div className="space-y-4 pt-4 border-t">
                                        <h3 className="text-lg font-semibold">{treatmentQuestionnaire.title}</h3>
                                        {fields.map((field, index) => {
                                            const question = treatmentQuestionnaire.questions.find(q => q.id === field.questionId);
                                            if (!question) return null;
                                            
                                            return (
                                                <FormField
                                                    key={field.id}
                                                    control={form.control}
                                                    name={`answers.${index}.answer`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{question.label}</FormLabel>
                                                            <FormControl>
                                                                {question.type === 'slider' ? (
                                                                    <div className="flex items-center gap-4">
                                                                        <Slider
                                                                            min={question.min || 0}
                                                                            max={question.max || 10}
                                                                            step={question.step || 1}
                                                                            value={[field.value || 0]}
                                                                            onValueChange={(value) => field.onChange(value[0])}
                                                                        />
                                                                        <span className="font-semibold w-12 text-center">{field.value || 0}</span>
                                                                    </div>
                                                                ) : (
                                                                    <Textarea
                                                                        placeholder={question.placeholder || ''}
                                                                        {...field}
                                                                    />
                                                                )}
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )
                                        })}
                                    </div>
                                ) : (
                                    user?.role === 'admin' && (
                                        <div className="text-center py-8 text-muted-foreground border-t mt-4">
                                            <p>No treatment questionnaire found.</p>
                                            <Button variant="link" asChild>
                                                <Link href="/settings/treatment-questions">Create one in settings</Link>
                                            </Button>
                                        </div>
                                    )
                                )}
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
            </DialogContent>
        </Dialog>
    );
}
