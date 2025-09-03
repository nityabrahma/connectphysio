
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import type { TreatmentDef } from '@/types/domain';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

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
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && inputValue === "" && selectedTreatments.length > 0) {
          handleRemoveTreatment(selectedTreatments[selectedTreatments.length - 1].id);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Treatments</CardTitle>
                <CardDescription>Add the treatments performed in this session to the bill.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                         <div className="flex flex-wrap gap-2 items-center p-2 border rounded-md min-h-10">
                            {selectedTreatments.map(t => (
                                <Badge key={t.id} variant="secondary" className="gap-1.5">
                                    {t.name}
                                    <button
                                        className="rounded-full hover:bg-muted-foreground/20"
                                        onClick={() => handleRemoveTreatment(t.id)}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                            <Input 
                                ref={inputRef}
                                placeholder={selectedTreatments.length === 0 ? "Search and add treatments..." : ""}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="border-0 shadow-none focus-visible:ring-0 h-auto p-0 flex-1 min-w-[120px]"
                            />
                        </div>
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

                <div className="flex justify-end items-center pt-4 border-t">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-lg font-bold ml-2">₹{totalCharges.toFixed(2)}</span>
                </div>
            </CardContent>
        </Card>
    )
}
