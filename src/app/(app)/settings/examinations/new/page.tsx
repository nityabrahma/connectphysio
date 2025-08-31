
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { ExaminationDef } from '@/types/domain';
import { useToast } from '@/hooks/use-toast';
import { generateId } from '@/lib/ids';
import { useRealtimeDb } from '@/hooks/use-realtime-db';
import { useAuth } from '@/hooks/use-auth';
import { useMemo, useEffect } from 'react';
import { ExaminationForm } from '../examination-form';

export default function NewExaminationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [examinationDefs, setExaminationDefs] = useRealtimeDb<Record<string, ExaminationDef>>('examinationDefs', {});

  const centreExaminationDef = useMemo(() => Object.values(examinationDefs).find(q => q.centreId === user?.centreId), [examinationDefs, user]);

  useEffect(() => {
    if (centreExaminationDef) {
      router.replace(`/settings/examinations/edit/${centreExaminationDef.id}`);
    }
  }, [centreExaminationDef, router]);

  const handleFormSubmit = (values: Omit<ExaminationDef, 'id'>) => {
    const newId = generateId();
    const newExaminationDef: ExaminationDef = { ...values, id: newId };
    setExaminationDefs({ ...examinationDefs, [newId]: newExaminationDef });
    toast({ title: "Examination definition created" });
    router.push('/settings');
  };

  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/settings')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">New Examination Definition</h1>
            <p className="text-muted-foreground">Define a standard examination type for your clinic.</p>
        </div>
      </div>
      <Card>
        <CardContent className="p-6">
          {/* This form is not a modal, but we reuse the component.
              We can pass dummy props for modal-specific functionality
              or enhance the form component to handle both cases.
              For now, this demonstrates the reusability.
              A better approach might be to extract the form fields into a separate component.
          */}
          <p className="text-sm text-muted-foreground">Since a center can only have one Examination definition, this will be the only one for your center.</p>
          <ExaminationForm
            isOpen={true} // Keep it "open" to display it
            onOpenChange={() => {}} // No-op
            onSubmit={handleFormSubmit}
            onDelete={() => {}} // No delete on new
            examination={null}
          />
        </CardContent>
      </Card>
    </div>
  );
}
