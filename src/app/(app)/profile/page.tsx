
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useState, type FormEvent, useEffect, useMemo } from 'react';
import type { Centre, Questionnaire, ExaminationDef } from '@/types/domain';
import { useRealtimeDb } from '@/hooks/use-realtime-db';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Building, Mail, User as UserIcon, Phone, KeyRound, Edit } from 'lucide-react';

const EditProfileModal = ({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
    const { user, updateUser } = useAuth();
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name);
            setPhone(user.phone || '');
        }
    }, [user, isOpen]);

    const handleProfileUpdate = (e: FormEvent) => {
        e.preventDefault();
        if (!user) return;
        updateUser(user.id, { name, phone });
        toast({ title: 'Profile Updated' });
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Personal Information</DialogTitle>
                    <DialogDescription>Update your name and phone number.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleProfileUpdate} id="profile-form">
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={user?.email || ''} disabled readOnly />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                    </div>
                </form>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit" form="profile-form">Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const ChangePasswordModal = ({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
    const { user, updateUser } = useAuth();
    const { toast } = useToast();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handlePasswordChange = (e: FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (user.passwordHash !== `hashed_${currentPassword}`) {
            toast({ variant: 'destructive', title: 'Incorrect Password' });
            return;
        }
        if (newPassword !== confirmPassword) {
            toast({ variant: 'destructive', title: 'Passwords do not match' });
            return;
        }
        if (newPassword.length < 6) {
            toast({ variant: 'destructive', title: 'Password must be at least 6 characters' });
            return;
        }

        updateUser(user.id, { password: newPassword });
        toast({ title: 'Password Changed' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>Choose a new password for your account.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handlePasswordChange} id="password-form">
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        </div>
                    </div>
                </form>
                 <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit" form="password-form">Change Password</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export default function ProfilePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [centres, setCentres] = useRealtimeDb<Record<string, Centre>>('centres', {});
    const [consultationForms, setConsultationForms] = useRealtimeDb<Record<string, Questionnaire>>('questionnaires', {});
    const [sessionForms, setSessionForms] = useRealtimeDb<Record<string, Questionnaire>>('sessionQuestionnaires', {});
    const [examinationDefs, setExaminationDefs] = useRealtimeDb<Record<string, ExaminationDef>>('examinationDefs', {});
    
    const [openingTime, setOpeningTime] = useState('');
    const [closingTime, setClosingTime] = useState('');

    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const currentCentre = useMemo(() => {
        return user ? centres[user.centreId] : null;
    }, [centres, user]);

    const centreConsultationForm = useMemo(() => Object.values(consultationForms).find(q => q.centreId === user?.centreId), [consultationForms, user]);
    const centreSessionForm = useMemo(() => Object.values(sessionForms).find(q => q.centreId === user?.centreId), [sessionForms, user]);
    const centreExaminationDef = useMemo(() => Object.values(examinationDefs).find(d => d.centreId === user?.centreId), [examinationDefs, user]);

    useEffect(() => {
        if (currentCentre) {
            setOpeningTime(currentCentre.openingTime);
            setClosingTime(currentCentre.closingTime);
        }
    }, [currentCentre]);

    const handleClinicSettingsUpdate = (e: FormEvent) => {
        e.preventDefault();
        if (!currentCentre) return;
        setCentres({ ...centres, [currentCentre.id]: { ...currentCentre, openingTime, closingTime } });
        toast({ title: 'Clinic Settings Updated' });
    }

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

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
                    <p className="text-muted-foreground">Manage your account, clinic, and application settings.</p>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                            <CardTitle>Account Information</CardTitle>
                            <CardDescription>Your personal and clinic details.</CardDescription>
                        </div>
                         <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsProfileModalOpen(true)}><Edit /> Edit Profile</Button>
                            <Button variant="outline" onClick={() => setIsPasswordModalOpen(true)}><KeyRound /> Change Password</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2">
                         <div className="flex items-center gap-3">
                            <div className="p-3 bg-muted rounded-lg"><Building className="h-5 w-5 text-muted-foreground"/></div>
                            <div>
                                <p className="text-sm text-muted-foreground">Clinic</p>
                                <p className="font-semibold">{user.centreName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-muted rounded-lg"><UserIcon className="h-5 w-5 text-muted-foreground"/></div>
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-semibold">{user.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-muted rounded-lg"><Mail className="h-5 w-5 text-muted-foreground"/></div>
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-semibold">{user.email}</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-3">
                            <div className="p-3 bg-muted rounded-lg"><Phone className="h-5 w-5 text-muted-foreground"/></div>
                            <div>
                                <p className="text-sm text-muted-foreground">Phone</p>
                                <p className="font-semibold">{user.phone || 'Not set'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {user.role === 'admin' && (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>Clinic Settings</CardTitle>
                                <CardDescription>Manage the operating hours for your clinic.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleClinicSettingsUpdate}>
                                <CardContent className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="opening-time">Opening Time</Label>
                                        <Input id="opening-time" type="time" value={openingTime} onChange={(e) => setOpeningTime(e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="closing-time">Closing Time</Label>
                                        <Input id="closing-time" type="time" value={closingTime} onChange={(e) => setClosingTime(e.target.value)} required />
                                    </div>
                                    <div className="pt-2 md:col-span-2 flex justify-end">
                                        <Button type="submit">Save Clinic Settings</Button>
                                    </div>
                                </CardContent>
                            </form>
                        </Card>
                        
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Form Management</h2>
                            <p className="text-muted-foreground">Manage questionnaires and definitions for your clinic.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Consultation Form</CardTitle>
                                    <CardDescription>A single form for initial patient consultations.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex gap-2">
                                    {centreConsultationForm ? (
                                        <>
                                            <Button onClick={() => router.push(`/consultation-questions/edit/${centreConsultationForm.id}`)}>Manage Form</Button>
                                            <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive">Delete</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete your consultation form.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteForm(centreConsultationForm.id, consultationForms, setConsultationForms, 'Consultation Form')}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                                        </>
                                    ) : (
                                        <Button onClick={() => router.push('/consultation-questions/new')}>Create Form</Button>
                                    )}
                                </CardContent>
                            </Card>

                             <Card>
                                <CardHeader>
                                    <CardTitle>Session Form</CardTitle>
                                    <CardDescription>A single form for session follow-up notes.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex gap-2">
                                    {centreSessionForm ? (
                                        <>
                                            <Button onClick={() => router.push(`/session-questions/edit/${centreSessionForm.id}`)}>Manage Form</Button>
                                            <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive">Delete</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete your session form.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteForm(centreSessionForm.id, sessionForms, setSessionForms, 'Session Form')}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                                        </>
                                    ) : (
                                        <Button onClick={() => router.push('/session-questions/new')}>Create Form</Button>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Examinations</CardTitle>
                                    <CardDescription>Manage the standard examination types for your clinic.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex gap-2">
                                    {centreExaminationDef ? (
                                        <>
                                            <Button onClick={() => router.push(`/examinations/edit/${centreExaminationDef.id}`)}>Manage Examinations</Button>
                                            <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive">Delete</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete your examinations definition.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteForm(centreExaminationDef.id, examinationDefs, setExaminationDefs, 'Examinations Definition')}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                                        </>
                                    ) : (
                                        <Button onClick={() => router.push('/examinations/new')}>Create Examinations</Button>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
            
            <EditProfileModal isOpen={isProfileModalOpen} onOpenChange={setIsProfileModalOpen} />
            <ChangePasswordModal isOpen={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen} />
        </>
    );
}
