'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TopPage {
  path: string;
  pageViews: number;
  title?: string;
}

interface TopPagesChartProps {
  data: TopPage[];
}

/**
 * Top pages chart component
 * @param props - Component props
 * @returns The top pages chart component
 */
export function TopPagesChart({ data }: TopPagesChartProps) {
  // Get the maximum page views for scaling
  const maxPageViews = Math.max(...data.map(page => page.pageViews));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Pages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((page, index) => {
            // Calculate the width percentage based on page views
            const widthPercentage = (page.pageViews / maxPageViews) * 100;
            
            // Format the path for display
            const displayPath = page.path === '/' 
              ? 'Homepage' 
              : page.path.replace(/^\//, '').replace(/-/g, ' ');
            
            // Use the title if available, otherwise use the formatted path
            const displayTitle = page.title || displayPath;
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="truncate max-w-[70%]" title={displayTitle}>
                    {displayTitle}
                  </div>
                  <span className="font-medium">{page.pageViews.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${widthPercentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 truncate" title={page.path}>
                  {page.path}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
