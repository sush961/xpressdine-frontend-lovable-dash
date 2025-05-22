
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Filter, Users } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Reservation {
  id: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestInitials: string;
  date: Date;
  time: string;
  partySize: number;
  tableNumber: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  specialRequests?: string;
}

// Mock data - would be fetched from API in real implementation
const reservationsData: Reservation[] = [
  {
    id: 'r1',
    guestId: '1',
    guestName: 'John Smith',
    guestEmail: 'john.smith@example.com',
    guestInitials: 'JS',
    date: new Date(2025, 4, 22), // May 22, 2025
    time: '19:00',
    partySize: 2,
    tableNumber: 'T12',
    status: 'confirmed',
    specialRequests: 'Anniversary dinner'
  },
  {
    id: 'r2',
    guestId: '2',
    guestName: 'Sarah Johnson',
    guestEmail: 'sarah.j@example.com',
    guestInitials: 'SJ',
    date: new Date(2025, 4, 22), // May 22, 2025
    time: '20:30',
    partySize: 4,
    tableNumber: 'T08',
    status: 'confirmed'
  },
  {
    id: 'r3',
    guestId: '3',
    guestName: 'Michael Chen',
    guestEmail: 'michael.c@example.com',
    guestInitials: 'MC',
    date: new Date(2025, 4, 23), // May 23, 2025
    time: '18:30',
    partySize: 3,
    tableNumber: 'T04',
    status: 'pending'
  },
  {
    id: 'r4',
    guestId: '4',
    guestName: 'Emma Wilson',
    guestEmail: 'emma.w@example.com',
    guestInitials: 'EW',
    date: new Date(2025, 4, 21), // May 21, 2025
    time: '19:30',
    partySize: 2,
    tableNumber: 'T06',
    status: 'completed'
  },
  {
    id: 'r5',
    guestId: '1',
    guestName: 'John Smith',
    guestEmail: 'john.smith@example.com',
    guestInitials: 'JS',
    date: new Date(2025, 4, 30), // May 30, 2025
    time: '18:00',
    partySize: 5,
    tableNumber: 'T02',
    status: 'confirmed'
  }
];

export default function Reservations() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const guestIdFromQuery = queryParams.get('guest');

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>(reservationsData);

  // Filter reservations based on date and status
  useEffect(() => {
    let filtered = reservationsData;
    
    // Filter by date
    if (date) {
      filtered = filtered.filter(reservation => 
        reservation.date.getDate() === date.getDate() &&
        reservation.date.getMonth() === date.getMonth() &&
        reservation.date.getFullYear() === date.getFullYear()
      );
    }
    
    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(reservation => reservation.status === statusFilter);
    }
    
    // Filter by guest if specified in URL
    if (guestIdFromQuery) {
      filtered = filtered.filter(reservation => reservation.guestId === guestIdFromQuery);
    }
    
    setFilteredReservations(filtered);
  }, [date, statusFilter, guestIdFromQuery]);

  const handleReservationSelect = (reservation: Reservation) => {
    setSelectedReservation(reservation);
  };

  const handleBackClick = () => {
    setSelectedReservation(null);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Reservations</h1>
          <Button variant="default">New Reservation</Button>
        </div>

        {!selectedReservation ? (
          <>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[240px] justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    {statusFilter ? `Status: ${statusFilter}` : 'Filter by status'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <div className="p-2 space-y-1">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => setStatusFilter(null)}
                    >
                      All statuses
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => setStatusFilter('confirmed')}
                    >
                      Confirmed
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => setStatusFilter('pending')}
                    >
                      Pending
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => setStatusFilter('cancelled')}
                    >
                      Cancelled
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => setStatusFilter('completed')}
                    >
                      Completed
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {guestIdFromQuery && (
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-muted-foreground">Filtered by guest</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2" 
                    onClick={() => window.location.href = '/reservations'}
                  >
                    Clear filter
                  </Button>
                </div>
              )}
            </div>

            <div className="rounded-md border">
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 p-4 border-b font-medium">
                <span>Guest & Time</span>
                <span>Party Size</span>
                <span>Table</span>
                <span>Status</span>
              </div>
              
              {filteredReservations.length > 0 ? (
                filteredReservations.map((reservation) => (
                  <div 
                    key={reservation.id}
                    className="grid grid-cols-[1fr_auto_auto_auto] gap-4 p-4 items-center hover:bg-muted cursor-pointer"
                    onClick={() => handleReservationSelect(reservation)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                        <AvatarFallback>{reservation.guestInitials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{reservation.guestName}</div>
                        <div className="text-muted-foreground">
                          {format(reservation.date, "MMM d, yyyy")} at {reservation.time}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                      {reservation.partySize}
                    </div>
                    <div>{reservation.tableNumber}</div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${getStatusBadgeClass(reservation.status)}`}>
                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No reservations found for the selected date and filters.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <Button 
              variant="ghost" 
              onClick={handleBackClick}
              className="mb-2"
            >
              ← Back to list
            </Button>
            
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 bg-primary text-primary-foreground">
                  <AvatarFallback>{selectedReservation.guestInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{selectedReservation.guestName}</h2>
                  <p className="text-muted-foreground">{selectedReservation.guestEmail}</p>
                </div>
              </div>
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${getStatusBadgeClass(selectedReservation.status)}`}>
                  {selectedReservation.status.charAt(0).toUpperCase() + selectedReservation.status.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date & Time</h3>
                  <p>{format(selectedReservation.date, "EEEE, MMMM d, yyyy")} at {selectedReservation.time}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Party Size</h3>
                  <p>{selectedReservation.partySize} people</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Table</h3>
                  <p>{selectedReservation.tableNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Special Requests</h3>
                  <p>{selectedReservation.specialRequests || 'None'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <Button variant="outline">Edit Reservation</Button>
              <Link to={`/guests?id=${selectedReservation.guestId}`}>
                <Button variant="outline" className="bg-white">
                  View Guest Profile
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
