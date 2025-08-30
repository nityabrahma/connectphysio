
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useState, type FormEvent, useEffect, useMemo } from 'react';
import type { Centre } from '@/types/domain';
import { useRealtimeDb } from '@/hooks/use-realtime-db';

// Mock password hashing for demo purposes. DO NOT use in production.
const mockHash = (password: string) => `hashed_${password}`;

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  const [centres, setCentres] = useRealtimeDb<Record<string, Centre>>('centres', {});

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');

  const currentCentre = useMemo(() => {
    return user ? centres[user.centreId] : null;
  }, [centres, user]);
  
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
    }
    if (currentCentre) {
        setOpeningTime(currentCentre.openingTime);
        setClosingTime(currentCentre.closingTime);
    }
  }, [user, currentCentre]);
  
  const handleProfileUpdate = (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    updateUser(user.id, { name, phone });

    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been successfully updated.',
    });
  };
  
  const handleClinicSettingsUpdate = (e: FormEvent) => {
    e.preventDefault();
    if (!currentCentre) return;
    
    setCentres({ ...centres, [currentCentre.id]: { ...currentCentre, openingTime, closingTime } });
     toast({
      title: 'Clinic Settings Updated',
      description: 'Your clinic operating hours have been updated.',
    });
  }

  const handlePasswordChange = (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (user.passwordHash !== mockHash(currentPassword)) {
        toast({
            variant: 'destructive',
            title: 'Incorrect Password',
            description: 'The current password you entered is incorrect.',
        });
        return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Password Mismatch',
        description: 'The new password and confirmation do not match.',
      });
      return;
    }
    
    if (newPassword.length < 6) {
        toast({
            variant: 'destructive',
            title: 'Password Too Short',
            description: 'New password must be at least 6 characters.',
        });
        return;
    }

    updateUser(user.id, { password: newPassword });

    toast({
      title: 'Password Changed',
      description: 'Your password has been successfully updated.',
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and personal information.</p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your name, email, and phone number.</CardDescription>
          </CardHeader>
          <form onSubmit={handleProfileUpdate}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} disabled readOnly />
                <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="pt-2">
                <Button type="submit">Save Changes</Button>
              </div>
            </CardContent>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Choose a new password for your account.</CardDescription>
          </CardHeader>
          <form onSubmit={handlePasswordChange}>
            <CardContent className="space-y-4">
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
               <div className="pt-2">
                <Button type="submit">Change Password</Button>
              </div>
            </CardContent>
          </form>
        </Card>
        
        {user.role === 'admin' && (
          <Card className="md:col-span-2">
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
        )}
      </div>
    </div>
  );
}
