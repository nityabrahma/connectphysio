
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LS_KEYS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { ExaminationDef, Questionnaire } from '@/types/domain';
import { useRealtimeDb } from '@/hooks/use-realtime-db';
import { useMemo } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function SettingsPage() {
    const { toast } = useToast();
    const router = useRouter();
    const { user } = useAuth();

    // Consultation Forms
    const [consultationForms, setConsultationForms] = useRealtimeDb<Record<string, Questionnaire>>('questionnaires', {});
    const centreConsultationForm = useMemo(() => Object.values(consultationForms).find(q => q.centreId === user?.centreId), [consultationForms, user]);

    // Session Forms
    const [sessionForms, setSessionForms] = useRealtimeDb<Record<string, Questionnaire>>('sessionQuestionnaires', {});
    const centreSessionForm = useMemo(() => Object.values(sessionForms).find(q => q.centreId === user?.centreId), [sessionForms, user]);

    // Examination Forms (assuming it will be stored under 'examinationDefs')
    const [examinationDefs, setExaminationDefs] = useRealtimeDb<Record<string, ExaminationDef>>('examinationDefs', {});
    const centreExaminationDef = useMemo(() => Object.values(examinationDefs).find(d => d.centreId === user?.centreId), [examinationDefs, user]);

    const handleResetData = () => {
        // This functionality might need re-evaluation with a real DB.
        // For now, it clears local flags but won't clear the remote DB.
        localStorage.removeItem(LS_KEYS.SEEDED);
        toast({
            title: 'Seeding Flag Reset',
            description: 'The data seeding flag has been cleared. Please reload to re-seed if the database is empty.',
        });
        setTimeout(() => window.location.reload(), 2000);
    };

    const handleDeleteForm = (
      id: string,
      forms: Record<string, any>,
      setForms: (forms: Record<string, any>) => void,
      name: string
    ) => {
        const { [id]: _, ...remainingForms } = forms;
        setForms(remainingForms);
        toast({ title: `${name} Deleted`, variant: 'destructive' });
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your application preferences.</p>
            </div>

            {user?.role === 'admin' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Consultation Questions Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Consultation Form</CardTitle>
                            <CardDescription>
                                A single form for session follow-ups.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex gap-2">
                            {centreConsultationForm ? (
                                <>
                                    <Button onClick={() => router.push(`/settings/consultation-questions/edit/${centreConsultationForm.id}`)}>
                                        Manage Form
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive">Delete</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>This will permanently delete your consultation form.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteForm(centreConsultationForm.id, consultationForms, setConsultationForms, 'Consultation Form')}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </>
                            ) : (
                                <Button onClick={() => router.push('/settings/consultation-questions/new')}>
                                    Create Form
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Session Questions Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Session Form</CardTitle>
                            <CardDescription>
                                A single form for specific session notes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex gap-2">
                             {centreSessionForm ? (
                                <>
                                    <Button onClick={() => router.push(`/settings/session-questions/edit/${centreSessionForm.id}`)}>
                                        Manage Form
                                    </Button>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive">Delete</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>This will permanently delete your session form.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteForm(centreSessionForm.id, sessionForms, setSessionForms, 'Session Form')}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </>
                            ) : (
                                <Button onClick={() => router.push('/settings/session-questions/new')}>
                                    Create Form
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Examinations Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Examinations</CardTitle>
                            <CardDescription>
                                Manage the standard examination types for your clinic.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {centreExaminationDef ? (
                                 <>
                                    <Button onClick={() => router.push(`/settings/examinations/edit/${centreExaminationDef.id}`)}>
                                        Manage Examinations
                                    </Button>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive">Delete</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>This will permanently delete your examinations definition.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteForm(centreExaminationDef.id, examinationDefs, setExaminationDefs, 'Examinations Definition')}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </>
                            ) : (
                                <Button onClick={() => router.push('/settings/examinations/new')}>
                                    Create Examinations
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>
                        Reset all demo data to its initial state. This action cannot be undone.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive" onClick={handleResetData}>
                        Reset Demo Data
                    </Button>
                </CardContent>
            </Card>

        </div>
    );
}
