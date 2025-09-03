
'use client';

import { useMemo } from 'react';
import type { TreatmentDef } from '@/types/domain';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Select from 'react-select';

interface TreatmentSelectorProps {
    availableTreatments: TreatmentDef[];
    selectedTreatments: TreatmentDef[];
    onSelectTreatments: (treatments: TreatmentDef[]) => void;
}

export function TreatmentSelector({ availableTreatments, selectedTreatments, onSelectTreatments }: TreatmentSelectorProps) {
    
    const treatmentOptions = useMemo(() => {
        return availableTreatments.map(t => ({
            value: t.id,
            label: `${t.name} - ₹${t.price}`,
            treatment: t,
        }));
    }, [availableTreatments]);

    const selectedOptions = useMemo(() => {
        return selectedTreatments.map(t => ({
             value: t.id,
            label: `${t.name} - ₹${t.price}`,
            treatment: t,
        }));
    }, [selectedTreatments]);

    const totalCharges = useMemo(() => {
        return selectedTreatments.reduce((total, t) => total + t.price, 0);
    }, [selectedTreatments]);

    const handleSelectChange = (selectedOptions: any) => {
        const selected = selectedOptions ? selectedOptions.map((opt: any) => opt.treatment) : [];
        onSelectTreatments(selected);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Treatments</CardTitle>
                <CardDescription>Add the treatments performed in this session to the bill.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Select
                    isMulti
                    options={treatmentOptions}
                    value={selectedOptions}
                    onChange={handleSelectChange}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder="Search and add treatments..."
                 />

                <div className="flex justify-end items-center pt-4 border-t">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-lg font-bold ml-2">₹{totalCharges.toFixed(2)}</span>
                </div>
            </CardContent>
        </Card>
    )
}
