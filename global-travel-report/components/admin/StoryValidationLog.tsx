'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export const StoryValidationLog = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Story Validation Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            No validation logs available.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 