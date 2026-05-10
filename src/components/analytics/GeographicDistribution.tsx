'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CountryData {
  country: string;
  pageViews: number;
}

interface GeographicDistributionProps {
  data: CountryData[];
}

/**
 * Geographic distribution component
 * @param props - Component props
 * @returns The geographic distribution component
 */
export function GeographicDistribution({ data }: GeographicDistributionProps) {
  // Get the maximum page views for scaling
  const maxPageViews = Math.max(...data.map(country => country.pageViews));
  
  // Calculate the total page views
  const totalPageViews = data.reduce((sum, country) => sum + country.pageViews, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geographic Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((country, index) => {
            // Calculate the width percentage based on page views
            const widthPercentage = (country.pageViews / maxPageViews) * 100;
            
            // Calculate the percentage of total page views
            const percentageOfTotal = (country.pageViews / totalPageViews) * 100;
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{country.country}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{country.pageViews.toLocaleString()}</span>
                    <span className="text-xs text-gray-500">
                      ({percentageOfTotal.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${widthPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
