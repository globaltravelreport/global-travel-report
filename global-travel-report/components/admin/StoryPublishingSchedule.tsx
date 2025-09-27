'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export const StoryPublishingSchedule = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Publishing Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            No scheduled stories available.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 