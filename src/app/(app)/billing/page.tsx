
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BillingPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <Button onClick={() => router.push('/billing/new')}>
          <PlusCircle />
          New Bill
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
            <DollarSign className="h-16 w-16 mb-4" />
            <p>Billing and invoicing features will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
