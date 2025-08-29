
'use client';

import { QuestionnaireForm } from '../../questionnaire-form';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { Questionnaire } from '@/types/domain';
import { LS_KEYS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useLocalStorage } from '@/hooks/use-local-storage';

export default function EditQuestionnairePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const questionnaireId = params.id as string;

  const [questionnaires, setQuestionnaires] = useLocalStorage<Questionnaire[]>(LS_KEYS.QUESTIONNAIRES, []);
  const questionnaire = questionnaires.find(q => q.id === questionnaireId);

  const handleFormSubmit = (values: Omit<Questionnaire, 'id' | 'createdAt'>) => {
    if (!questionnaire) return;

    const updatedQuestionnaire = { ...questionnaire, ...values, updatedAt: new Date().toISOString() };
    setQuestionnaires(questionnaires.map(q => q.id === questionnaireId ? updatedQuestionnaire : q));
    toast({ title: "Questionnaire updated" });
    router.push('/settings/questionnaires');
  };
  
  const handleDelete = (id: string) => {
    setQuestionnaires(questionnaires.filter(q => q.id !== id));
    toast({ title: "Questionnaire deleted", variant: "destructive" });
    router.push('/settings/questionnaires');
  }

  if (!questionnaire) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-2xl font-semibold mb-4">Questionnaire not found</h2>
        <p className="text-muted-foreground mb-6">
          The questionnaire you are looking for does not exist.
        </p>
        <Button asChild>
          <Link href="/settings/questionnaires">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Questionnaires
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Questionnaire</h1>
            <p className="text-muted-foreground">Update the details for "{questionnaire.title}".</p>
        </div>
      </div>
      <Card>
         <CardContent className="p-6">
          <QuestionnaireForm
            onSubmit={handleFormSubmit}
            onDelete={handleDelete}
            questionnaire={questionnaire}
          />
        </CardContent>
      </Card>
    </div>
  );
}
