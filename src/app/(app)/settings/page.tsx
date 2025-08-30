
'use client';
import { ThemeSwitch } from '@/components/theme-switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LS_KEYS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function SettingsPage() {
    const { toast } = useToast();
    const router = useRouter();
    const { user } = useAuth();

    const handleResetData = () => {
        // Clear all app-related data from localStorage
        Object.values(LS_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        toast({
            title: 'Data Reset',
            description: 'All application data has been cleared. Please reload the page to re-seed.',
        });
        // Optional: force a reload to trigger the seeding process again
        setTimeout(() => window.location.reload(), 2000);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your application preferences.</p>
            </div>
            
            {/* <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of the application.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <p className="font-medium">Theme</p>
                    <ThemeSwitch />
                </CardContent>
            </Card> */}

            {user?.role === 'admin' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Consultation Questions</CardTitle>
                            <CardDescription>
                                Create and manage forms for session follow-ups.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => router.push('/settings/consultation-questions')}>
                                Manage Consultation Forms
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Treatment Questions</CardTitle>
                            <CardDescription>
                                Create and manage forms for specific treatments.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => router.push('/settings/treatment-questions')}>
                                Manage Treatment Forms
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Examinations</CardTitle>
                            <CardDescription>
                                Manage the standard examination types for your clinic.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => router.push('/settings/examinations')}>
                                Manage Examinations
                            </Button>
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
