
import { Link } from 'react-router-dom';
import { Users, Calendar, Utensils } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/widgets/StatsCard';
import { ReservationsList } from '@/components/dashboard/widgets/ReservationsList';
import { ActivityChart } from '@/components/dashboard/widgets/ActivityChart';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <div>
            <span className="text-sm text-muted-foreground">Last updated: 22 May 2025, 12:42 PM</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Link to="/reservations" className="block">
            <StatsCard
              title="Total Reservations"
              value="85"
              description="This week"
              trend={{ value: 12, positive: true }}
              icon={<Calendar size={24} />}
            />
          </Link>
          <Link to="/guests" className="block">
            <StatsCard
              title="Unique Guests"
              value="142"
              description="This month"
              trend={{ value: 8, positive: true }}
              icon={<Users size={24} />}
            />
          </Link>
          <StatsCard
            title="Average Order Value"
            value="$36.20"
            description="Per guest"
            trend={{ value: 3, positive: false }}
            icon={<Utensils size={24} />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ActivityChart />
          </div>
          <div>
            <ReservationsList />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
