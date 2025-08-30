
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { LS_KEYS } from "@/lib/constants";
import type { ExaminationDef } from "@/types/domain";
import { useToast } from "@/hooks/use-toast";
import { generateId } from "@/lib/ids";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { ExaminationForm } from "./examination-form";
import { useRouter } from "next/navigation";


export default function ExaminationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [examinations, setExaminations] = useLocalStorage<ExaminationDef[]>(LS_KEYS.EXAMINATION_DEFS, []);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExamination, setSelectedExamination] = useState<ExaminationDef | null>(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
        router.push('/dashboard');
    }
  }, [user, router]);
  
  const centreExaminations = examinations.filter(p => p.centreId === user?.centreId);

  const handleAddClick = () => {
    setSelectedExamination(null);
    setIsFormOpen(true);
  };
  
  const handleEditClick = (exam: ExaminationDef) => {
    setSelectedExamination(exam);
    setIsFormOpen(true);
  }

  const handleFormSubmit = (values: Omit<ExaminationDef, 'id'>) => {
    if (selectedExamination) {
      setExaminations(examinations.map(e => e.id === selectedExamination.id ? { ...e, ...values } : e));
      toast({ title: "Examination updated" });
    } else {
      const newExamination: ExaminationDef = {
        ...values,
        id: generateId(),
      };
      setExaminations([...examinations, newExamination]);
      toast({ title: "Examination created" });
    }
    setIsFormOpen(false);
  };
  
  const handleDelete = (id: string) => {
    setExaminations(examinations.filter(e => e.id !== id));
    toast({ title: "Examination deleted", variant: "destructive" });
    setIsFormOpen(false);
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
          <h1 className="text-3xl font-bold tracking-tight">Examinations</h1>
          <p className="text-muted-foreground">Manage standard examination types for your clinic.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Available Examinations</CardTitle>
            <CardDescription>Standard examinations performed at your centre.</CardDescription>
          </div>
          <Button onClick={handleAddClick}><PlusCircle/>New Examination</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {centreExaminations.length > 0 ? centreExaminations.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.name}</TableCell>
                  <TableCell>{exam.description}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(exam)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                        No examinations defined yet.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <ExaminationForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        onDelete={handleDelete}
        examination={selectedExamination}
      />
    </div>
  );
}
