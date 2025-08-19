'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function PackagesPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Packages</h1>
      <Card>
        <CardHeader>
          <CardTitle>Available Packages</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
            <Package className="h-16 w-16 mb-4" />
            <p>Package management and sales information will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
