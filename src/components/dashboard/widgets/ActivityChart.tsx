
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

// Mock data for the chart
const data = [
  { name: 'Mon', reservations: 12, revenue: 840 },
  { name: 'Tue', reservations: 19, revenue: 1250 },
  { name: 'Wed', reservations: 15, revenue: 980 },
  { name: 'Thu', reservations: 27, revenue: 1640 },
  { name: 'Fri', reservations: 34, revenue: 2100 },
  { name: 'Sat', reservations: 42, revenue: 2700 },
  { name: 'Sun', reservations: 31, revenue: 2100 },
];

export function ActivityChart() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Weekly Activity</CardTitle>
        <select 
          className="text-sm bg-transparent border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-brand-orange"
          defaultValue="reservations"
        >
          <option value="reservations">Reservations</option>
          <option value="revenue">Revenue</option>
        </select>
      </CardHeader>
      <CardContent className="px-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
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
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border rounded shadow text-sm">
                        <p className="font-medium">{label}</p>
                        <p className="text-brand-orange">
                          Reservations: {payload[0].value}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="reservations" 
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
