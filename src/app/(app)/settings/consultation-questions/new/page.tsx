
'use client';

import { ConsultationQuestionsForm } from '../consultation-questions-form';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { Questionnaire } from '@/types/domain';
import { useToast } from '@/hooks/use-toast';
import { generateId } from '@/lib/ids';
import { useRealtimeDb } from '@/hooks/use-realtime-db';

export default function NewConsultationQuestionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [questionnaires, setQuestionnaires] = useRealtimeDb<Record<string, Questionnaire>>('questionnaires', {});

  const handleFormSubmit = (values: Omit<Questionnaire, 'id' | 'createdAt'>) => {
    const newQuestionnaireId = generateId();
    const newQuestionnaire: Questionnaire = {
      ...values,
      id: newQuestionnaireId,
      createdAt: new Date().toISOString(),
    };
    setQuestionnaires({ ...questionnaires, [newQuestionnaireId]: newQuestionnaire });
    toast({ title: "Form created" });
    router.push('/settings/consultation-questions');
  };

  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">New Consultation Form</h1>
            <p className="text-muted-foreground">Create a new form for session completion.</p>
        </div>
      </div>
      <Card>
        <CardContent className="p-6">
          <ConsultationQuestionsForm onSubmit={handleFormSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
