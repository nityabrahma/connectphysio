
'use client';

import { TreatmentQuestionsForm } from '../../treatment-questions-form';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { Questionnaire } from '@/types/domain';
import { LS_KEYS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useLocalStorage } from '@/hooks/use-local-storage';

export default function EditTreatmentQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const formId = params.id as string;

  const [questionnaires, setQuestionnaires] = useLocalStorage<Questionnaire[]>(LS_KEYS.TREATMENT_QUESTIONNAIRES, []);
  const formDef = questionnaires.find(q => q.id === formId);

  const handleFormSubmit = (values: Omit<Questionnaire, 'id' | 'createdAt'>) => {
    if (!formDef) return;

    const updatedForm = { ...formDef, ...values, updatedAt: new Date().toISOString() };
    setQuestionnaires(questionnaires.map(q => q.id === formId ? updatedForm : q));
    toast({ title: "Form updated" });
    router.push('/settings/treatment-questions');
  };
  
  const handleDelete = (id: string) => {
    setQuestionnaires(questionnaires.filter(q => q.id !== id));
    toast({ title: "Form deleted", variant: "destructive" });
    router.push('/settings/treatment-questions');
  }

  if (!formDef) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-2xl font-semibold mb-4">Form not found</h2>
        <p className="text-muted-foreground mb-6">
          The form you are looking for does not exist.
        </p>
        <Button asChild>
          <Link href="/settings/treatment-questions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forms
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
            <h1 className="text-3xl font-bold tracking-tight">Edit Form</h1>
            <p className="text-muted-foreground">Update the details for "{formDef.title}".</p>
        </div>
      </div>
      <Card>
         <CardContent className="p-6">
          <TreatmentQuestionsForm
            onSubmit={handleFormSubmit}
            onDelete={handleDelete}
            formDef={formDef}
          />
        </CardContent>
      </Card>
    </div>
  );
}
