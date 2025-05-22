
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Filter, FileText, Plus, Users, DollarSign } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

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
  billAmount?: number;
}

// Mock data - would be fetched from API in real implementation
const initialReservationsData: Reservation[] = [
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
    status: 'completed',
    billAmount: 142.75
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

type DateFilterType = 'today' | 'week' | 'month' | 'custom';

export default function Reservations() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const guestIdFromQuery = queryParams.get('guest');
  const reservationIdFromQuery = queryParams.get('id');
  const { toast } = useToast();

  const [reservations, setReservations] = useState<Reservation[]>(initialReservationsData);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(),
    to: new Date()
  });
  const [dateFilter, setDateFilter] = useState<DateFilterType>('today');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>(reservations);
  const [isAddReservationOpen, setIsAddReservationOpen] = useState(false);
  const [isEditReservationOpen, setIsEditReservationOpen] = useState(false);
  const [newReservation, setNewReservation] = useState({
    guestId: guestIdFromQuery || '',
    date: new Date(),
    time: '19:00',
    partySize: 2,
    tableNumber: '',
    specialRequests: ''
  });
  const [billAmountDialogOpen, setBillAmountDialogOpen] = useState(false);
  const [currentBillAmount, setCurrentBillAmount] = useState<string>('');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const today = new Date();

  // Find reservation by ID if specified in query params
  useEffect(() => {
    if (reservationIdFromQuery) {
      const reservation = reservations.find(r => r.id === reservationIdFromQuery);
      if (reservation) {
        setSelectedReservation(reservation);
      }
    }
  }, [reservationIdFromQuery, reservations]);

  // Filter reservations based on date range, status, and guest
  useEffect(() => {
    let filtered = reservations;
    
    // Filter by date range
    if (dateFilter === 'today') {
      const today = new Date();
      filtered = filtered.filter(reservation => 
        reservation.date.getDate() === today.getDate() &&
        reservation.date.getMonth() === today.getMonth() &&
        reservation.date.getFullYear() === today.getFullYear()
      );
    } else if (dateFilter === 'week') {
      const startWeek = startOfWeek(today);
      const endWeek = endOfWeek(today);
      filtered = filtered.filter(reservation =>
        isWithinInterval(reservation.date, { start: startWeek, end: endWeek })
      );
    } else if (dateFilter === 'month') {
      const startMonth = startOfMonth(today);
      const endMonth = endOfMonth(today);
      filtered = filtered.filter(reservation =>
        isWithinInterval(reservation.date, { start: startMonth, end: endMonth })
      );
    } else if (dateFilter === 'custom' && dateRange.from) {
      if (dateRange.to) {
        filtered = filtered.filter(reservation =>
          isWithinInterval(reservation.date, { start: dateRange.from!, end: dateRange.to! })
        );
      } else {
        filtered = filtered.filter(reservation =>
          reservation.date.getDate() === dateRange.from!.getDate() &&
          reservation.date.getMonth() === dateRange.from!.getMonth() &&
          reservation.date.getFullYear() === dateRange.from!.getFullYear()
        );
      }
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
  }, [dateFilter, dateRange, statusFilter, guestIdFromQuery, reservations]);

  const handleReservationSelect = (reservation: Reservation) => {
    setSelectedReservation(reservation);
  };

  const handleBackClick = () => {
    setSelectedReservation(null);
    // Clear the URL param if it exists
    if (reservationIdFromQuery) {
      window.history.replaceState(null, '', '/reservations');
    }
  };

  const handleStatusChange = (status: 'confirmed' | 'pending' | 'cancelled' | 'completed') => {
    if (!selectedReservation) return;
    
    // If changing to completed, prompt for bill amount
    if (status === 'completed') {
      setBillAmountDialogOpen(true);
      return;
    }
    
    updateReservationStatus(status);
  };

  const updateReservationStatus = (status: 'confirmed' | 'pending' | 'cancelled' | 'completed', billAmount?: number) => {
    if (!selectedReservation) return;
    
    const updatedReservation = {
      ...selectedReservation,
      status,
      ...(billAmount !== undefined ? { billAmount } : {})
    };
    
    const updatedReservations = reservations.map(res => 
      res.id === updatedReservation.id ? updatedReservation : res
    );
    
    setReservations(updatedReservations);
    setSelectedReservation(updatedReservation);
    
    toast({
      title: "Status updated",
      description: `Reservation status changed to ${status}.`
    });
    
    setBillAmountDialogOpen(false);
    setCurrentBillAmount('');
  };

  const handleAddReservation = () => {
    // In a real app, this would validate more thoroughly and talk to an API
    
    const guestName = guestIdFromQuery ? 
      reservations.find(r => r.guestId === guestIdFromQuery)?.guestName || "Guest" : 
      "New Guest";
    
    const guestInitials = guestName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    
    const newId = `r${reservations.length + 1}`;
    
    const reservationToAdd: Reservation = {
      id: newId,
      guestId: newReservation.guestId,
      guestName,
      guestEmail: "email@example.com", // Would be fetched in real app
      guestInitials,
      date: newReservation.date,
      time: newReservation.time,
      partySize: newReservation.partySize,
      tableNumber: newReservation.tableNumber,
      status: 'confirmed',
      specialRequests: newReservation.specialRequests
    };
    
    setReservations([...reservations, reservationToAdd]);
    setIsAddReservationOpen(false);
    
    toast({
      title: "Reservation created",
      description: `Reservation for ${format(newReservation.date, 'PPP')} at ${newReservation.time} has been created.`
    });
    
    // Reset the form
    setNewReservation({
      guestId: '',
      date: new Date(),
      time: '19:00',
      partySize: 2,
      tableNumber: '',
      specialRequests: ''
    });
  };

  const handleEditReservation = () => {
    if (!selectedReservation) return;
    
    const updatedReservations = reservations.map(res => 
      res.id === selectedReservation.id ? selectedReservation : res
    );
    
    setReservations(updatedReservations);
    setIsEditReservationOpen(false);
    
    toast({
      title: "Reservation updated",
      description: "The reservation details have been updated."
    });
  };

  const handleBillConfirm = () => {
    if (!currentBillAmount.trim() || isNaN(Number(currentBillAmount))) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid bill amount.",
        variant: "destructive"
      });
      return;
    }
    
    updateReservationStatus('completed', Number(currentBillAmount));
  };

  const handleExport = () => {
    // Mock CSV export functionality
    const headers = ['ID', 'Guest', 'Date', 'Time', 'Party Size', 'Table', 'Status', 'Bill Amount'];
    const csvContent = [
      headers.join(','),
      ...filteredReservations.map(res => [
        res.id,
        res.guestName,
        format(res.date, 'yyyy-MM-dd'),
        res.time,
        res.partySize,
        res.tableNumber,
        res.status,
        res.billAmount || ''
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'reservations_export.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Export successful",
      description: "Reservations data has been exported to CSV."
    });
    
    setIsExportDialogOpen(false);
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

  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'custom':
        if (dateRange.from) {
          return dateRange.to
            ? `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`
            : format(dateRange.from, 'PPP');
        }
        return 'Select dates';
      default:
        return 'Date Filter';
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Reservations</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsExportDialogOpen(true)}
              className="hidden sm:flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              Export
            </Button>
            <Dialog open={isAddReservationOpen} onOpenChange={setIsAddReservationOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New Reservation</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Reservation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="reservation-guest">Guest</Label>
                    <Input 
                      id="reservation-guest" 
                      placeholder="Guest ID or search..." 
                      value={newReservation.guestId}
                      onChange={(e) => setNewReservation({...newReservation, guestId: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter guest ID or search from guest database
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {format(newReservation.date, "PPP")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={newReservation.date}
                            onSelect={(date) => date && setNewReservation({...newReservation, date})}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reservation-time">Time</Label>
                      <Input 
                        id="reservation-time" 
                        type="time" 
                        value={newReservation.time}
                        onChange={(e) => setNewReservation({...newReservation, time: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reservation-party">Party Size</Label>
                      <Input 
                        id="reservation-party" 
                        type="number" 
                        min="1" 
                        value={newReservation.partySize}
                        onChange={(e) => setNewReservation({...newReservation, partySize: parseInt(e.target.value) || 1})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reservation-table">Table</Label>
                      <Input 
                        id="reservation-table" 
                        placeholder="e.g. T01" 
                        value={newReservation.tableNumber}
                        onChange={(e) => setNewReservation({...newReservation, tableNumber: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reservation-requests">Special Requests</Label>
                    <Input 
                      id="reservation-requests" 
                      placeholder="Any special requests..." 
                      value={newReservation.specialRequests}
                      onChange={(e) => setNewReservation({...newReservation, specialRequests: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddReservationOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddReservation}>Create Reservation</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {!selectedReservation ? (
          <>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {getDateFilterLabel()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto" align="start">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">View period</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant={dateFilter === 'today' ? "default" : "outline"} 
                          className="w-full"
                          onClick={() => setDateFilter('today')}
                        >
                          Today
                        </Button>
                        <Button 
                          variant={dateFilter === 'week' ? "default" : "outline"} 
                          className="w-full"
                          onClick={() => setDateFilter('week')}
                        >
                          This Week
                        </Button>
                        <Button 
                          variant={dateFilter === 'month' ? "default" : "outline"} 
                          className="w-full"
                          onClick={() => setDateFilter('month')}
                        >
                          This Month
                        </Button>
                        <Button 
                          variant={dateFilter === 'custom' ? "default" : "outline"} 
                          className="w-full"
                          onClick={() => setDateFilter('custom')}
                        >
                          Custom
                        </Button>
                      </div>
                    </div>
                    
                    {dateFilter === 'custom' && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Custom range</h4>
                        <CalendarComponent
                          mode="range"
                          selected={{
                            from: dateRange.from,
                            to: dateRange.to
                          }}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                          className="p-3 pointer-events-auto"
                        />
                      </div>
                    )}
                  </div>
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
            
            <div className="mt-6 p-4 border rounded-md bg-muted/40">
              <h3 className="font-medium mb-4">Reservation Status</h3>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 text-center">
                    <span className={`inline-block w-4 h-4 rounded-full ${
                      selectedReservation.status === 'pending' || selectedReservation.status === 'confirmed' || 
                      selectedReservation.status === 'completed' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></span>
                    <p className="text-xs mt-1">Pending</p>
                  </div>
                  <div className="flex-1 text-center">
                    <span className={`inline-block w-4 h-4 rounded-full ${
                      selectedReservation.status === 'confirmed' || selectedReservation.status === 'completed' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></span>
                    <p className="text-xs mt-1">Confirmed</p>
                  </div>
                  <div className="flex-1 text-center">
                    <span className={`inline-block w-4 h-4 rounded-full ${
                      selectedReservation.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                    }`}></span>
                    <p className="text-xs mt-1">Completed</p>
                  </div>
                  <div className="flex-1 text-center">
                    <span className={`inline-block w-4 h-4 rounded-full ${
                      selectedReservation.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-300'
                    }`}></span>
                    <p className="text-xs mt-1">Cancelled</p>
                  </div>
                </div>
                
                <div className="h-1 bg-gray-200 mt-2">
                  <div 
                    className={`h-full ${
                      selectedReservation.status === 'cancelled' ? 'bg-red-500' : 
                      selectedReservation.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ 
                      width: selectedReservation.status === 'pending' ? '25%' : 
                             selectedReservation.status === 'confirmed' ? '50%' : 
                             selectedReservation.status === 'completed' ? '100%' : 
                             selectedReservation.status === 'cancelled' ? '100%' : '0%' 
                    }}
                  ></div>
                </div>
                
                <div className="flex justify-between mt-4">
                  <Button
                    size="sm"
                    variant={selectedReservation.status === 'pending' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('pending')}
                  >
                    Set Pending
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedReservation.status === 'confirmed' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('confirmed')}
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedReservation.status === 'completed' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('completed')}
                  >
                    Complete
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedReservation.status === 'cancelled' ? 'destructive' : 'outline'}
                    onClick={() => handleStatusChange('cancelled')}
                  >
                    Cancel
                  </Button>
                </div>
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
                
                {selectedReservation.status === 'completed' && selectedReservation.billAmount && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Bill Amount</h3>
                    <p className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                      {selectedReservation.billAmount.toFixed(2)}
                    </p>
                  </div>
                )}
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
              <Dialog open={isEditReservationOpen} onOpenChange={setIsEditReservationOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Edit Reservation</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Reservation</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {format(selectedReservation.date, "PPP")}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={selectedReservation.date}
                              onSelect={(date) => date && setSelectedReservation({...selectedReservation, date})}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="edit-reservation-time">Time</Label>
                        <Input 
                          id="edit-reservation-time" 
                          type="time" 
                          value={selectedReservation.time}
                          onChange={(e) => setSelectedReservation({...selectedReservation, time: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-reservation-party">Party Size</Label>
                        <Input 
                          id="edit-reservation-party" 
                          type="number" 
                          min="1" 
                          value={selectedReservation.partySize}
                          onChange={(e) => setSelectedReservation({
                            ...selectedReservation, 
                            partySize: parseInt(e.target.value) || 1
                          })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="edit-reservation-table">Table</Label>
                        <Input 
                          id="edit-reservation-table" 
                          value={selectedReservation.tableNumber}
                          onChange={(e) => setSelectedReservation({...selectedReservation, tableNumber: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-reservation-requests">Special Requests</Label>
                      <Input 
                        id="edit-reservation-requests" 
                        value={selectedReservation.specialRequests || ''}
                        onChange={(e) => setSelectedReservation({...selectedReservation, specialRequests: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditReservationOpen(false)}>Cancel</Button>
                    <Button onClick={handleEditReservation}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Link to={`/guests?id=${selectedReservation.guestId}`}>
                <Button variant="outline" className="bg-white">
                  View Guest Profile
                </Button>
              </Link>
            </div>
          </div>
        )}
        
        {/* Bill Amount Dialog */}
        <Dialog open={billAmountDialogOpen} onOpenChange={setBillAmountDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Enter Bill Amount</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="bill-amount">Bill Amount ($)</Label>
                <Input 
                  id="bill-amount" 
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={currentBillAmount}
                  onChange={(e) => setCurrentBillAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the final bill amount for this reservation
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBillAmountDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleBillConfirm}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Export Dialog */}
        <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Export Reservations</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <h4 className="text-sm font-medium">Select fields to export</h4>
              <div className="grid grid-cols-2 gap-2">
                {['Guest Name', 'Date', 'Time', 'Party Size', 'Table', 'Status', 'Bill Amount'].map((field) => (
                  <div key={field} className="flex items-center space-x-2">
                    <input type="checkbox" id={`export-${field}`} defaultChecked className="rounded border-gray-300" />
                    <Label htmlFor={`export-${field}`} className="text-sm">{field}</Label>
                  </div>
                ))}
              </div>
              
              <h4 className="text-sm font-medium pt-2">Date range to export</h4>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex-1">Current View</Button>
                <Button variant="outline" className="flex-1">All Dates</Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleExport}>Export CSV</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
