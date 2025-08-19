'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function AppointmentsPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
          <Calendar className="h-16 w-16 mb-4" />
          <p>Appointments calendar view will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
