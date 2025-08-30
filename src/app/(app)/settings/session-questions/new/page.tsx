
'use client';

import { SessionQuestionsForm } from '../session-questions-form';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { Questionnaire } from '@/types/domain';
import { useToast } from '@/hooks/use-toast';
import { generateId } from '@/lib/ids';
import { useRealtimeDb } from '@/hooks/use-realtime-db';

export default function NewSessionQuestionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [questionnaires, setQuestionnaires] = useRealtimeDb<Record<string, Questionnaire>>('sessionQuestionnaires', {});

  const handleFormSubmit = (values: Omit<Questionnaire, 'id' | 'createdAt'>) => {
    const newQuestionnaireId = generateId();
    const newQuestionnaire: Questionnaire = {
      ...values,
      id: newQuestionnaireId,
      createdAt: new Date().toISOString(),
    };
    setQuestionnaires({ ...questionnaires, [newQuestionnaireId]: newQuestionnaire });
    toast({ title: "Form created" });
    router.push('/settings/session-questions');
  };

  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">New Session Form</h1>
            <p className="text-muted-foreground">Create a new form for specific sessions.</p>
        </div>
      </div>
      <Card>
        <CardContent className="p-6">
          <SessionQuestionsForm onSubmit={handleFormSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
