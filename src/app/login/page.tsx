
'use client';

import { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoginForm } from './login-form';
import { Skeleton } from '@/components/ui/skeleton';

function LoginPageContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account.</CardDescription>
      </CardHeader>
      <LoginForm />
    </Card>
  );
}

function LoginSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Enter your credentials to access your account.</CardDescription>
            </CardHeader>
            <div className="p-6 pt-0 space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                </div>
                 <Skeleton className="h-10 w-full" />
            </div>
        </Card>
    )
}


export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginPageContent />
    </Suspense>
  );
}
