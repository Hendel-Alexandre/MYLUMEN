'use client';

import { CalendarIntegration } from '@/components/Calendar/CalendarIntegration';
import { Card } from '@/components/ui/card';

export default function CalendarPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Calendar</h1>
        <p className="text-muted-foreground">Manage your schedule and appointments</p>
      </div>

      <Card className="p-6">
        <CalendarIntegration />
      </Card>
    </div>
  );
}
