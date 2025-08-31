
'use client';

import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { ExaminationDef } from '@/types/domain';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRealtimeDb } from '@/hooks/use-realtime-db';
import { ExaminationForm } from '../../examination-form';

export default function EditExaminationPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const formId = params.id as string;

  const [examinationDefs, setExaminationDefs, loading] = useRealtimeDb<Record<string, ExaminationDef>>('examinationDefs', {});
  const formDef = examinationDefs[formId];

  const handleFormSubmit = (values: Omit<ExaminationDef, 'id'>) => {
    if (!formDef) return;

    const updatedForm = { ...formDef, ...values };
    setExaminationDefs({ ...examinationDefs, [formId]: updatedForm });
    toast({ title: "Examination definition updated" });
    router.push('/profile');
  };
  
  const handleDelete = (id: string) => {
    const { [id]: _, ...remainingForms } = examinationDefs;
    setExaminationDefs(remainingForms);
    toast({ title: "Examination definition deleted", variant: "destructive" });
    router.push('/profile');
  }

  if (loading) {
    return null; // The global loader will be shown
  }
  
  if (!formDef) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-2xl font-semibold mb-4">Form not found</h2>
        <p className="text-muted-foreground mb-6">
          The form you are looking for does not exist.
        </p>
        <Button asChild>
          <Link href="/profile">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/profile')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Examination Definition</h1>
            <p className="text-muted-foreground">Update the details for "{formDef.name}".</p>
        </div>
      </div>
      <Card>
         <CardContent className="p-6">
          <ExaminationForm
            isOpen={true}
            onOpenChange={() => {}}
            onSubmit={handleFormSubmit}
            onDelete={handleDelete}
            examination={formDef}
          />
        </CardContent>
      </Card>
    </div>
  );
}
