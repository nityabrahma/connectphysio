
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { LS_KEYS } from "@/lib/constants";
import type { Questionnaire } from "@/types/domain";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PlusCircle, Edit, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TreatmentQuestionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [questionnaires] = useLocalStorage<Questionnaire[]>(LS_KEYS.TREATMENT_QUESTIONNAIRES, []);
  
  useEffect(() => {
    if (user && user.role !== 'admin') {
        router.push('/dashboard');
    }
  }, [user, router]);
  
  const centreQuestionnaires = questionnaires.filter(q => q.centreId === user?.centreId);

  const handleAddClick = () => {
    router.push('/settings/treatment-questions/new');
  };
  
  const handleEditClick = (q: Questionnaire) => {
    router.push(`/settings/treatment-questions/edit/${q.id}`);
  }
  
  if (user?.role !== 'admin') {
    return <p>Access Denied.</p>
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Treatment Questions</h1>
          <p className="text-muted-foreground">Create and manage forms for specific treatments.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Forms</CardTitle>
            <CardDescription>These forms are used to gather treatment-specific information.</CardDescription>
          </div>
          <Button onClick={handleAddClick}><PlusCircle/>New Form</Button>
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
                <p>No forms created yet.</p>
                <p className="text-sm">Click "New Form" to get started.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
