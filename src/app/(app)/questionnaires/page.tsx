
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { LS_KEYS } from "@/lib/constants";
import type { Questionnaire } from "@/types/domain";
import { useToast } from "@/hooks/use-toast";
import { generateId } from "@/lib/ids";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PlusCircle, Edit } from "lucide-react";
import { QuestionnaireForm } from "./questionnaire-form";
import { useRouter } from "next/navigation";

export default function QuestionnairesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [questionnaires, setQuestionnaires] = useLocalStorage<Questionnaire[]>(LS_KEYS.QUESTIONNAIRES, []);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
        router.push('/dashboard');
    }
  }, [user, router]);
  
  const centreQuestionnaires = questionnaires.filter(q => q.centreId === user?.centreId);

  const handleAddClick = () => {
    setSelectedQuestionnaire(null);
    setIsFormOpen(true);
  };
  
  const handleEditClick = (q: Questionnaire) => {
    setSelectedQuestionnaire(q);
    setIsFormOpen(true);
  }

  const handleFormSubmit = (values: Omit<Questionnaire, 'id' | 'createdAt'>) => {
    if (selectedQuestionnaire) {
      const updatedQuestionnaire = { ...selectedQuestionnaire, ...values, updatedAt: new Date().toISOString() };
      setQuestionnaires(questionnaires.map(q => q.id === selectedQuestionnaire.id ? updatedQuestionnaire : q));
      toast({ title: "Questionnaire updated" });
    } else {
      const newQuestionnaire: Questionnaire = {
        ...values,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      setQuestionnaires([...questionnaires, newQuestionnaire]);
      toast({ title: "Questionnaire created" });
    }
    setIsFormOpen(false);
  };
  
  const handleDelete = (id: string) => {
    setQuestionnaires(questionnaires.filter(q => q.id !== id));
    toast({ title: "Questionnaire deleted", variant: "destructive" });
    setIsFormOpen(false);
  }
  
  if (user?.role !== 'admin') {
    return <p>Access Denied.</p>
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Questionnaires</h1>
        <p className="text-muted-foreground">Create and manage forms for session completion.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Questionnaires</CardTitle>
            <CardDescription>These forms are used to gather follow-up information from patients.</CardDescription>
          </div>
          <Button onClick={handleAddClick}><PlusCircle/>New Questionnaire</Button>
        </CardHeader>
        <CardContent>
          {centreQuestionnaires.length > 0 ? (
             <div className="space-y-4">
                {centreQuestionnaires.map(q => (
                    <div key={q.id} className="p-4 border rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{q.title}</p>
                            <p className="text-sm text-muted-foreground">{q.questions.length} question(s)</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(q)}>
                           <Edit className="h-4 w-4 mr-2" /> Edit
                        </Button>
                    </div>
                ))}
            </div>
          ) : (
             <div className="text-center py-12 text-muted-foreground">
                <p>No questionnaires created yet.</p>
                <p className="text-sm">Click "New Questionnaire" to get started.</p>
             </div>
          )}
        </CardContent>
      </Card>
      
      <QuestionnaireForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        onDelete={handleDelete}
        questionnaire={selectedQuestionnaire}
      />
    </div>
  );
}
