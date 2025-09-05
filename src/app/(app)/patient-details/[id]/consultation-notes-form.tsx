
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import type { Questionnaire, TreatmentPlan } from "@/types/domain"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useEffect, useMemo } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Stethoscope } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const answerSchema = z.object({
  questionId: z.string(),
  answer: z.any(),
});

const formSchema = z.object({
  medicalHistory: z.string().optional(),
  answers: z.array(answerSchema),
})

export type ConsultationNotesFormValues = z.infer<typeof formSchema>

interface ConsultationNotesFormProps {
    questionnaire: Questionnaire;
    treatmentPlan: TreatmentPlan | null;
    initialMedicalHistory: string;
    onUpdate: (notes: string, medicalHistory: string) => void;
}

export function ConsultationNotesForm({ questionnaire, treatmentPlan, initialMedicalHistory, onUpdate }: ConsultationNotesFormProps) {
    
    const defaultValues = useMemo(() => {
        const answers = questionnaire.questions.map(q => {
            let existingAnswer = q.type === 'slider' ? q.min || 0 : "";
            if (treatmentPlan?.clinicalNotes) {
                try {
                    const parsedNotes = JSON.parse(treatmentPlan.clinicalNotes);
                    if(parsedNotes.answers) {
                        const savedAnswer = parsedNotes.answers.find((a: { questionId: string }) => a.questionId === q.id);
                        if (savedAnswer) {
                            existingAnswer = savedAnswer.answer;
                        }
                    }
                } catch (e) {
                    // Ignore parsing errors, likely old format
                }
            }
            return { questionId: q.id, answer: existingAnswer };
        });
        return { answers, medicalHistory: initialMedicalHistory };
    }, [questionnaire, treatmentPlan, initialMedicalHistory]);

    const form = useForm<ConsultationNotesFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });
    
    useEffect(() => {
        form.reset(defaultValues);
    }, [defaultValues, form]);


    const handleFormSubmit = (values: ConsultationNotesFormValues) => {
       if (!treatmentPlan) return;
       
       const newClinicalNotes = JSON.stringify({ answers: values.answers, questionnaireId: questionnaire.id });
       onUpdate(newClinicalNotes, values.medicalHistory || "");
    }
    
    const { fields } = useFieldArray({
        control: form.control,
        name: "answers"
    });

    if (!treatmentPlan) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Stethoscope size={20}/>Clinical Notes</CardTitle>
                    <CardDescription>
                        Medical history and notes for the selected treatment plan.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                        <p>No active treatment plan. Please create one to add notes.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="flex-1 flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Stethoscope size={20}/>Clinical Notes</CardTitle>
                <CardDescription>
                    Update the patient's medical history and the clinical notes for this treatment plan.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="medicalHistory"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-semibold">Past Medical History</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="E.g., Diabetes, Hypertension, previous surgeries..." {...field} rows={4} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator />

                        <div className="space-y-6">
                            {fields.map((field, index) => {
                                const question = questionnaire.questions.find(q => q.id === field.questionId);
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

                        <div className="flex justify-end pt-4">
                            <Button type="submit">Save Clinical Notes</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
