'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TrafficData {
  date: string;
  pageViews: number;
  visitors: number;
}

interface TrafficOverTimeProps {
  data: TrafficData[];
}

/**
 * Traffic over time component
 * @param props - Component props
 * @returns The traffic over time component
 */
export function TrafficOverTime({ data }: TrafficOverTimeProps) {
  // Format the dates for display
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="pageViews"
                name="Page Views"
                stroke="#0088FE"
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="visitors"
                name="Unique Visitors"
                stroke="#00C49F"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
