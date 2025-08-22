
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
import { useEffect, useMemo } from "react"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LS_KEYS } from "@/lib/constants"

interface EndSessionFormProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (sessionId: string, healthNotes?: string) => void;
    session: Session;
    patient?: Patient;
}

export function EndSessionForm({ isOpen, onOpenChange, onSubmit, session, patient }: EndSessionFormProps) {
    const [questionnaires] = useLocalStorage<Questionnaire[]>(LS_KEYS.QUESTIONNAIRES, []);
    
    // For now, let's assume the first questionnaire is the one to use.
    // In a real app, this could be linked to the session or centre.
    const activeQuestionnaire = questionnaires[0]; 
    
    const formSchema = useMemo(() => {
        if (!activeQuestionnaire) {
            return z.object({
                healthNotes: z.string().min(1, "Health notes are required to complete the session."),
            });
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
            let defaultValues = {};
            try {
                if (session.healthNotes) {
                    defaultValues = JSON.parse(session.healthNotes);
                }
            } catch (e) {
                console.warn("Could not parse healthNotes from session", e);
            }
            
            if (activeQuestionnaire) {
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
            } else {
                 form.reset({
                    healthNotes: session.healthNotes || "",
                });
            }
        }
    }, [session, form, isOpen, activeQuestionnaire]);

    const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
        const notes = JSON.stringify(values);
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
                  <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 py-4">
                          {!activeQuestionnaire ? (
                             <FormField
                              control={form.control}
                              name="healthNotes"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Health Notes</FormLabel>
                                      <FormControl>
                                        <Textarea 
                                            placeholder="Enter session notes here..." 
                                            {...field}
                                            rows={5} 
                                        />
                                    </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                            />
                          ) : (
                              activeQuestionnaire.questions.map(q => (
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
                              ))
                          )}
                      </form>
                  </Form>
                </ScrollArea>
                <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end w-full pt-4 mt-auto">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="button" onClick={form.handleSubmit(handleFormSubmit)}>Confirm & Complete</Button>
                 </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
