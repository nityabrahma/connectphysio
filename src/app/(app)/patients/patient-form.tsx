
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Patient } from "@/types/domain";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
  age: z.coerce.number().int().positive().optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional(),
  address: z.string().optional(),
  hasPastMedicalHistory: z.boolean().default(false),
  pastMedicalHistory: z.string().optional(),
  notes: z.string().optional(),
  initialTreatmentPlanName: z.string(),
});

export type PatientFormValues = z.infer<typeof formSchema>;

interface PatientFormProps {
  onSubmit: (values: PatientFormValues & { centreId: string, initialTreatmentPlanName: string }) => void;
  patient?: Patient;
}

export function PatientForm({ onSubmit, patient }: PatientFormProps) {
  const { user: currentUser } = useAuth();
  const isEditing = !!patient;
  
  const [showPastMedicalHistory, setShowPastMedicalHistory] = useState(false);

  const dynamicSchema = isEditing
    ? formSchema.extend({ initialTreatmentPlanName: z.string().optional() })
    : formSchema.extend({ initialTreatmentPlanName: z.string().min(1, "Initial treatment plan name is required.") });


  const form = useForm<PatientFormValues>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      age: "",
      gender: undefined,
      address: "",
      hasPastMedicalHistory: false,
      pastMedicalHistory: "",
      notes: "",
      initialTreatmentPlanName: ""
    },
  });
  
  const hasHistory = form.watch('hasPastMedicalHistory');

  useEffect(() => {
    setShowPastMedicalHistory(hasHistory);
    if(!hasHistory) {
        form.setValue('pastMedicalHistory', '');
    }
  }, [hasHistory, form]);

  useEffect(() => {
    if (patient) {
      const hasHistory = !!patient.pastMedicalHistory;
      form.reset({
        ...patient,
        age: patient.age || "",
        email: patient.email || "",
        hasPastMedicalHistory: hasHistory,
      });
      setShowPastMedicalHistory(hasHistory);
    }
  }, [patient, form]);

  const handleFormSubmit = (values: PatientFormValues) => {
    if (!currentUser) return;

    const submissionValues = {
        ...values,
        pastMedicalHistory: values.hasPastMedicalHistory ? values.pastMedicalHistory : "No past medical history.",
    };
    
    onSubmit({ ...submissionValues, centreId: currentUser.centreId, initialTreatmentPlanName: values.initialTreatmentPlanName || "" });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="35" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" {...field} />
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
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="555-123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="123 Main St, Anytown..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {!isEditing && (
            <>
             <FormField
                control={form.control}
                name="initialTreatmentPlanName"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Initial Treatment Plan Name</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g., Post-Surgery Knee Rehab" {...field} />
                    </FormControl>
                     <p className="text-sm text-muted-foreground">
                        Create an initial treatment plan for this patient. You can add more details later.
                    </p>
                    <FormMessage />
                </FormItem>
                )}
            />
            </>
        )}
        
        <FormField
            control={form.control}
            name="hasPastMedicalHistory"
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <FormLabel className="text-base">
                    Past Medical History
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                        Does the patient have any relevant past medical history?
                    </p>
                </div>
                <FormControl>
                    <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    />
                </FormControl>
                </FormItem>
            )}
        />

        {showPastMedicalHistory && (
            <FormField
                control={form.control}
                name="pastMedicalHistory"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Details of Past Medical History</FormLabel>
                    <FormControl>
                        <Textarea placeholder="E.g., Diabetes, BP..." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        )}
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Internal Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Internal notes about the patient..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button type="submit">
            {isEditing ? "Save Changes" : "Create Patient"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
