
'use client';

import { useState, useMemo } from 'react';
import type { Patient } from '@/types/domain';
import { usePatients } from '@/hooks/use-patients';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface SelectPatientDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelect: (patient: Patient) => void;
}

export function SelectPatientDialog({ isOpen, onOpenChange, onSelect }: SelectPatientDialogProps) {
  const { patients } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = useMemo(() => {
    return patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select a Patient</DialogTitle>
          <DialogDescription>Search for and choose a patient to bill.</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-2 py-4">
            {filteredPatients.length > 0 ? (
              filteredPatients.map(patient => (
                <div
                  key={patient.id}
                  className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onSelect(patient)}
                >
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(patient.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{patient.name}</p>
                    <p className="text-sm text-muted-foreground">{patient.email}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>No patients found.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
