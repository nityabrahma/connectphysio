
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import type { TreatmentDef } from '@/types/domain';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, X } from 'lucide-react';

interface TreatmentSelectorProps {
    availableTreatments: TreatmentDef[];
    selectedTreatments: TreatmentDef[];
    onSelectTreatments: (treatments: TreatmentDef[]) => void;
}

export function TreatmentSelector({ availableTreatments, selectedTreatments, onSelectTreatments }: TreatmentSelectorProps) {
    const [inputValue, setInputValue] = useState('');
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredTreatments = useMemo(() => {
        if (!inputValue) return [];
        return availableTreatments.filter(def => 
            def.name.toLowerCase().includes(inputValue.toLowerCase()) &&
            !selectedTreatments.find(t => t.id === def.id)
        );
    }, [inputValue, availableTreatments, selectedTreatments]);
    
    useEffect(() => {
        if (inputValue.length > 0 && filteredTreatments.length > 0) {
            setIsPopoverOpen(true);
        } else {
            setIsPopoverOpen(false);
        }
    }, [inputValue, filteredTreatments]);

    const totalCharges = useMemo(() => {
        return selectedTreatments.reduce((total, t) => total + t.price, 0);
    }, [selectedTreatments]);

    const handleSelectTreatment = (treatmentDef: TreatmentDef) => {
        onSelectTreatments([...selectedTreatments, treatmentDef]);
        setInputValue('');
        inputRef.current?.focus();
    }
    
    const handleRemoveTreatment = (treatmentId: string) => {
        onSelectTreatments(selectedTreatments.filter(t => t.id !== treatmentId));
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Treatments</CardTitle>
                <CardDescription>Add the treatments performed in this session to the bill.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Input 
                            ref={inputRef}
                            placeholder="Search and add treatments..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                        <Command>
                            <CommandEmpty>No treatment found.</CommandEmpty>
                            <CommandGroup>
                            {filteredTreatments.map((def) => (
                                <CommandItem
                                    key={def.id}
                                    onSelect={() => handleSelectTreatment(def)}
                                    value={def.name}
                                    className="flex justify-between"
                                >
                                <span>{def.name}</span>
                                <span className="text-muted-foreground">₹{def.price}</span>
                                </CommandItem>
                            ))}
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>

                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Treatment</TableHead>
                                <TableHead className="text-right">Price (₹)</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {selectedTreatments.length > 0 ? (
                                selectedTreatments.map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell className="font-medium">{t.name}</TableCell>
                                        <TableCell className="text-right">{t.price.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveTreatment(t.id)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                        No treatments added yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell className="font-semibold">Total</TableCell>
                                <TableCell className="text-right font-semibold">₹{totalCharges.toFixed(2)}</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
