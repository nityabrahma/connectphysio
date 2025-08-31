
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { ExaminationDef } from "@/types/domain"
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
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
})

type ExaminationFormValues = z.infer<typeof formSchema>

interface ExaminationFormProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (values: Omit<ExaminationDef, 'id'>) => void;
    onDelete: (id: string) => void;
    examination?: ExaminationDef | null;
}

export function ExaminationForm({ isOpen, onOpenChange, onSubmit, onDelete, examination }: ExaminationFormProps) {
    const { user: currentUser } = useAuth();
    const isEditing = !!examination;
    
    const form = useForm<ExaminationFormValues>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        if (isOpen) {
            if (examination) {
                form.reset(examination);
            } else {
                form.reset({
                    name: "",
                    description: "",
                });
            }
        }
    }, [examination, form, isOpen]);

    const handleFormSubmit = (values: ExaminationFormValues) => {
        if (!currentUser) return;
        onSubmit({ ...values, centreId: currentUser.centreId });
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Examination' : 'Create New Examination'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Update the details of this examination.' : 'Fill in the details for the new examination.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto -mr-6 pr-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
                            <div className="space-y-4 py-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Examination Name</FormLabel>
                                            <FormControl><Input placeholder="E.g., Range of Motion Test" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description (Optional)</FormLabel>
                                            <FormControl><Textarea placeholder="Describe the examination..." {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex-col-reverse sm:flex-row sm:justify-between w-full pt-4 flex">
                                {isEditing && examination && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                    <Button type="button" variant="destructive">Delete Examination</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this examination.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => onDelete(examination.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                )}
                                <div className="flex justify-end ml-auto">
                                <Button type="submit">{isEditing ? 'Save Changes' : 'Create Examination'}</Button>
                                </div>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
