
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { Patient, Session, Questionnaire } from "@/types/domain"
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
import { useEffect, useMemo, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LS_KEYS } from "@/lib/constants"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EndSessionFormProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (sessionId: string, healthNotes?: string) => void;
    session: Session;
    patient?: Patient;
}

export function EndSessionForm({ isOpen, onOpenChange, onSubmit, session, patient }: EndSessionFormProps) {
    const [questionnaires] = useLocalStorage<Questionnaire[]>(LS_KEYS.QUESTIONNAIRES, []);
    const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<string | null>(null);

    const activeQuestionnaire = useMemo(() => {
        return questionnaires.find(q => q.id === selectedQuestionnaireId) || null;
    }, [questionnaires, selectedQuestionnaireId]);

    const formSchema = useMemo(() => {
        if (!activeQuestionnaire) {
            return z.object({});
        }

        const schemaShape = activeQuestionnaire.questions.reduce((acc, q) => {
            let fieldSchema;
            switch (q.type) {
                case 'slider':
                    fieldSchema = z.array(z.number()).length(1, { message: 'Please select a value.'});
                    break;
                case 'text':
                default:
                    fieldSchema = z.string().min(1, { message: `${q.label} is required.` });
                    break;
            }
            return { ...acc, [q.id]: fieldSchema };
        }, {} as Record<string, any>);
        
        return z.object(schemaShape);

    }, [activeQuestionnaire]);

    const form = useForm({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        if (isOpen) {
            // Reset selection when modal opens
            setSelectedQuestionnaireId(null);
            form.reset({});
        }
    }, [isOpen, form]);

     useEffect(() => {
        if (activeQuestionnaire) {
            let defaultValues = {};
            try {
                if (session.healthNotes) {
                    defaultValues = JSON.parse(session.healthNotes);
                }
            } catch (e) {
                console.warn("Could not parse healthNotes from session", e);
            }
            
            const initialValues = activeQuestionnaire.questions.reduce((acc, q) => {
                const existingValue = (defaultValues as any)[q.id];
                if (existingValue) {
                    return { ...acc, [q.id]: existingValue };
                }

                switch (q.type) {
                    case 'slider':
                        return { ...acc, [q.id]: [q.min ?? 0] };
                    case 'text':
                    default:
                        return { ...acc, [q.id]: '' };
                }
            }, {});
            form.reset(initialValues);
        }
    }, [session, form, activeQuestionnaire]);

    const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
        const notes = JSON.stringify({
            questionnaireId: selectedQuestionnaireId,
            answers: values
        });
        onSubmit(session.id, notes);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Complete Session</DialogTitle>
                    <DialogDescription>
                        Fill out the questionnaire for {patient?.name}'s session before completing it.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 -mr-6 pr-6">
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Select a Questionnaire</Label>
                        <Select onValueChange={setSelectedQuestionnaireId} value={selectedQuestionnaireId || ""}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a form..." />
                            </SelectTrigger>
                            <SelectContent>
                                {questionnaires.map(q => (
                                    <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {activeQuestionnaire && (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 pt-4 border-t">
                                {activeQuestionnaire.questions.map(q => (
                                  <FormField
                                      key={q.id}
                                      control={form.control}
                                      name={q.id}
                                      render={({ field }) => (
                                          <FormItem>
                                              <FormLabel>{q.label}</FormLabel>
                                              <FormControl>
                                                  {q.type === 'slider' ? (
                                                       <div className="flex items-center gap-4">
                                                          <Slider
                                                              min={q.min}
                                                              max={q.max}
                                                              step={q.step}
                                                              onValueChange={(value) => field.onChange(value)}
                                                              value={field.value}
                                                              defaultValue={field.value}
                                                          />
                                                          <span className="text-sm font-semibold w-12 text-center">{field.value?.[0]}</span>
                                                      </div>
                                                  ) : (
                                                      <Textarea placeholder={q.placeholder || ''} {...field} />
                                                  )}
                                              </FormControl>
                                              <FormMessage />
                                          </FormItem>
                                      )}
                                  />
                                ))}
                            </form>
                        </Form>
                    )}
                  </div>
                </ScrollArea>
                <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end w-full pt-4 mt-auto">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="button" onClick={form.handleSubmit(handleFormSubmit)} disabled={!activeQuestionnaire}>Confirm & Complete</Button>
                 </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
