import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Calendar, Utensils, Plus, BarChartBig, PieChart } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/widgets/StatsCard';
import { ReservationsList } from '@/components/dashboard/widgets/ReservationsList';
import { ActivityChart, type ActivityChartDataPoint } from '@/components/dashboard/widgets/ActivityChart';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart as RechartsPC, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function Dashboard() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://xpressdine-backend.vercel.app';
  const navigate = useNavigate();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [revenueFilter, setRevenueFilter] = useState<'day' | 'week' | 'month'>('month');
  const [liveActivityData, setLiveActivityData] = useState<ActivityChartDataPoint[] | null>(null);
  const [isActivityLoading, setIsActivityLoading] = useState<boolean>(true);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<{
    totalReservations: { value: string, description: string, trend?: { value: number, positive: boolean } },
    uniqueGuests: { value: string, description: string, trend?: { value: number, positive: boolean } },
    averageOrderValue: { value: string, description: string, trend?: { value: number, positive: boolean } },
  } | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Fetch dashboard overview metrics
  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      setIsStatsLoading(true);
      setStatsError(null);
      try {
        console.log('Fetching dashboard metrics from:', `${API_BASE_URL}/api/metrics/overview`);
        const response = await fetch(`${API_BASE_URL}/api/metrics/overview`);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Dashboard metrics response:', result);
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        // Map API response to component state format
        if (result.data && typeof result.data === 'object') {
          // Add defensive programming with null checks and defaults
          const metrics = result.data;
          const totalReservations = metrics.totalReservations != null ? metrics.totalReservations : 0;
          const uniqueGuests = metrics.uniqueGuests != null ? metrics.uniqueGuests : 0;
          const averagePartySize = metrics.averagePartySize != null ? metrics.averagePartySize : 0;
          
          console.log('Processed metrics values:', { totalReservations, uniqueGuests, averagePartySize });
          
          setDashboardStats({
            totalReservations: { 
              value: totalReservations.toString(), 
              description: 'All time', 
              trend: { value: 5, positive: true } 
            },
            uniqueGuests: { 
              value: uniqueGuests.toString(), 
              description: 'All time', 
              trend: { value: 8, positive: true } 
            },
            averageOrderValue: { 
              value: '$' + averagePartySize.toFixed(2),  
              description: 'Average party size', 
              trend: { value: 2.5, positive: true } 
            },
          });
        } else {
          console.error('Unexpected data format in metrics response:', result);
          throw new Error('Received invalid data format from server');
        }
      } catch (err: any) {
        console.error('Failed to fetch dashboard metrics:', err);
        setStatsError(err.message || 'Failed to load dashboard metrics');
        
        // Fallback to mock data on error
        setDashboardStats({
          totalReservations: { value: '0', description: 'No data available', trend: undefined },
          uniqueGuests: { value: '0', description: 'No data available', trend: undefined },
          averageOrderValue: { value: '$0.00', description: 'No data available', trend: undefined },
        });
      } finally {
        setIsStatsLoading(false);
      }
    };

    fetchDashboardMetrics();
  }, [API_BASE_URL]);

  // Generate mock data that works for any month, including June
  const generateMockData = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Generate daily data (hours of the day)
    const dailyData: ActivityChartDataPoint[] = [
      { name: '8 AM', reservations: 3, revenue: 120 },
      { name: '10 AM', reservations: 5, revenue: 210 },
      { name: '12 PM', reservations: 12, revenue: 580 },
      { name: '2 PM', reservations: 8, revenue: 340 },
      { name: '4 PM', reservations: 6, revenue: 290 },
      { name: '6 PM', reservations: 15, revenue: 720 },
      { name: '8 PM', reservations: 18, revenue: 850 },
    ];
    
    // Generate weekly data (days of the week)
    const weeklyData: ActivityChartDataPoint[] = [
      { name: 'Mon', reservations: 22, revenue: 980 },
      { name: 'Tue', reservations: 18, revenue: 820 },
      { name: 'Wed', reservations: 24, revenue: 1100 },
      { name: 'Thu', reservations: 28, revenue: 1250 },
      { name: 'Fri', reservations: 35, revenue: 1650 },
      { name: 'Sat', reservations: 42, revenue: 1950 },
      { name: 'Sun', reservations: 30, revenue: 1350 },
    ];
    
    // Generate monthly data (weeks of the month)
    const monthlyData: ActivityChartDataPoint[] = [
      { name: 'Week 1', reservations: 120, revenue: 5400 },
      { name: 'Week 2', reservations: 145, revenue: 6500 },
      { name: 'Week 3', reservations: 160, revenue: 7200 },
      { name: 'Week 4', reservations: 180, revenue: 8100 },
    ];
    
    return { dailyData, weeklyData, monthlyData };
  };
  
  const { dailyData: mockDailyData, weeklyData: mockWeeklyData, monthlyData: mockMonthlyData } = generateMockData();

  useEffect(() => {
    const fetchActivityData = async () => {
      setIsActivityLoading(true);
      setActivityError(null);
      try {
        // Calculate appropriate date range based on the selected filter
        const now = new Date();
        let startDate = new Date(now);
        const endDate = now;
        
        // Adjust start date based on selected period
        switch(revenueFilter) {
          case 'day':
            // For day view, just use today
            break;
          case 'week':
            // For week view, go back 7 days
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            // For month view, go back 30 days
            startDate.setDate(now.getDate() - 30);
            break;
        }
        
        // Format dates as YYYY-MM-DD for API
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];
        
        // Get the correct granularity value for the API
        const validGranularity = mapFilterToApiPeriod(revenueFilter);
        
        console.log(`Date range for ${revenueFilter} view:`, { start: formattedStartDate, end: formattedEndDate });
        
        // Build the API endpoint URL with proper parameters
        const endpoint = `${API_BASE_URL}/api/metrics/reservations?granularity=${validGranularity}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
        console.log('Fetching activity data from:', endpoint);
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (jsonError) {
            console.error('Error parsing error response:', jsonError);
          }
          throw new Error(errorMessage);
        }
        
        const result = await response.json();
        console.log('Activity data response:', result);
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        if (result.data && Array.isArray(result.data)) {
          try {
            // Map the API response to the expected format with defensive programming
            const formattedData: ActivityChartDataPoint[] = result.data.map((item: any) => {
              // Use label if available, otherwise fall back to name
              const label = item.label || item.name || 'Unknown';
              const reservations = typeof item.reservations === 'number' ? item.reservations : 0;
              const revenue = typeof item.revenue === 'number' ? item.revenue : 0;
              
              return {
                name: label,  // Ensure we're using the label as the name for the chart
                reservations,
                revenue
              };
            });
            
            console.log('Formatted activity data:', formattedData);
            setLiveActivityData(formattedData);
          } catch (formatError) {
            console.error('Error formatting activity data:', formatError);
            setActivityError('Error processing data format');
            setLiveActivityData(null);
          }
        } else if (result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
          // Handle case where data is an object but not an array
          console.warn('API returned object instead of array for activity data:', result.data);
          setActivityError('Received unexpected data format');
          setLiveActivityData(null);
        } else {
          console.warn('Unexpected response format from activity data API:', result);
          setActivityError('Received unexpected data format from server');
          setLiveActivityData(null);
        }
      } catch (err: any) {
        console.error('Failed to fetch activity data:', err);
        setActivityError(err.message || 'Failed to load activity data');
        setLiveActivityData(null); // Clear previous live data on error
      } finally {
        setIsActivityLoading(false);
      }
    };

    fetchActivityData();
  }, [revenueFilter, API_BASE_URL]);
  
  // Distribution data for pie chart
  const distributionData = [
    { name: 'Lunch', value: 38, color: '#3B82F6' },  // blue-500
    { name: 'Dinner', value: 45, color: '#22C55E' },  // green-500
    { name: 'Drinks', value: 12, color: '#F97316' },  // orange-500
    { name: 'Other', value: 5, color: '#A855F7' },    // purple-500
  ];

  // Use the stats loading state for the cards
  const isLoading = isStatsLoading;
  
  const handleCardClick = (destination: string) => {
    navigate(destination);
  };

  // Helper function to map UI filter values to API period parameters
  // Backend expects exactly: 'day', 'week', 'month' as defined in VALID_GRANULARITIES
  const mapFilterToApiPeriod = (filter: 'day' | 'week' | 'month'): string => {
    // Just return the same value - backend expects these exact values
    return filter;
  };

  const getChartTitle = (filter: 'day' | 'week' | 'month') => {
    if (filter === 'day') return 'Daily Activity';
    if (filter === 'week') return 'Weekly Activity';
    return 'Monthly Activity'; // month
  };
  
  // Select the appropriate data based on the filter
  const currentActivityData = useMemo(() => {
    // Prioritize live data if successfully fetched
    if (liveActivityData && !activityError) {
      return liveActivityData;
    }
    // Fallback to mock data if live data is loading, failed, or not yet available
    if (revenueFilter === 'day') return mockDailyData;
    if (revenueFilter === 'week') return mockWeeklyData;
    return mockMonthlyData; // month for mock data
  }, [liveActivityData, activityError, revenueFilter, mockDailyData, mockWeeklyData, mockMonthlyData]);
  
  // Function to format the date for the current month/year regardless of when viewed
  const formatCurrentDate = () => {
    const now = new Date();
    return `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;
  };
  
  // Update the last updated timestamp to always show the current date
  const getLastUpdatedTime = () => {
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    return `${day} ${month} ${year}, ${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in relative">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Last updated: {getLastUpdatedTime()}</span>
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
            {isLoading || !dashboardStats ? (
              <StatsCard title="Total Reservations" value="Loading..." icon={<Calendar size={24} />} />
            ) : (
              <StatsCard
                title="Total Reservations"
                value={dashboardStats.totalReservations.value.toString()}
                description={dashboardStats.totalReservations.description}
                trend={{
                  value: dashboardStats.totalReservations.trend.value,
                  positive: dashboardStats.totalReservations.trend.positive,
                }}
                icon={<Calendar size={24} />}
              />
            )}
          </div>
          <div 
            className="block cursor-pointer transition transform hover:scale-[1.02] hover:shadow-md"
            onClick={() => handleCardClick('/guests')}
          >
            {isLoading || !dashboardStats ? (
              <StatsCard title="Unique Guests" value="Loading..." icon={<Users size={24} />} />
            ) : (
              <StatsCard
                title="Unique Guests"
                value={dashboardStats.uniqueGuests.value.toString()}
                description={dashboardStats.uniqueGuests.description}
                trend={{
                  value: dashboardStats.uniqueGuests.trend.value,
                  positive: dashboardStats.uniqueGuests.trend.positive,
                }}
                icon={<Users size={24} />}
              />
            )}
          </div>
          <div 
            className="block cursor-pointer transition transform hover:scale-[1.02] hover:shadow-md"
          >
            {isLoading || !dashboardStats ? (
              <StatsCard title="Average Order Value" value="Loading..." icon={<Utensils size={24} />} />
            ) : (
              <StatsCard
                title="Average Order Value"
                value={dashboardStats.averageOrderValue.value} // Already a string from API
                description={dashboardStats.averageOrderValue.description}
                trend={{
                  value: dashboardStats.averageOrderValue.trend.value,
                  positive: dashboardStats.averageOrderValue.trend.positive,
                }}
                icon={<Utensils size={24} />}
              />
            )}
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
                {isActivityLoading ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Loading chart data...
                  </div>
                ) : activityError ? (
                  <div className="h-[300px] flex items-center justify-center text-destructive">
                    Error: {activityError}
                  </div>
                ) : currentActivityData && currentActivityData.length > 0 ? (
                  <ActivityChart 
                    title={getChartTitle(revenueFilter)} 
                    data={currentActivityData} 
                  />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No activity data available for this period.
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="pie">
                <div className="h-[300px] w-full p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPC>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Revenue Share']}
                      />
                      <Legend />
                    </RechartsPC>
                  </ResponsiveContainer>
                </div>
                <h3 className="text-center text-sm font-medium mt-2 text-muted-foreground">
                  Revenue Distribution for {formatCurrentDate()}
                </h3>
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
                  onClick={() => alert("Full table usage report will be available in a future update.")}
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
