
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export default function RegisterAdminPage() {
  const { registerAdmin } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [centreName, setCentreName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        const newUser = await registerAdmin({ name, email, password, centreName });
        if (newUser) {
            toast({
                title: 'Admin Account Created',
                description: 'You can now log in with your new credentials.',
            });
            router.push(`/login?email=${encodeURIComponent(email)}`);
        }
    } catch (error) {
         toast({
            variant: 'destructive',
            title: 'Registration Failed',
            description: (error as Error).message,
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Admin Account</CardTitle>
        <CardDescription>
          This form is for creating a new administrative user and clinic centre.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="centreName">Centre Name</Label>
            <Input
              id="centreName"
              type="text"
              placeholder="e.g., ConnectPhysio London"
              required
              value={centreName}
              onChange={(e) => setCentreName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Admin Account'}
          </Button>
           <Link href="/login">
            <Button variant="link">Back to Login</Button>
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
