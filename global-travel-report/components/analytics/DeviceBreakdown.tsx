'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DeviceData {
  device: string;
  sessions: number;
  percentage: string;
}

interface DeviceBreakdownProps {
  data: DeviceData[];
}

// Colors for the pie chart
const COLORS = {
  mobile: '#0088FE',
  desktop: '#00C49F',
  tablet: '#FFBB28',
};

/**
 * Device breakdown component
 * @param props - Component props
 * @returns The device breakdown component
 */
export function DeviceBreakdown({ data }: DeviceBreakdownProps) {
  // Format the data for the pie chart
  const chartData = data.map(item => ({
    name: item.device.charAt(0).toUpperCase() + item.device.slice(1),
    value: item.sessions,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Breakdown</CardTitle>
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
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || '#8884D8'} 
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value.toLocaleString()} sessions`,
                  name,
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
