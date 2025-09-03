
'use client';

import { useMemo, useState, useEffect } from 'react';
import type { TreatmentDef, PackageDef } from '@/types/domain';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import SelectComponent from 'react-select';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TreatmentSelectorProps {
    availableTreatments: TreatmentDef[];
    selectedTreatments: TreatmentDef[];
    onSelectTreatments: (treatments: TreatmentDef[]) => void;
    patientPackage: PackageDef | null;
    availablePackages: PackageDef[];
    onGenerateBill: () => void;
}

export function TreatmentSelector({ 
    availableTreatments, 
    selectedTreatments, 
    onSelectTreatments, 
    patientPackage,
    availablePackages,
    onGenerateBill
}: TreatmentSelectorProps) {
    
    const [selectedPackageId, setSelectedPackageId] = useState<string>('none');
    const [numberOfSessions, setNumberOfSessions] = useState(1);

    useEffect(() => {
        if (patientPackage) {
            setSelectedPackageId(patientPackage.id);
        } else {
            setSelectedPackageId('none');
        }
    }, [patientPackage]);
    
    const selectedPackage = useMemo(() => {
        if (selectedPackageId === 'none') return null;
        return availablePackages.find(p => p.id === selectedPackageId) || null;
    }, [availablePackages, selectedPackageId]);

    useEffect(() => {
        if (selectedPackage) {
            setNumberOfSessions(selectedPackage.sessions);
        } else {
            setNumberOfSessions(1);
        }
    }, [selectedPackage]);

    const treatmentOptions = useMemo(() => {
        const selectedIds = new Set(selectedTreatments.map(t => t.id));
        return availableTreatments
            .filter(t => !selectedIds.has(t.id))
            .map(t => ({
                value: t.id,
                label: `${t.name} - ₹${t.price}`,
                treatment: t,
            }));
    }, [availableTreatments, selectedTreatments]);

    const handleSelectChange = (selectedOptions: any) => {
        const newTreatments = selectedOptions ? selectedOptions.map((option: any) => option.treatment) : [];
        onSelectTreatments(newTreatments);
    }

    const subtotal = useMemo(() => {
        return selectedTreatments.reduce((total, t) => total + t.price, 0);
    }, [selectedTreatments]);

    const totalBeforeDiscount = useMemo(() => subtotal * numberOfSessions, [subtotal, numberOfSessions]);

    const discountAmount = useMemo(() => {
        if (selectedPackage) {
            return (totalBeforeDiscount * selectedPackage.discountPercentage) / 100;
        }
        return 0;
    }, [totalBeforeDiscount, selectedPackage]);

    const grandTotal = useMemo(() => totalBeforeDiscount - discountAmount, [totalBeforeDiscount, discountAmount]);

    const handleRemoveTreatment = (treatmentId: string) => {
        onSelectTreatments(selectedTreatments.filter(t => t.id !== treatmentId));
    }

    const selectedOptions = selectedTreatments.map(t => ({
        value: t.id,
        label: `${t.name} - ₹${t.price}`,
        treatment: t,
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Treatments & Billing</CardTitle>
                <CardDescription>Add treatments, adjust sessions, and apply package discounts if available.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <SelectComponent
                    options={treatmentOptions}
                    isMulti
                    value={selectedOptions}
                    onChange={handleSelectChange}
                    placeholder="Search and add treatments..."
                    className="basic-multi-select"
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
                        <span className="text-muted-foreground">Subtotal per Session</span>
                        <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="sessions-count">No of sessions</Label>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setNumberOfSessions(Math.max(1, numberOfSessions - 1))}>
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-bold text-lg w-10 text-center">{numberOfSessions}</span>
                             <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setNumberOfSessions(numberOfSessions + 1)}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Total Before Discount</span>
                        <span className="font-medium">₹{totalBeforeDiscount.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                         <div className="w-1/2">
                            <Label htmlFor="package-discount">Package Discount</Label>
                            <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                                <SelectTrigger id="package-discount">
                                    <SelectValue placeholder="No Discount" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Discount</SelectItem>
                                    {availablePackages.map(p => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name} ({p.discountPercentage}%)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <span className="font-medium text-destructive">- ₹{discountAmount.toFixed(2)}</span>
                    </div>
                    
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
