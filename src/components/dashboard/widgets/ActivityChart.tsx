
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface ActivityChartDataPoint {
  name: string;
  date?: string; // Optional for backward compatibility
  reservations: number;
  revenue: number;
}

interface ActivityChartProps {
  title: string;
  data: ActivityChartDataPoint[];
}

export function ActivityChart({ title, data }: ActivityChartProps) {
  const [metricType, setMetricType] = useState<'reservations' | 'revenue'>('reservations');
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <select 
          className="text-sm bg-transparent border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-brand-orange"
          value={metricType}
          onChange={(e) => setMetricType(e.target.value as 'reservations' | 'revenue')}
        >
          <option value="reservations">Reservations</option>
          <option value="revenue">Revenue</option>
        </select>
      </CardHeader>
      <CardContent className="px-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data || []}
              margin={{
                top: 16,
                right: 16,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  // If the value is a valid date, format it nicely
                  if (value && typeof value === 'string') {
                    // Check if it's a month abbreviation (3 letters)
                    if (/^[A-Za-z]{3}$/.test(value)) {
                      return value;
                    }
                    // Check if it's a day of week (3 letters)
                    if (['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].includes(value)) {
                      return value;
                    }
                    // Check if it's a time (e.g., '8 AM')
                    if (/^\d{1,2} [AP]M$/.test(value)) {
                      return value;
                    }
                  }
                  return value || '';
                }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => metricType === 'revenue' ? `$${value}` : `${value}`}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border rounded shadow text-sm">
                        <p className="font-medium">{label}</p>
                        <p className="text-brand-orange">
                          {metricType === 'reservations' ? 'Reservations' : 'Revenue'}: {metricType === 'revenue' ? '$' : ''}{payload[0].value}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey={metricType} 
                fill="#FF6B35"
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
