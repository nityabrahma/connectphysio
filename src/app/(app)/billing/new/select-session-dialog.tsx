
'use client';

import { useState, useMemo } from 'react';
import type { Patient, Session } from '@/types/domain';
import { useRealtimeDb } from '@/hooks/use-realtime-db';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface SelectSessionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelect: (session: Session) => void;
  patient: Patient;
}

export function SelectSessionDialog({ isOpen, onOpenChange, onSelect, patient }: SelectSessionDialogProps) {
  const [sessions] = useRealtimeDb<Record<string, Session>>('sessions', {});

  const patientSessions = useMemo(() => {
    return Object.values(sessions)
      .filter(s => s.patientId === patient.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sessions, patient.id]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select a Session for {patient.name}</DialogTitle>
          <DialogDescription>Choose a session to generate a bill for.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-2 py-4">
            {patientSessions.length > 0 ? (
              patientSessions.map(session => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onSelect(session)}
                >
                  <div>
                    <p className="font-semibold">
                      Session on {format(new Date(session.date), "MMMM d, yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {session.startTime} - {session.endTime}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">{session.status}</Badge>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>No sessions found for this patient.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
