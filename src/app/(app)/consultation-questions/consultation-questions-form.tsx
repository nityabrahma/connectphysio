
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import type { Questionnaire, Question } from "@/types/domain"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { PlusCircle, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateId } from "@/lib/ids"

const questionSchema = z.object({
    id: z.string(),
    label: z.string().min(1, "Question label is required."),
    type: z.enum(['text', 'slider']),
    placeholder: z.string().optional(),
    min: z.coerce.number().optional(),
    max: z.coerce.number().optional(),
    step: z.coerce.number().optional(),
});

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  questions: z.array(questionSchema),
})

export type ConsultationQuestionsFormValues = z.infer<typeof formSchema>

interface ConsultationQuestionsFormProps {
    onSubmit: (values: Omit<Questionnaire, 'id' | 'createdAt'>) => void;
    onDelete?: (id: string) => void;
    formDef?: Questionnaire | null;
}

const defaultQuestions: Omit<Question, 'id'>[] = [
    { label: "Pain Intensity (0-10)", type: 'slider', min: 0, max: 10, step: 1 },
    { label: "Treatments Done", type: 'text', placeholder: "e.g., Ultrasound, IFT, Hot Pack" },
    { label: "Range of Motion", type: 'text', placeholder: "e.g., Improved, Unchanged" },
    { label: "Follow-up Plan", type: 'text', placeholder: "e.g., Continue with exercises, Re-assess next session" }
];

export function ConsultationQuestionsForm({ onSubmit, onDelete, formDef }: ConsultationQuestionsFormProps) {
    const { user: currentUser } = useAuth();
    const isEditing = !!formDef;
    
    const form = useForm<ConsultationQuestionsFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            questions: [],
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "questions"
    });

    useEffect(() => {
        if (formDef) {
            form.reset(formDef);
        } else {
            form.reset({
                title: "Default Follow-up Form",
                questions: defaultQuestions.map(q => ({...q, id: generateId()})),
            });
        }
    }, [formDef, form]);

    const handleFormSubmit = (values: ConsultationQuestionsFormValues) => {
        if (!currentUser) return;
        onSubmit({ ...values, centreId: currentUser.centreId });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Form Title</FormLabel>
                            <FormControl><Input placeholder="E.g., Post-Session Follow-up" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <div className="space-y-4 pt-4 border-t">
                    <FormLabel>Questions</FormLabel>
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                                <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon"
                                className="absolute top-2 right-2 h-7 w-7 text-destructive"
                                onClick={() => remove(index)}
                            >
                                <Trash2 size={16} />
                            </Button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name={`questions.${index}.label`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Question Label</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`questions.${index}.type`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="text">Text</SelectItem>
                                                    <SelectItem value="slider">Slider</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {form.watch(`questions.${index}.type`) === 'slider' && (
                                <div className="grid grid-cols-3 gap-4">
                                        <FormField
                                        control={form.control}
                                        name={`questions.${index}.min`}
                                        render={({ field }) => (
                                            <FormItem><FormLabel>Min</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                                        )}
                                    />
                                        <FormField
                                        control={form.control}
                                        name={`questions.${index}.max`}
                                        render={({ field }) => (
                                            <FormItem><FormLabel>Max</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                                        )}
                                    />
                                        <FormField
                                        control={form.control}
                                        name={`questions.${index}.step`}
                                        render={({ field }) => (
                                            <FormItem><FormLabel>Step</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                    <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => append({ id: generateId(), label: '', type: 'text' })}
                    >
                        <PlusCircle /> Add Question
                    </Button>
                </div>

                <div className="flex justify-between items-center pt-4">
                    {isEditing && formDef && onDelete && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <Button type="button" variant="destructive">Delete Form</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this form.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => onDelete(formDef.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    <div className="flex justify-end gap-2 ml-auto">
                        <Button type="submit">{isEditing ? 'Save Changes' : 'Create Form'}</Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}
