'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface TrafficSource {
  source: string;
  pageViews: number;
}

interface TrafficSourcesChartProps {
  data: TrafficSource[];
}

// Colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

/**
 * Traffic sources chart component
 * @param props - Component props
 * @returns The traffic sources chart component
 */
export function TrafficSourcesChart({ data }: TrafficSourcesChartProps) {
  // Format the data for the pie chart
  const chartData = data.map(item => ({
    name: item.source,
    value: item.pageViews,
  }));

  // Calculate the total page views
  const totalPageViews = data.reduce((sum, item) => sum + item.pageViews, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  `${value.toLocaleString()} (${((value / totalPageViews) * 100).toFixed(1)}%)`,
                  'Page Views',
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
