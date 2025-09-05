
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import type { Patient, Session, TreatmentPlan, Treatment, TreatmentDef } from "@/types/domain"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRealtimeDb } from "@/hooks/use-realtime-db"
import { Label } from "@/components/ui/label"
import SelectComponent from "react-select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface EndSessionFormProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (sessionId: string, treatment: Omit<Treatment, 'date'>) => void;
    session: Session;
    patient?: Patient;
}

export function EndSessionForm({ isOpen, onOpenChange, onSubmit, session, patient }: EndSessionFormProps) {
    const { user } = useAuth();
    const [treatmentPlans] = useRealtimeDb<Record<string, TreatmentPlan>>('treatmentPlans', {});
    const [treatmentDefs] = useRealtimeDb<Record<string, TreatmentDef>>('treatmentDefs', {});
    
    const [selectedTreatments, setSelectedTreatments] = useState<TreatmentDef[]>([]);

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

    useEffect(() => {
        if (!isOpen) {
            setSelectedTreatments([]);
        }
    }, [isOpen]);

    const handleFormSubmit = () => {
        const newTreatment = {
            treatments: selectedTreatments.map(t => t.name),
            charges: totalCharges,
        };

        onSubmit(session.id, newTreatment);
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
            <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Complete Session</DialogTitle>
                    <DialogDescription>
                        Add any treatments performed during this session for {patient?.name}.
                        This will be added to the treatment plan: <span className="font-semibold">{activeTreatmentPlan?.name}</span>
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto -mr-6 pr-6">
                    <div className="space-y-4 py-4">
                        <div>
                            <h3 className="text-base font-semibold mb-2">Treatment Information</h3>
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
                    </div>
                    <div className="flex-col-reverse sm:flex-row sm:justify-end w-full pt-4 flex gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button onClick={handleFormSubmit} disabled={!activeTreatmentPlan}>
                            {activeTreatmentPlan ? 'Confirm & Complete' : 'No Active Plan'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
