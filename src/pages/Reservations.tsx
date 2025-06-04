
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Filter, FileText, Plus, Users, DollarSign } from 'lucide-react';
import { ApiClient } from '../lib/ApiClient'; // Added ApiClient import

// Table ID to name mapping
const TABLE_NAMES: Record<string, string> = {
  // Add more mappings as needed
  'table-1': 'T1',
  'table-2': 'T2',
  'table-3': 'T3',
  'table-4': 'T4',
  'table-5': 'T5',
  'table-6': 'T6',
  'table-7': 'T7',
  'table-8': 'T8',
};

// Helper function to get table name from ID
const getTableName = (tableId: string): string => {
  return TABLE_NAMES[tableId] || tableId; // Return the ID if no mapping exists
};
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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

// Interface for the raw data from the backend
interface BackendReservation {
  id: string;
  guest_id: string;
  customer_name: string;
  customer_email?: string | null;
  date: string; // YYYY-MM-DD string from DB
  time: string; // HH:MM string from DB
  reservation_time: string; // Full ISO timestamp string
  party_size: number;
  table_id: string; // UUID of the table
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  notes?: string | null;
  total_amount?: number | null;
  // Other fields like created_at, restaurant_id etc. will also be present from 'select *'
}

// Updated frontend Reservation interface
interface Reservation {
  id: string;
  guestId: string; // from guest_id
  guestName: string; // from customer_name
  guestEmail?: string; // from customer_email, made optional
  guestInitials: string; // Derived from customer_name
  date: Date; // Parsed from backend 'date' string or 'reservation_time'
  time: string; // From backend 'time' string
  partySize: number; // from party_size
  tableId: string; // Changed from tableNumber, will store table_id (UUID)
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no-show'; // Expanded status
  specialRequests?: string; // from notes
  billAmount?: number; // from total_amount
}

interface CustomerSearchResult {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

// Debounce utility
function debounce<F extends (...args: unknown[]) => unknown>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => ReturnType<F>;
}

// Helper function to create a date for today with a specific time
const todayAtHour = (hours: number, minutes: number) => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// Helper to get initials
const getInitials = (name: string = '') => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
};



type DateFilterType = 'today' | 'week' | 'month' | 'custom';

export default function Reservations() {
  // Calculate 'today' once per component mount, memoized
  const today = useMemo(() => new Date(), []);
  // Defensive UI before any logic or hooks
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const guestIdFromQuery = queryParams.get('guest');
  const reservationIdFromQuery = queryParams.get('id');
  const { toast } = useToast();

  const [reservations, setReservations] = useState<Reservation[]>([]); // Initialize with empty array
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date()
  });
  const [dateFilter, setDateFilter] = useState<DateFilterType>('today');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [isAddReservationOpen, setIsAddReservationOpen] = useState(false);
  const [isEditReservationOpen, setIsEditReservationOpen] = useState(false);
  // Fetch reservations from API
  const fetchReservations = useCallback(async () => {
    console.log('[Reservations.tsx] Starting to fetch reservations...');
    setLoading(true);
    setFetchError(null);
    try {
      const fetchedData = await ApiClient.get<BackendReservation[]>('/reservations');
      console.log('[Reservations.tsx] Response data from ApiClient.get /reservations:', fetchedData);

      if (!Array.isArray(fetchedData)) {
        throw new Error('Invalid data format received for reservations.');
      }

      const formattedReservations = fetchedData.map((res: BackendReservation) => ({
        id: res.id,
        guestId: res.guest_id,
        guestName: res.customer_name,
        guestEmail: res.customer_email || undefined,
        guestInitials: getInitials(res.customer_name),
        date: new Date(res.date + 'T00:00:00'), // Assuming res.date is YYYY-MM-DD, parse as local midnight
        time: res.time, // HH:MM string
        partySize: res.party_size,
        tableId: res.table_id, // Store table_id
        status: res.status,
        specialRequests: res.notes || undefined,
        billAmount: res.total_amount || undefined,
      }));
      
      console.log('[Reservations.tsx] Formatted reservations:', formattedReservations);
      setReservations(formattedReservations);
      // setFilteredReservations(formattedReservations); // Filtering will be applied later
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch reservations';
      setFetchError(errorMessage);
      toast({
        title: "Error Fetching Reservations",
        description: errorMessage,
        variant: "destructive"
      });
      setReservations([]); // Clear reservations on error
      // setFilteredReservations([]);
    } finally {
      console.log('[Reservations.tsx] Finished fetching reservations attempt.');
      setLoading(false);
    }
  }, [toast]);

  // Fetch reservations when component mounts
  useEffect(() => {
    console.log('[Reservations.tsx] Component mounted, fetching reservations...');
    fetchReservations();
  }, [fetchReservations]);

  const [newReservation, setNewReservation] = useState({
    guestId: guestIdFromQuery || '',
    guestName: '', 
    guestEmail: '', // Added for selected guest's email
    date: new Date(),
    time: '19:00',
    partySize: 2,
    tableNumber: '',
    specialRequests: ''
  });
  const [billAmountDialogOpen, setBillAmountDialogOpen] = useState(false);
  const [currentBillAmount, setCurrentBillAmount] = useState<string>('');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [guestSearchTerm, setGuestSearchTerm] = useState('');
  const [guestSearchResults, setGuestSearchResults] = useState<CustomerSearchResult[]>([]);
  const [isGuestSearchLoading, setIsGuestSearchLoading] = useState(false);
  const [guestSearchError, setGuestSearchError] = useState<string | null>(null);
  const [isCreateGuestDialogOpen, setIsCreateGuestDialogOpen] = useState(false);
  const [newGuestDetails, setNewGuestDetails] = useState({ name: '', email: '', phone: '' });
  const [isCreatingGuest, setIsCreatingGuest] = useState(false);
  const [createGuestError, setCreateGuestError] = useState<string | null>(null);

  const handleCreateGuest = async () => {
    if (!newGuestDetails.name.trim()) {
      setCreateGuestError("Guest name is required.");
      return;
    }
    // Optional: Add more validation for email or phone if needed

    setIsCreatingGuest(true);
    setCreateGuestError(null);
    const API_BASE_URL = 'https://xpressdine-backend.vercel.app';

    try {
      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newGuestDetails.name,
          email: newGuestDetails.email || null, // Send null if empty, backend might handle it
          phone: newGuestDetails.phone || null, // Send null if empty
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Failed to create guest:', responseData);
        setCreateGuestError(responseData.error || responseData.message || 'An unknown error occurred.');
        setIsCreatingGuest(false);
        return;
      }

      // Guest created successfully
      toast({
        title: "Guest Created Successfully",
        description: `${responseData.name} has been added to the system.`
      });

      // Update reservation form with new guest details
      setNewReservation(prev => ({
        ...prev,
        guestId: responseData.id,
        guestName: responseData.name,
        guestEmail: responseData.email || '',
      }));
      setGuestSearchTerm(responseData.name); // Pre-fill search with new guest's name
      setGuestSearchResults([]); // Clear previous search results

      setIsCreateGuestDialogOpen(false);
      setNewGuestDetails({ name: '', email: '', phone: '' }); // Reset form
      setIsCreatingGuest(false);

    } catch (error: unknown) {
      console.error('Network or unexpected error creating guest:', error);
      let errorMessage = 'A network error occurred. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      setCreateGuestError(errorMessage);
      setIsCreatingGuest(false);
    }
  };

  const rawFetchGuestSuggestions = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) { // Minimum characters to trigger search
      setGuestSearchResults([]);
      return;
    }
    setIsGuestSearchLoading(true);
    setGuestSearchError(null);
    try {
      const path = `/api/customers?search=${encodeURIComponent(searchTerm)}`;
      // Assuming ApiClient.get returns an object with a 'data' property which is an array of CustomerSearchResult
      const responseData = await ApiClient.get<{ data: CustomerSearchResult[] }>(path);
      setGuestSearchResults(responseData.data || []);
    } catch (error: unknown) {
      console.error('Error fetching guest suggestions:', error);
      let message = 'An unknown error occurred while fetching guest suggestions.';
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: string }).message === 'string') {
        message = (error as { message: string }).message;
      } else if (typeof error === 'string') {
        message = error;
      }
      setGuestSearchError(message);
      setGuestSearchResults([]);
    }
    setIsGuestSearchLoading(false);
  }, [setGuestSearchResults, setIsGuestSearchLoading, setGuestSearchError]);

  const fetchGuestSuggestions = useMemo(
    () => debounce(rawFetchGuestSuggestions, 300),
    [rawFetchGuestSuggestions]
  );


  
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
  }, [dateFilter, dateRange, statusFilter, guestIdFromQuery, reservations, today]);

  // Defensive UI before any logic or hooks
  if (loading) {
    return <div>Loading reservations...</div>;
  }
  if (fetchError) {
    return <div>Failed to Load Reservations: {fetchError}</div>;
  }
  if (!Array.isArray(filteredReservations)) {
    return <div>Failed to Load Reservations: Data is not an array.</div>;
  }


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
    toast({
      title: "Status updated",
      description: `Reservation status changed to ${status}.`
    });
    
    setBillAmountDialogOpen(false);
    setCurrentBillAmount('');
  };

  const handleAddReservation = async () => {
    // Basic validation: Ensure a guest is selected if guest search was attempted or if guestId is expected
    if (!newReservation.guestId && guestSearchTerm) {
      toast({
        title: "Guest Not Selected",
        description: "Please select a guest from the search results or clear the search to enter manually (if supported).",
        variant: "destructive"
      });
      return;
    }
    if (!newReservation.guestId) {
        toast({
            title: "Guest Required",
            description: "Please search and select a guest for the reservation.",
            variant: "destructive"
          });
        return;
    }

    // API Integration for creating reservation
    const API_BASE_URL = 'https://xpressdine-backend.vercel.app'; // As per memory 40a8a55f-d360-49d3-985f-6e98ff5f7f42

    const payload = {
      guestId: newReservation.guestId,
      guestName: newReservation.guestName,
      guestEmail: newReservation.guestEmail,
      date: format(newReservation.date, 'yyyy-MM-dd'), // Format date for API
      time: newReservation.time,
      partySize: newReservation.partySize,
      tableNumber: newReservation.tableNumber,
      specialRequests: newReservation.specialRequests,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Failed to create reservation:', responseData);
        toast({
          title: "Error Creating Reservation",
          description: responseData.error || responseData.details || 'An unknown error occurred.',
          variant: "destructive"
        });
        return;
      }

      // Map API response to frontend Reservation type
      const createdReservation: Reservation = {
        id: responseData.id,
        guestId: responseData.guest_id,
        guestName: responseData.customer_name,
        guestEmail: responseData.customer_email || '',
        guestInitials: (responseData.customer_name || "GU").split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'GU',
        date: new Date(responseData.reservation_time), // Convert ISO string to Date object
        time: format(new Date(responseData.reservation_time), 'HH:mm'), // Extract time
        partySize: responseData.party_size,
        tableId: responseData.table_id, // Use table_id from backend response 
        status: responseData.status as Reservation['status'],
        specialRequests: responseData.notes || undefined,
        // billAmount is not part of creation response
      };

      // setReservations(prevReservations => [...prevReservations, createdReservation]); // Replaced by fetchReservations
      fetchReservations(); // Refresh the list from the backend
      setIsAddReservationOpen(false);

      toast({
        title: "Reservation Created Successfully",
        description: `Reservation for ${createdReservation.guestName} on ${format(createdReservation.date, 'PPP')} at ${createdReservation.time} has been created.`
      });

    } catch (error: unknown) {
      console.error('Network or unexpected error creating reservation:', error);
      let errorMessage = 'A network error occurred. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      toast({
        title: "Creation Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return; // Keep dialog open for user to retry or check details
    }
    
    // Reset the form
    setNewReservation({
      guestId: '',
      guestName: '',
      guestEmail: '', // Added to fix lint error
      date: new Date(),
      time: '19:00',
      partySize: 2,
      tableNumber: '',
      specialRequests: ''
    });
    setGuestSearchTerm('');
    setGuestSearchResults([]);
  };

  const handleEditReservation = async () => {
    if (!selectedReservation) return;
    
    const API_BASE_URL = 'https://xpressdine-backend.vercel.app'; // As per memory 40a8a55f-d360-49d3-985f-6e98ff5f7f42

    if (!selectedReservation || !selectedReservation.id) {
      toast({
        title: "Error",
        description: "No reservation selected for editing.",
        variant: "destructive"
      });
      return;
    }

    const payload = {
      guestId: selectedReservation.guestId,
      guestName: selectedReservation.guestName,
      guestEmail: selectedReservation.guestEmail,
      date: format(selectedReservation.date, 'yyyy-MM-dd'),
      time: selectedReservation.time,
      partySize: selectedReservation.partySize,
      table_number: selectedReservation.tableId, // Send tableId (as string) as table_number
      status: selectedReservation.status,
      specialRequests: selectedReservation.specialRequests,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/reservations/${selectedReservation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Failed to update reservation:', responseData);
        toast({
          title: "Error Updating Reservation",
          description: responseData.error || responseData.details || 'An unknown error occurred.',
          variant: "destructive"
        });
        return;
      }

      // Map API response to frontend Reservation type
      const updatedReservationFromAPI: Reservation = {
        id: responseData.id,
        guestId: responseData.guest_id,
        guestName: responseData.customer_name,
        guestEmail: responseData.customer_email || '',
        guestInitials: (responseData.customer_name || "GU").split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'GU',
        date: new Date(responseData.reservation_time), // Convert ISO string to Date object
        time: format(new Date(responseData.reservation_time), 'HH:mm'), // Extract time
        partySize: responseData.party_size,
        tableId: responseData.table_id, // Use table_id from backend response
        status: responseData.status as Reservation['status'],
        specialRequests: responseData.notes || undefined,
        billAmount: responseData.bill_amount || undefined, // If backend sends it
      };

      // Backend has updated the reservation. Now refresh the list from the backend.
      fetchReservations(); 
      setSelectedReservation(null); // Clear selection, or re-select based on fetched data if needed.
      setIsEditReservationOpen(false);

      toast({
        title: "Reservation Updated Successfully",
        description: `Reservation for ${updatedReservationFromAPI.guestName} has been updated.`
      });

    } catch (error: unknown) {
      console.error('Network or unexpected error updating reservation:', error);
      let errorMessage = 'A network error occurred. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive"
      });
      // Keep dialog open for user to retry or check details
    }
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
        res.tableId,
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
                  <div className="space-y-2 relative">
                    <Label htmlFor="reservation-guest-search">Guest</Label>
                    <Input 
                      id="reservation-guest-search" 
                      placeholder="Search guest by name, email, or phone..." 
                      value={guestSearchTerm || newReservation.guestName} // Display search term or selected guest name
                      onChange={(e) => {
                        const searchTermValue = e.target.value;
                        setGuestSearchTerm(searchTermValue);
                        // Clear guestId and guestEmail if user is typing/modifying, keep guestName for display
                        setNewReservation(prev => ({ ...prev, guestName: searchTermValue, guestId: '', guestEmail: '' })); 
                        fetchGuestSuggestions(searchTermValue);
                      }}
                      onFocus={() => { // Clear previous selection if user focuses to search again
                        if (newReservation.guestId) {
                          setNewReservation(prev => ({ ...prev, guestName: '', guestId: '', guestEmail: '' }));
                          setGuestSearchTerm('');
                          setGuestSearchResults([]);
                        }
                      }}
                    />
                    {isGuestSearchLoading && <p className="text-xs text-muted-foreground mt-1">Searching...</p>}
                    {guestSearchError && <p className="text-xs text-destructive mt-1">Error: {guestSearchError}</p>}
                    {guestSearchResults.length > 0 && (
                      <ul className="absolute z-10 w-full bg-background border border-border rounded-md shadow-lg max-h-48 overflow-auto mt-1">
                        {guestSearchResults.map((guest) => (
                          <li
                            key={guest.id}
                            className="px-3 py-2 hover:bg-accent cursor-pointer"
                            onClick={() => {
                              setNewReservation(prev => ({
                                ...prev,
                                guestId: guest.id,
                                guestName: guest.name,
                                guestEmail: guest.email || '',
                              }));
                              setGuestSearchTerm('');
                              setGuestSearchResults([]);
                              setGuestSearchError(null);
                            }}
                          >
                            <p className="font-medium">{guest.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {guest.phone && <span>{guest.phone}</span>}
                              {guest.email && guest.phone && <span className="mx-1">·</span>}
                              {guest.email && <span>{guest.email}</span>}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                    {!isGuestSearchLoading && guestSearchTerm.length > 0 && guestSearchResults.length === 0 && !guestSearchError && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">No guests found matching "{guestSearchTerm}".</p>
                          <Button variant="link" size="sm" className="text-primary h-auto p-0 text-xs" onClick={() => setIsCreateGuestDialogOpen(true)}>
                            Create New Guest
                          </Button>
                        </div>
                    )}
                    {guestSearchTerm.length === 0 && guestSearchResults.length === 0 && (
                      <p className="text-xs text-muted-foreground mt-1">Search for an existing guest by name, email, or phone.</p>
                    )}
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

            {/* Create New Guest Dialog */}
            <Dialog open={isCreateGuestDialogOpen} onOpenChange={setIsCreateGuestDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Guest</DialogTitle>
                  <DialogDescription>
                    Add a new guest to the system. This guest will then be selected for the current reservation.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="guest-name" className="text-right">
                      Name
                    </Label>
                    <Input 
                      id="guest-name" 
                      value={newGuestDetails.name} 
                      onChange={(e) => setNewGuestDetails({...newGuestDetails, name: e.target.value})} 
                      className="col-span-3" 
                      placeholder="Full Name"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="guest-email" className="text-right">
                      Email
                    </Label>
                    <Input 
                      id="guest-email" 
                      type="email"
                      value={newGuestDetails.email} 
                      onChange={(e) => setNewGuestDetails({...newGuestDetails, email: e.target.value})} 
                      className="col-span-3" 
                      placeholder="guest@example.com"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="guest-phone" className="text-right">
                      Phone
                    </Label>
                    <Input 
                      id="guest-phone" 
                      value={newGuestDetails.phone} 
                      onChange={(e) => setNewGuestDetails({...newGuestDetails, phone: e.target.value})} 
                      className="col-span-3" 
                      placeholder="(123) 456-7890"
                    />
                  </div>
                  {createGuestError && (
                    <p className="text-sm text-destructive col-span-4 text-center">{createGuestError}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsCreateGuestDialogOpen(false);
                    setNewGuestDetails({ name: '', email: '', phone: '' });
                    setCreateGuestError(null);
                  }}>Cancel</Button>
                  <Button onClick={handleCreateGuest} disabled={isCreatingGuest}>
                    {isCreatingGuest ? 'Creating...' : 'Create Guest'}
                  </Button>
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
                          onSelect={(range) => {
                            if (range?.from && range?.to) {
                              setDateRange({
                                from: range.from,
                                to: range.to
                              });
                            }
                          }}
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
                    <div>{getTableName(reservation.tableId)}</div>
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
                  <p>{getTableName(selectedReservation.tableId)}</p>
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
                        <select
                          id="edit-reservation-table"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={selectedReservation.tableId}
                          onChange={(e) => setSelectedReservation({...selectedReservation, tableId: e.target.value})}
                        >
                          <option value="">Select a table</option>
                          {Object.entries(TABLE_NAMES).map(([id, name]) => (
                            <option key={id} value={id}>{name}</option>
                          ))}
                        </select>
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
