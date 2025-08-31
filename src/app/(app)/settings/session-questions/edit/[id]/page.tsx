
'use client';

import { SessionQuestionsForm } from '../../session-questions-form';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { Questionnaire } from '@/types/domain';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRealtimeDb } from '@/hooks/use-realtime-db';

export default function EditSessionQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const formId = params.id as string;

  const [questionnaires, setQuestionnaires] = useRealtimeDb<Record<string, Questionnaire>>('sessionQuestionnaires', {});
  const formDef = questionnaires[formId];

  const handleFormSubmit = (values: Omit<Questionnaire, 'id' | 'createdAt'>) => {
    if (!formDef) return;

    const updatedForm = { ...formDef, ...values, updatedAt: new Date().toISOString() };
    setQuestionnaires({ ...questionnaires, [formId]: updatedForm });
    toast({ title: "Form updated" });
    router.push('/settings');
  };
  
  const handleDelete = (id: string) => {
    const { [id]: _, ...remainingForms } = questionnaires;
    setQuestionnaires(remainingForms);
    toast({ title: "Form deleted", variant: "destructive" });
    router.push('/settings');
  }

  if (!formDef) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-2xl font-semibold mb-4">Form not found</h2>
        <p className="text-muted-foreground mb-6">
          The form you are looking for does not exist.
        </p>
        <Button asChild>
          <Link href="/settings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/settings')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Form</h1>
            <p className="text-muted-foreground">Update the details for "{formDef.title}".</p>
        </div>
      </div>
      <Card>
         <CardContent className="p-6">
          <SessionQuestionsForm
            onSubmit={handleFormSubmit}
            onDelete={handleDelete}
            formDef={formDef}
          />
        </CardContent>
      </Card>
    </div>
  );
}
