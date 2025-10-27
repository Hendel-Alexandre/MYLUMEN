'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TasksPage() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Tasks management coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
