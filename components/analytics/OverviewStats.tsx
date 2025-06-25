'use client';

import { AnalyticsData } from '@/src/lib/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart } from 'lucide-react';
import { Users } from 'lucide-react';
import { Clock } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { ArrowDownRight } from 'lucide-react';

interface OverviewStatsProps {
  data: AnalyticsData;
}

/**
 * Overview statistics component
 * @param props - Component props
 * @returns The overview statistics component
 */
export function OverviewStats({ data }: OverviewStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Page Views</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.pageViews.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Total page views in the selected period
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.uniqueVisitors.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Unique visitors in the selected period
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.averageSessionDuration}</div>
          <p className="text-xs text-muted-foreground">
            Average time spent on the site
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
          {parseFloat(data.bounceRate) < 50 ? (
            <ArrowDownRight className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowUpRight className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.bounceRate}</div>
          <p className="text-xs text-muted-foreground">
            Percentage of single-page sessions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
