
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { User } from "@/types/domain"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { ScrollArea } from "@/components/ui/scroll-area"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phone: z.string().optional(),
  role: z.enum(["receptionist", "therapist"]),
  password: z.string().optional(),
})

type UserFormValues = z.infer<typeof formSchema>

interface UserFormProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (values: UserFormValues & { centreId: string }) => void;
    user?: User;
}

export function UserForm({ isOpen, onOpenChange, onSubmit, user }: UserFormProps) {
    const { user: currentUser } = useAuth();
    const isEditing = !!user;

    const form = useForm<UserFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            role: "therapist",
            password: "",
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (user) {
                form.reset({
                    name: user.name,
                    email: user.email,
                    phone: user.phone || "",
                    role: user.role === 'admin' ? 'therapist' : user.role, // Should not happen but as fallback
                    password: "",
                });
            } else {
                form.reset({
                    name: "",
                    email: "",
                    phone: "",
                    role: "therapist",
                    password: "",
                });
            }
        }
    }, [user, form, isOpen]);


    const finalFormSchema = isEditing
    ? formSchema.extend({
        password: z.string().min(6, "Password must be at least 6 characters.").optional().or(z.literal('')),
      })
    : formSchema.extend({
        password: z.string().min(6, "Password is required and must be at least 6 characters."),
      });

    const handleFormSubmit = (values: UserFormValues) => {
        if (!currentUser) return;
        onSubmit({ ...values, centreId: currentUser.centreId });
    }


    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit User' : 'Add New User'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Update the details of the existing user.' : 'Enter the details for the new user.'}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 -mr-6 pr-6 overflow-y-auto">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="user@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="555-123-4567" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="receptionist">Receptionist</SelectItem>
                                                <SelectItem value="therapist">Therapist</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{isEditing ? "New Password (Optional)" : "Password"}</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder={isEditing ? "Leave blank to keep current" : "••••••••"} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </ScrollArea>
                 <DialogFooter className="mt-auto pt-4">
                    <Button type="button" onClick={form.handleSubmit(handleFormSubmit)}>{isEditing ? 'Save Changes' : 'Create User'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
