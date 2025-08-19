'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
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
