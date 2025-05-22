
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Calendar, Utensils, Plus, BarChartBig, PieChart } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/widgets/StatsCard';
import { ReservationsList } from '@/components/dashboard/widgets/ReservationsList';
import { ActivityChart } from '@/components/dashboard/widgets/ActivityChart';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [revenueFilter, setRevenueFilter] = useState<'day' | 'week' | 'month'>('month');
  
  const handleCardClick = (destination: string) => {
    navigate(destination);
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in relative">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Last updated: 22 May 2025, 12:42 PM</span>
            <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
              <DialogTrigger asChild>
                <Button size="icon" className="rounded-full h-10 w-10" aria-label="Quick add">
                  <Plus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Quick Add</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <Button 
                    variant="outline" 
                    className="h-auto py-6 flex-col space-y-2 hover:bg-slate-100"
                    onClick={() => {
                      setIsQuickAddOpen(false);
                      navigate('/reservations');
                    }}
                  >
                    <Calendar className="h-8 w-8 text-primary" />
                    <span>New Reservation</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-6 flex-col space-y-2 hover:bg-slate-100"
                    onClick={() => {
                      setIsQuickAddOpen(false);
                      navigate('/guests');
                    }}
                  >
                    <Users className="h-8 w-8 text-primary" />
                    <span>New Guest</span>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div 
            className="block cursor-pointer transition transform hover:scale-[1.02] hover:shadow-md"
            onClick={() => handleCardClick('/reservations')}
          >
            <StatsCard
              title="Total Reservations"
              value="85"
              description="This week"
              trend={{ value: 12, positive: true }}
              icon={<Calendar size={24} />}
            />
          </div>
          <div 
            className="block cursor-pointer transition transform hover:scale-[1.02] hover:shadow-md"
            onClick={() => handleCardClick('/guests')}
          >
            <StatsCard
              title="Unique Guests"
              value="142"
              description="This month"
              trend={{ value: 8, positive: true }}
              icon={<Users size={24} />}
            />
          </div>
          <div 
            className="block cursor-pointer transition transform hover:scale-[1.02] hover:shadow-md"
          >
            <StatsCard
              title="Average Order Value"
              value="$36.20"
              description="Per guest"
              trend={{ value: 3, positive: false }}
              icon={<Utensils size={24} />}
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 border rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium">Revenue Reports</h2>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={revenueFilter === 'day' ? 'default' : 'outline'} 
                  onClick={() => setRevenueFilter('day')}
                >
                  Day
                </Button>
                <Button 
                  size="sm" 
                  variant={revenueFilter === 'week' ? 'default' : 'outline'} 
                  onClick={() => setRevenueFilter('week')}
                >
                  Week
                </Button>
                <Button 
                  size="sm" 
                  variant={revenueFilter === 'month' ? 'default' : 'outline'} 
                  onClick={() => setRevenueFilter('month')}
                >
                  Month
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="chart" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="chart" className="flex gap-1 items-center">
                  <BarChartBig className="h-4 w-4" />
                  <span>Bar Chart</span>
                </TabsTrigger>
                <TabsTrigger value="pie" className="flex gap-1 items-center">
                  <PieChart className="h-4 w-4" />
                  <span>Distribution</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chart">
                <ActivityChart />
              </TabsContent>
              
              <TabsContent value="pie">
                <div className="flex justify-center items-center p-4">
                  <img
                    src="https://placehold.co/600x200/e2e8f0/475569?text=Revenue+Distribution"
                    alt="Revenue Distribution"
                    className="rounded-md"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs">Lunch (38%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs">Dinner (45%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-xs">Drinks (12%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-xs">Other (5%)</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 pt-4 border-t">
              <h3 className="font-medium mb-2">Table Usage Breakdown</h3>
              <div className="flex items-center gap-3">
                <div className="h-4 flex-1 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full w-2/3 bg-primary"></div>
                </div>
                <span className="text-xs font-medium">65%</span>
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span>Month-over-month growth: +8.4%</span>
                <button 
                  className="text-primary underline"
                  onClick={() => toast({
                    title: "Report details",
                    description: "Full table usage report will be available in a future update."
                  })}
                >
                  See full report
                </button>
              </div>
            </div>
          </div>
          <div>
            <ReservationsList />
          </div>
        </div>
        
        <div className="fixed bottom-6 right-6 md:hidden">
          <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
            <DialogTrigger asChild>
              <Button className="h-14 w-14 rounded-full shadow-lg" size="icon">
                <Plus className="h-6 w-6" />
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>
    </DashboardLayout>
  );
}
