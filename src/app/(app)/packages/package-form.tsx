
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { PackageDef } from "@/types/domain"
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
import { ScrollArea } from "@/components/ui/scroll-area"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  sessions: z.coerce.number().int().positive("Must be a positive number."),
  durationDays: z.coerce.number().int().positive("Must be a positive number."),
  discountPercentage: z.coerce.number().min(0, "Discount must be positive.").max(100, "Discount cannot exceed 100."),
})

type PackageFormValues = z.infer<typeof formSchema>

interface PackageFormProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (values: Omit<PackageDef, 'id'>) => void;
    onDelete: (packageId: string) => void;
    pkg?: PackageDef | null;
}

export function PackageForm({ isOpen, onOpenChange, onSubmit, onDelete, pkg }: PackageFormProps) {
    const { user: currentUser } = useAuth();
    const isEditing = !!pkg;
    
    const form = useForm<PackageFormValues>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        if (isOpen) {
            if (pkg) {
                form.reset(pkg);
            } else {
                form.reset({
                    name: "",
                    sessions: 0,
                    durationDays: 0,
                    discountPercentage: 0,
                });
            }
        }
    }, [pkg, form, isOpen]);

    const handleFormSubmit = (values: PackageFormValues) => {
        if (!currentUser) return;
        onSubmit({ ...values, centreId: currentUser.centreId });
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Package' : 'Create New Package'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Update the details of this package.' : 'Fill in the details for the new package.'}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 -mr-6 pr-6">
                  <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
                          <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Package Name</FormLabel>
                                      <FormControl><Input placeholder="E.g., 10-Session Pack" {...field} /></FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={form.control}
                              name="sessions"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Number of Sessions</FormLabel>
                                      <FormControl><Input type="number" {...field} /></FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={form.control}
                              name="durationDays"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Duration (in days)</FormLabel>
                                      <FormControl><Input type="number" {...field} /></FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={form.control}
                              name="discountPercentage"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Discount (%)</FormLabel>
                                      <FormControl><Input type="number" step="1" {...field} /></FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                      </form>
                  </Form>
                </ScrollArea>
                <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between w-full pt-4 mt-auto">
                    {isEditing && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                         <Button type="button" variant="destructive">Delete Package</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this package definition.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => onDelete(pkg.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    <div className="flex justify-end ml-auto">
                      <Button type="button" onClick={form.handleSubmit(handleFormSubmit)}>{isEditing ? 'Save Changes' : 'Create Package'}</Button>
                    </div>
                 </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
