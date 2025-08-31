
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import type { Patient, Session, TreatmentPlan, Questionnaire, Treatment } from "@/types/domain"
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
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { Slider } from "@/components/ui/slider"
import Link from "next/link"
import { useRealtimeDb } from "@/hooks/use-realtime-db"

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
    onSubmit: (sessionId: string, healthNotes: string, treatment: Omit<Treatment, 'date' | 'treatments'> & { description: string }) => void;
    session: Session;
    patient?: Patient;
}

export function EndSessionForm({ isOpen, onOpenChange, onSubmit, session, patient }: EndSessionFormProps) {
    const { user } = useAuth();
    const [treatmentPlans] = useRealtimeDb<Record<string, TreatmentPlan>>('treatmentPlans', {});
    const [questionnaires] = useRealtimeDb<Record<string, Questionnaire>>('sessionQuestionnaires', {});

    const sessionQuestionnaire = useMemo(() => {
        return Object.values(questionnaires).find(q => q.centreId === user?.centreId);
    }, [questionnaires, user]);
    
    const activeTreatmentPlan = useMemo(() => {
        if (!patient) return null;
        const patientPlans = Object.values(treatmentPlans).filter(tp => tp.patientId === patient.id);
        return patientPlans.find(tp => tp.isActive) || patientPlans[0] || null;
    }, [treatmentPlans, patient]);

    const form = useForm<EndSessionFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            treatmentDescription: "",
            answers: [],
        }
    });
    
     const { fields } = useFieldArray({
        control: form.control,
        name: "answers"
    });

    useEffect(() => {
        if (isOpen && sessionQuestionnaire) {
            let defaultDescription = "";
            let defaultAnswers = sessionQuestionnaire.questions.map(q => ({
                 questionId: q.id, 
                 answer: q.type === 'slider' ? q.min || 0 : "" 
            }));

            if (session.healthNotes) {
                try {
                    const parsedNotes = JSON.parse(session.healthNotes);
                    if (parsedNotes.treatment?.description) {
                        defaultDescription = parsedNotes.treatment.description;
                    }
                    if (parsedNotes.answers && Array.isArray(parsedNotes.answers)) {
                        defaultAnswers = sessionQuestionnaire.questions.map(q => {
                            const savedAnswer = parsedNotes.answers.find((a: any) => a.questionId === q.id);
                            return {
                                questionId: q.id,
                                answer: savedAnswer ? savedAnswer.answer : (q.type === 'slider' ? q.min || 0 : ""),
                            };
                        });
                    }
                } catch (e) {
                    // Could be plain text from an older version, ignore parsing error
                }
            }

            form.reset({
                treatmentDescription: defaultDescription,
                answers: defaultAnswers,
            });
        }
    }, [isOpen, form, sessionQuestionnaire, session]);


    const handleFormSubmit = (values: EndSessionFormValues) => {
        let existingNotes = {};
        try {
            if (session.healthNotes) {
                existingNotes = JSON.parse(session.healthNotes);
            }
        } catch (e) {
            // It might be a plain string, we'll overwrite it with the new structured format.
        }

        const healthNotes = JSON.stringify({
            ...existingNotes,
            treatment: {
                description: values.treatmentDescription,
            },
            answers: values.answers,
            questionnaireId: sessionQuestionnaire?.id,
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

                                {sessionQuestionnaire ? (
                                    <div className="space-y-4 pt-4 border-t">
                                        <h3 className="text-lg font-semibold">{sessionQuestionnaire.title}</h3>
                                        {fields.map((field, index) => {
                                            const question = sessionQuestionnaire.questions.find(q => q.id === field.questionId);
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
                                            <p>No session questionnaire found.</p>
                                            <Button variant="link" asChild>
                                                <Link href="/settings/session-questions">Create one in settings</Link>
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
