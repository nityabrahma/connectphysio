
'use client';

import { useMemo, useState } from 'react';
import type { TreatmentDef, PackageDef } from '@/types/domain';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Select from 'react-select';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2 } from 'lucide-react';

interface TreatmentSelectorProps {
    availableTreatments: TreatmentDef[];
    selectedTreatments: TreatmentDef[];
    onSelectTreatments: (treatments: TreatmentDef[]) => void;
    patientPackage: PackageDef | null;
    onGenerateBill: () => void;
}

export function TreatmentSelector({ 
    availableTreatments, 
    selectedTreatments, 
    onSelectTreatments, 
    patientPackage,
    onGenerateBill
}: TreatmentSelectorProps) {
    
    const [applyDiscount, setApplyDiscount] = useState(false);

    const treatmentOptions = useMemo(() => {
        // Filter out already selected treatments from the dropdown
        const selectedIds = new Set(selectedTreatments.map(t => t.id));
        return availableTreatments
            .filter(t => !selectedIds.has(t.id))
            .map(t => ({
                value: t.id,
                label: `${t.name} - ₹${t.price}`,
                treatment: t,
            }));
    }, [availableTreatments, selectedTreatments]);

    const selectedOptions = useMemo(() => {
        return selectedTreatments.map(t => ({
             value: t.id,
            label: `${t.name} - ₹${t.price}`,
            treatment: t,
        }));
    }, [selectedTreatments]);

    const subtotal = useMemo(() => {
        return selectedTreatments.reduce((total, t) => total + t.price, 0);
    }, [selectedTreatments]);

    const discountAmount = useMemo(() => {
        if (applyDiscount && patientPackage) {
            return (subtotal * patientPackage.discountPercentage) / 100;
        }
        return 0;
    }, [subtotal, applyDiscount, patientPackage]);

    const grandTotal = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount]);

    const handleSelectChange = (selectedOption: any) => {
        if (selectedOption) {
            onSelectTreatments([...selectedTreatments, selectedOption.treatment]);
        }
    }

    const handleRemoveTreatment = (treatmentId: string) => {
        onSelectTreatments(selectedTreatments.filter(t => t.id !== treatmentId));
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Treatments & Billing</CardTitle>
                <CardDescription>Add treatments and apply package discounts if available.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <Select
                    options={treatmentOptions}
                    value={null} // Controlled externally, reset after each selection
                    onChange={handleSelectChange}
                    placeholder="Search and add treatments..."
                    className="basic-single"
                    classNamePrefix="select"
                 />

                {selectedTreatments.length > 0 && (
                    <div className="rounded-md border mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Treatment</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedTreatments.map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell className="font-medium">{t.name}</TableCell>
                                        <TableCell className="text-right">₹{t.price.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveTreatment(t.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}


                <Separator />

                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>

                    {patientPackage && (
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Switch 
                                    id="apply-discount" 
                                    checked={applyDiscount} 
                                    onCheckedChange={setApplyDiscount} 
                                    disabled={selectedTreatments.length === 0}
                                />
                                <Label htmlFor="apply-discount">
                                    Apply Package Discount ({patientPackage.discountPercentage}%)
                                </Label>
                            </div>
                            <span className="font-medium text-destructive">- ₹{discountAmount.toFixed(2)}</span>
                        </div>
                    )}

                    <Separator />

                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Grand Total</span>
                        <span>₹{grandTotal.toFixed(2)}</span>
                    </div>
                </div>
            </CardContent>
             <CardFooter className="flex justify-end">
                <Button onClick={onGenerateBill} disabled={selectedTreatments.length === 0}>
                    Generate Bill
                </Button>
            </CardFooter>
        </Card>
    )
}
