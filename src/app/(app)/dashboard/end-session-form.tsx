
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import type { Patient, Session, TreatmentPlan, Questionnaire, Treatment, TreatmentDef } from "@/types/domain"
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
import { useEffect, useMemo, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"
import { Slider } from "@/components/ui/slider"
import Link from "next/link"
import { useRealtimeDb } from "@/hooks/use-realtime-db"
import { Label } from "@/components/ui/label"
import SelectComponent from "react-select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"


const answerSchema = z.object({
  questionId: z.string(),
  answer: z.any(),
});

const formSchema = z.object({
    answers: z.array(answerSchema),
});

type EndSessionFormValues = z.infer<typeof formSchema>;

interface EndSessionFormProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (sessionId: string, healthNotes: string, treatment: Omit<Treatment, 'date'>) => void;
    session: Session;
    patient?: Patient;
}

export function EndSessionForm({ isOpen, onOpenChange, onSubmit, session, patient }: EndSessionFormProps) {
    const { user } = useAuth();
    const [treatmentPlans] = useRealtimeDb<Record<string, TreatmentPlan>>('treatmentPlans', {});
    const [questionnaires] = useRealtimeDb<Record<string, Questionnaire>>('sessionQuestionnaires', {});
    const [treatmentDefs] = useRealtimeDb<Record<string, TreatmentDef>>('treatmentDefs', {});
    
    const [selectedTreatments, setSelectedTreatments] = useState<TreatmentDef[]>([]);

    const sessionQuestionnaire = useMemo(() => {
        return Object.values(questionnaires).find(q => q.centreId === user?.centreId);
    }, [questionnaires, user]);

    const centreTreatmentDefs = useMemo(() => Object.values(treatmentDefs).filter(t => t.centreId === user?.centreId), [treatmentDefs, user]);
    
    const activeTreatmentPlan = useMemo(() => {
        if (!patient) return null;
        const patientPlans = Object.values(treatmentPlans).filter(tp => tp.patientId === patient.id);
        return patientPlans.find(tp => tp.isActive) || patientPlans[0] || null;
    }, [treatmentPlans, patient]);
    
    const treatmentOptions = useMemo(() => {
        return centreTreatmentDefs.map(t => ({
          value: t.id,
          label: `${t.name} - ₹${t.price}`,
          treatment: t,
        }));
    }, [centreTreatmentDefs]);
      
    const selectedOptions = selectedTreatments.map(t => ({
        value: t.id,
        label: `${t.name} - ₹${t.price}`,
        treatment: t,
    }));
    
    const totalCharges = useMemo(() => {
        return selectedTreatments.reduce((total, t) => total + t.price, 0);
    }, [selectedTreatments]);

    const form = useForm<EndSessionFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            answers: [],
        }
    });
    
     const { fields } = useFieldArray({
        control: form.control,
        name: "answers"
    });

    useEffect(() => {
        if (isOpen && sessionQuestionnaire) {
            let defaultAnswers = sessionQuestionnaire.questions.map(q => ({
                 questionId: q.id, 
                 answer: q.type === 'slider' ? q.min || 0 : "" 
            }));

            if (session.healthNotes) {
                try {
                    const parsedNotes = JSON.parse(session.healthNotes);
                    if (parsedNotes.treatments && Array.isArray(parsedNotes.treatments)) {
                         const matchingDefs = parsedNotes.treatments.map((name: string) => centreTreatmentDefs.find(def => def.name === name)).filter(Boolean) as TreatmentDef[];
                        setSelectedTreatments(matchingDefs);
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
            } else {
                setSelectedTreatments([]);
            }

            form.reset({
                answers: defaultAnswers,
            });
        }
    }, [isOpen, form, sessionQuestionnaire, session, centreTreatmentDefs]);


    const handleFormSubmit = (values: EndSessionFormValues) => {
        const healthNotes = JSON.stringify({
            treatments: selectedTreatments.map(t => t.name),
            answers: values.answers,
            questionnaireId: sessionQuestionnaire?.id,
        });
        
        const newTreatment = {
            treatments: selectedTreatments.map(t => t.name),
            charges: totalCharges,
        };

        onSubmit(session.id, healthNotes, newTreatment);
    }
    
    const handleSelectChange = (selectedOptions: any) => {
        const newTreatments = selectedOptions ? selectedOptions.map((option: any) => option.treatment) : [];
        setSelectedTreatments(newTreatments);
    };

    const handleRemoveTreatment = (treatmentId: string) => {
        setSelectedTreatments(prev => prev.filter(t => t.id !== treatmentId));
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
                                    <div className="space-y-4">
                                        <SelectComponent
                                            options={treatmentOptions}
                                            isMulti
                                            value={selectedOptions}
                                            onChange={handleSelectChange}
                                            placeholder="Search and add treatments..."
                                            className="basic-multi-select"
                                            classNamePrefix="select"
                                        />

                                        <div className="space-y-2">
                                            <Label>Selected Treatments</Label>
                                            {selectedTreatments.length > 0 ? (
                                                <div className="flex flex-col gap-2 pt-2">
                                                    {selectedTreatments.map(t => (
                                                        <Badge key={t.id} variant="secondary" className="flex items-center justify-between py-1.5 px-2">
                                                            <div className="flex items-center gap-2">
                                                                <button type="button" onClick={() => handleRemoveTreatment(t.id)} className="rounded-full hover:bg-muted-foreground/20">
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                                <span>{t.name}</span>
                                                            </div>
                                                            <span>₹{t.price}</span>
                                                        </Badge>
                                                    ))}
                                                    <div className="flex justify-between items-center pt-2 mt-2 border-t font-semibold">
                                                        <span>Total</span>
                                                        <span>₹{totalCharges}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground pt-2">No treatments selected yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {sessionQuestionnaire ? (
                                    <div className="space-y-4 pt-4 border-t">
                                        <h3 className="text-lg font-semibold">{sessionQuestionnaire.name}</h3>
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

    