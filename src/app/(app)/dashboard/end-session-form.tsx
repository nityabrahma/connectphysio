
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { Patient, Session } from "@/types/domain"
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
import { useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

const formSchema = z.object({
  healthNotes: z.string().optional(),
})

type EndSessionFormValues = z.infer<typeof formSchema>

interface EndSessionFormProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (sessionId: string, healthNotes: string) => void;
    session: Session;
    patient?: Patient;
}

export function EndSessionForm({ isOpen, onOpenChange, onSubmit, session, patient }: EndSessionFormProps) {
    const form = useForm<EndSessionFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            healthNotes: session.healthNotes || "",
        }
    });

    useEffect(() => {
        if (isOpen) {
            form.reset({
                healthNotes: session.healthNotes || "",
            });
        }
    }, [session, form, isOpen]);

    const handleFormSubmit = (values: EndSessionFormValues) => {
        onSubmit(session.id, values.healthNotes || "");
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Complete Session</DialogTitle>
                    <DialogDescription>
                        Update health notes for {patient?.name}'s session before completing it.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 -mr-6 pr-6">
                  <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
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
