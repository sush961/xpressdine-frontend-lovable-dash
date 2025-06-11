import { useState, useEffect, useCallback, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Link, useLocation } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  FileText, 
  Plus, 
  DollarSign
} from 'lucide-react';
import { ApiClient } from '@/lib/ApiClient';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { 
  Avatar, 
  AvatarFallback
} from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

type DateFilterType = 'today' | 'tomorrow' | 'this-week' | 'next-week' | 'this-month' | 'custom' | 'week' | 'month';

// Interface for table data from the API
interface Table {
  id: string;
  number: number;
  capacity: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// Helper function to format table name from table data
const getTableName = (table: Table | string | undefined, tablesList: Table[] = []): string => {
  if (!table) return 'TBD';
  if (typeof table === 'string') {
    // Try to find the table by number
    const foundTable = tablesList.find(t => t.number.toString() === table);
    return foundTable ? `T${foundTable.number}` : `T${table}`;
  }
  return `T${table.number}`;
};

// Updated frontend Reservation interface - FIXED: Updated status to match actual database
interface Reservation {
  id: string;
  guestName: string; // from customer_name
  guestEmail?: string; // from customer_email, made optional
  guestInitials: string; // Derived from customer_name
  date: Date; // Parsed from backend 'date' string or 'reservation_time'
  time: string; // From backend 'time' string
  end_time?: Date | null; // New: reservation end time
  partySize: number; // from party_size
  tableId: string; // Changed from tableNumber, will store table number as string
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'seated'; // FIXED: Updated to match actual database ENUM
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

// Helper to get initials
const getInitials = (name: string = ''): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
};

export default function Reservations(): JSX.Element {
  // Calculate 'today' once per component mount, memoized
  const today = useMemo(() => new Date(), []);
  // Defensive UI before any logic or hooks
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const reservationIdFromQuery = queryParams.get('id');
  const { toast } = useToast();

  // Date and filter states
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(),
    to: new Date()
  });
  const [dateFilter, setDateFilter] = useState<DateFilterType>('today');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // Reservation data states
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog and modal states
  const [isAddReservationOpen, setIsAddReservationOpen] = useState(false);
  const [isEditReservationOpen, setIsEditReservationOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [billAmountDialogOpen, setBillAmountDialogOpen] = useState(false);
  
  // Current selection states
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [currentReservationForBill, setCurrentReservationForBill] = useState<Reservation | null>(null);
  const [currentBillAmount, setCurrentBillAmount] = useState<string>('');
  
  // Guest related states
  const [guestSearchTerm, setGuestSearchTerm] = useState('');
  const [guestSearchResults, setGuestSearchResults] = useState<CustomerSearchResult[]>([]);
  const [isGuestSearchLoading, setIsGuestSearchLoading] = useState(false);
  const [guestSearchError, setGuestSearchError] = useState<string | null>(null);
  
  // Table states
  const [tables, setTables] = useState<Table[]>([]);
  const [isTablesLoading, setIsTablesLoading] = useState(true);
  const [tablesError, setTablesError] = useState<string | null>(null);
  
  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  
  // New reservation form state
  interface NewReservationState {
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    date: Date;
    time: string;
    end_time: Date | null;
    partySize: number;
    tableId: string;
    specialRequests: string;
  }

  // Initialize new reservation with default values
  const [newReservation, setNewReservation] = useState<NewReservationState>({
    guestName: '', 
    guestEmail: '',
    guestPhone: '',
    date: new Date(),
    time: '19:00',
    end_time: null,
    partySize: 2,
    tableId: '',
    specialRequests: ''
  });

  // Optimistic update helper
  const updateReservationOptimistically = useCallback((
    reservationId: string, 
    updates: Partial<Reservation>
  ) => {
    setReservations(prev => prev.map(r => 
      r.id === reservationId ? { ...r, ...updates } : r
    ));
    setFilteredReservations(prev => prev.map(r => 
      r.id === reservationId ? { ...r, ...updates } : r
    ));
    if (selectedReservation?.id === reservationId) {
      setSelectedReservation(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedReservation]);

  // Fetch reservations from API
  const fetchReservations = useCallback(async (): Promise<void> => {
    if (reservations.length === 0) {
      setIsLoading(true);
    }
    
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reservations`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      const transformedData: Reservation[] = data.map((item: any) => ({
        id: item.id,
        guestName: item.guestName || item.name || item.customer_name || '',
        guestEmail: item.guestEmail || item.email || item.customer_email || '',
        guestInitials: getInitials(item.guestName || item.name || item.customer_name || ''),
        date: (() => {
          const dateStr = item.date || item.reservation_time || item.date_time;
          if (dateStr && typeof dateStr === 'string' && dateStr.trim() !== '') {
            try {
              return new Date(dateStr);
            } catch (e) {
              console.error('Invalid date format from API:', dateStr, e);
              return new Date();
            }
          }
          return new Date();
        })(),
        time: item.time || (item.reservation_time ? format(new Date(item.reservation_time), 'HH:mm') : ''),
        end_time: item.endTime || item.end_time ? new Date(item.endTime || item.end_time) : null,
        partySize: item.partySize || item.party_size || item.guests || 0,
        tableId: item.tableNumber || item.tableId || item.table_id || '',
        status: (item.status as Reservation['status']) || 'pending',
        specialRequests: item.specialRequests || item.notes || '',
        billAmount: item.billAmount || item.bill_amount
      }));

      setReservations(transformedData);
      setFilteredReservations(transformedData);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Failed to fetch reservations:", error);
      setError(`Failed to fetch reservations: ${error.message}`);
      
      if (reservations.length === 0) {
        toast({
          title: "Error Fetching Reservations",
          description: error.message,
          variant: "destructive"
        });
      }
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast, reservations.length]);

  // Update reservation status - Simplified to only send status and bill amount
  const performUpdateReservationStatus = useCallback(async (
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed', 
    billAmount?: number
  ): Promise<void> => {
    if (!selectedReservation) return;

    const updates: Partial<Reservation> = { status };
    if (billAmount !== undefined) {
      updates.billAmount = billAmount;
    }
    
    updateReservationOptimistically(selectedReservation.id, updates);

    toast({
      title: "Reservation Updated",
      description: `Reservation status successfully set to ${status}.`,
    });

    setBillAmountDialogOpen(false);
    setCurrentBillAmount('');

    try {
      const payload: any = { status: status };
      if (status === 'completed' && billAmount !== undefined) {
        payload.billAmount = billAmount;
      }

      console.log('Sending status update:', payload);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reservations/${selectedReservation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

    } catch (err: unknown) {
      const revertUpdates: Partial<Reservation> = {
        status: selectedReservation.status
      };
      if (billAmount !== undefined) {
        revertUpdates.billAmount = selectedReservation.billAmount;
      }
      
      updateReservationOptimistically(selectedReservation.id, revertUpdates);

      const error = err as Error;
      console.error("Failed to update reservation:", error);
      toast({
        title: "Update Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [selectedReservation, toast, updateReservationOptimistically]);

  // Function to fetch all tables for dropdown population
  const fetchTables = useCallback(async (): Promise<void> => {
    setIsTablesLoading(true);
    setTablesError(null);
    try {
      // Use current date as default for fetching all tables
      const currentDate = format(new Date(), 'yyyy-MM-dd');
      
      // Call the API with date parameter (required) but no time (returns all tables)
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/tables?date=${currentDate}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle both response formats from your API
      if (data.availableTables) {
        // When date/time provided, API returns {availableTables: [...]}
        setTables(Array.isArray(data.availableTables) ? data.availableTables : []);
      } else if (Array.isArray(data)) {
        // When only date provided, API returns array directly
        setTables(data);
      } else {
        console.warn('Unexpected API response format:', data);
        setTables([]);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      setTablesError('Failed to load tables. Please try again later.');
      setTables([]);
    } finally {
      setIsTablesLoading(false);
    }
  }, []);

  // Function to fetch available tables for specific date/time
  const fetchAvailableTables = useCallback(async (date: Date, time: string): Promise<Table[]> => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/tables?date=${dateStr}&time=${time}&duration=90`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.availableTables || [];
    } catch (error) {
      console.error('Error fetching available tables:', error);
      return [];
    }
  }, []);

  // Error handler for table operations
  const handleTableError = useCallback((error: unknown, operation: string) => {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error(`Table ${operation} error:`, error);
    
    toast({
      title: `Table ${operation} Failed`,
      description: message,
      variant: "destructive"
    });
  }, [toast]);

  // Fetch reservations and tables when component mounts
  useEffect(() => {
    console.log('[Reservations.tsx] Component mounted, fetching reservations and tables...');
    fetchReservations();
    fetchTables();
  }, [fetchReservations, fetchTables]);

  const rawFetchGuestSuggestions = useCallback(async (searchTerm: string): Promise<void> => {
    if (searchTerm.length < 2) {
      setGuestSearchResults([]);
      return;
    }
    setIsGuestSearchLoading(true);
    setGuestSearchError(null);
    try {
      const path = `/api/customers/search?q=${encodeURIComponent(searchTerm)}`;
      const responseData = await ApiClient.get<CustomerSearchResult[]>(path);
      setGuestSearchResults(responseData || []);
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
  }, []);

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

  // Filter reservations based on date range and status
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
    
    setFilteredReservations(filtered);
  }, [dateFilter, dateRange, statusFilter, reservations, today]);

  const handleBillConfirm = useCallback((): void => {
    const billAmount = currentBillAmount.trim() ? Number(currentBillAmount) : 0;
    if (currentBillAmount.trim() && isNaN(billAmount)) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid bill amount.",
        variant: "destructive"
      });
      return;
    }
    if (currentReservationForBill) {
      performUpdateReservationStatus('completed', billAmount);
    } else {
      toast({
        title: "Error",
        description: "No reservation selected for billing.",
        variant: "destructive"
      });
    }
    setBillAmountDialogOpen(false);
  }, [currentBillAmount, toast, performUpdateReservationStatus, currentReservationForBill]);

  const handleExport = useCallback((): void => {
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
  }, [filteredReservations, toast]);

  // Defensive UI before any logic or hooks
  if (isLoading) {
    return <div>Loading reservations...</div>;
  }
  if (error) {
    return <div>Failed to Load Reservations: {error}</div>;
  }
  if (!Array.isArray(filteredReservations)) {
    return <div>Failed to Load Reservations: Data is not an array.</div>;
  }

  const handleReservationSelect = (reservation: Reservation): void => {
    setSelectedReservation(reservation);
  };

  const handleBackClick = (): void => {
    setSelectedReservation(null);
    if (reservationIdFromQuery) {
      window.history.replaceState(null, '', '/reservations');
    }
  };

  const handleStatusChange = (status: 'confirmed' | 'pending' | 'cancelled' | 'completed'): void => {
    if (!selectedReservation) return;
    
    if (status === 'completed') {
      setCurrentReservationForBill(selectedReservation);
      setCurrentBillAmount(selectedReservation.billAmount?.toString() || ''); 
      setBillAmountDialogOpen(true);
      return;
    }
    
    performUpdateReservationStatus(status);
  };

  const selectedTable = tables.find(t => t.number.toString() === newReservation.tableId);

  const handleAddReservation = async (): Promise<void> => {
    if (!import.meta.env.VITE_RESTAURANT_ID) {
      toast({
        title: "Configuration Error",
        description: "Restaurant ID is not configured. Please contact support.",
        variant: "destructive"
      });
      return;
    }

    if (!newReservation.guestName || !newReservation.guestPhone) {
      toast({
        title: "Guest Required",
        description: "Please search and select a guest first.",
        variant: "destructive"
      });
      return;
    }
    if (!newReservation.date) {
      toast({
        title: "Date Required", 
        description: "Please select a date for the reservation.",
        variant: "destructive"
      });
      return;
    }
    if (!newReservation.time) {
      toast({
        title: "Time Required",
        description: "Please select a time for the reservation.",
        variant: "destructive"
      });
      return;
    }
    if (!newReservation.partySize || newReservation.partySize < 1) {
      toast({
        title: "Party Size Required",
        description: "Please enter a valid party size.",
        variant: "destructive"
      });
      return;
    }
    if (!newReservation.tableId) {
      toast({
        title: "Table Required",
        description: "Please select a table for the reservation.",
        variant: "destructive"
      });
      return;
    }
    if (selectedTable && newReservation.partySize > selectedTable.capacity) {
      toast({
        title: "Party Size Exceeds Table Capacity",
        description: `Selected table only seats ${selectedTable.capacity}. Reduce party size or pick a larger table.`,
        variant: "destructive"
      });
      return;
    }

    const tempReservation: Reservation = {
      id: `temp-${Date.now()}`,
      guestName: newReservation.guestName,
      guestEmail: newReservation.guestEmail,
      guestInitials: getInitials(newReservation.guestName),
      date: newReservation.date,
      time: newReservation.time,
      end_time: newReservation.end_time,
      partySize: newReservation.partySize,
      tableId: newReservation.tableId,
      status: 'pending',
      specialRequests: newReservation.specialRequests,
      billAmount: 0
    };

    setReservations(prev => [tempReservation, ...prev]);
    setFilteredReservations(prev => [tempReservation, ...prev]);

    setIsAddReservationOpen(false);
    setNewReservation({
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      date: new Date(),
      time: '19:00',
      end_time: null,
      partySize: 2,
      tableId: '',
      specialRequests: ''
    });
    setGuestSearchTerm('');
    setGuestSearchResults([]);

    toast({
      title: "Reservation Created",
      description: `Reservation for ${tempReservation.guestName} has been created successfully.`,
      variant: "default"
    });

    try {
      const payload = {
        guestName: newReservation.guestName,
        guestEmail: newReservation.guestEmail,
        guestPhone: newReservation.guestPhone,
        date: format(newReservation.date, 'yyyy-MM-dd'),
        time: newReservation.time,
        partySize: Number(newReservation.partySize),
        tableId: newReservation.tableId,
        special_requests: newReservation.specialRequests || undefined,
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Failed to create reservation');
      }

      const realReservation: Reservation = {
        id: responseData.id,
        guestName: responseData.guestName,
        guestEmail: responseData.guestEmail || '',
        guestInitials: getInitials(responseData.guestName),
        date: new Date(responseData.date),
        time: responseData.time,
        end_time: responseData.endTime ? new Date(responseData.endTime) : null,
        partySize: responseData.partySize,
        tableId: responseData.tableNumber || responseData.tableId,
        status: responseData.status,
        specialRequests: responseData.specialRequests || '',
        billAmount: responseData.billAmount || 0
      };

      setReservations(prev => prev.map(r => r.id === tempReservation.id ? realReservation : r));
      setFilteredReservations(prev => prev.map(r => r.id === tempReservation.id ? realReservation : r));

    } catch (error) {
      setReservations(prev => prev.filter(r => r.id !== tempReservation.id));
      setFilteredReservations(prev => prev.filter(r => r.id !== tempReservation.id));
      
      console.error('Error creating reservation:', error);
      toast({
        title: "Error Creating Reservation",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    }
  };

  const handleEditReservation = async (): Promise<void> => {
    if (!selectedReservation) return;

    if (!import.meta.env.VITE_RESTAURANT_ID) {
      toast({
        title: "Configuration Error",
        description: "Restaurant ID is not configured. Please contact support.",
        variant: "destructive"
      });
      return;
    }

    updateReservationOptimistically(selectedReservation.id, selectedReservation);

    setIsEditReservationOpen(false);

    toast({
      title: "Reservation Updated Successfully",
      description: `Reservation has been updated.`
    });

    const payload = {
      guestName: selectedReservation.guestName,
      guestEmail: selectedReservation.guestEmail || '',
      date: format(selectedReservation.date, 'yyyy-MM-dd'),
      time: selectedReservation.time,
      partySize: selectedReservation.partySize,
      tableNumber: selectedReservation.tableId,
      special_requests: selectedReservation.specialRequests || '',
      status: selectedReservation.status || 'pending'
    };

    console.log('Sending update reservation payload:', payload);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reservations/${selectedReservation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || responseData.details || responseData.message || 'An unknown error occurred.');
      }

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
    }
  };

  // FIXED: Added 'seated' status badge handling
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'seated':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDateFilterLabel = (): React.ReactNode => {
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
                  {/* Guest Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="reservation-guest">Guest</Label>
                    <div className="relative">
                      <Input
                        id="reservation-guest"
                        placeholder="Search guest by name, email, or phone..."
                        value={guestSearchTerm}
                        onChange={e => {
                          setGuestSearchTerm(e.target.value);
                          fetchGuestSuggestions(e.target.value);
                        }}
                        autoComplete="off"
                      />
                      {guestSearchTerm && guestSearchResults.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200 max-h-40 overflow-auto">
                          {guestSearchResults.map(guest => (
                            <div
                              key={guest.id}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setNewReservation(prev => ({
                                  ...prev,
                                  guestName: guest.name,
                                  guestEmail: guest.email || '',
                                  guestPhone: guest.phone || ''
                                }));
                                setGuestSearchTerm(guest.name);
                                setGuestSearchResults([]);
                              }}
                            >
                              <div className="font-medium">{guest.name}</div>
                              <div className="text-xs text-gray-500">{guest.email} {guest.phone}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Message when no guest selected or found */}
                    {guestSearchTerm && guestSearchResults.length === 0 && !isGuestSearchLoading && !newReservation.guestName && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <p className="text-sm text-amber-800 mb-2">
                          No guest found with that search term.
                        </p>
                        <p className="text-xs text-amber-700">
                          Please go to the <Link to="/guests" className="underline font-medium">Guests module</Link> to create a new guest first, then return here to create the reservation.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="reservation-end-time">End Time</Label>
                      <Input
                        id="reservation-end-time"
                        type="time"
                        value={newReservation.end_time ? format(newReservation.end_time, 'HH:mm') : ''}
                        onChange={e => {
                          const [hours, minutes] = e.target.value.split(":");
                          if (newReservation.date && hours && minutes) {
                            const endTime = new Date(newReservation.date);
                            endTime.setHours(Number(hours), Number(minutes), 0, 0);
                            setNewReservation(prev => ({ ...prev, end_time: endTime }));
                          } else {
                            setNewReservation(prev => ({ ...prev, end_time: null }));
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Party Size and Table */}
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
                      {isTablesLoading ? (
                        <div className="flex h-10 items-center text-sm text-muted-foreground">
                          <div className="animate-pulse">Loading available tables...</div>
                        </div>
                      ) : tablesError ? (
                        <div className="space-y-2">
                          <div className="text-sm text-destructive">{tablesError}</div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={fetchTables}
                            className="mt-1"
                          >
                            Retry
                          </Button>
                        </div>
                      ) : (
                        <>
                          <select
                            id="reservation-table"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={newReservation.tableId || ''}
                            onChange={(e) => setNewReservation({...newReservation, tableId: e.target.value})}
                            required
                            disabled={tables.length === 0}
                          >
                            <option value="">Select a table</option>
                            {tables
                              .filter(table => table.capacity >= newReservation.partySize) // Filter by capacity
                              .map((table) => (
                                <option 
                                  key={table.id} 
                                  value={table.id}
                                  disabled={table.status === 'occupied'}
                                  className={table.status === 'occupied' ? 'text-muted-foreground' : ''}
                                >
                                  T{table.number} (Seats: {table.capacity}) {table.status === 'occupied' ? '- Occupied' : ''}
                                </option>
                              ))}
                          </select>
                          {tables.length === 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              No tables available. Please check your configuration.
                            </p>
                          )}
                          {tables.length > 0 && tables.every(t => t.capacity < newReservation.partySize) && (
                            <p className="text-xs text-amber-600 mt-1">
                              No tables available for {newReservation.partySize} guests. Please reduce party size or add larger tables.
                            </p>
                          )}
                        </>
                      )}
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
                  <Button
                    onClick={handleAddReservation}
                    disabled={
                      !newReservation.guestName ||
                      !newReservation.guestPhone ||
                      !newReservation.date ||
                      !newReservation.time ||
                      !newReservation.partySize ||
                      !newReservation.tableId ||
                      isSubmitting ||
                      (selectedTable && newReservation.partySize > selectedTable.capacity) ||
                      (newReservation.guestEmail && !/^\S+@\S+\.\S+$/.test(newReservation.guestEmail)) ||
                      (newReservation.specialRequests && newReservation.specialRequests.length > 250)
                    }
                  >
                    {isSubmitting ? 'Creating...' : 'Create Reservation'}
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
                    <CalendarIcon className="mr-2 h-4 w-4" />
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
                        <div className="p-3 pointer-events-auto">
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
                            className="rounded-md border"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
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
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {reservation.guestInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{reservation.guestName}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(reservation.date, 'MMM d')} at {reservation.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {reservation.partySize}
                    </div>
                    <div>
                      {getTableName(reservation.tableId, tables)}
                    </div>
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
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg">
                    {selectedReservation.guestInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{selectedReservation.guestName}</h2>
                  <p className="text-muted-foreground">
                    {format(selectedReservation.date, "EEEE, MMMM d, yyyy")} at {selectedReservation.time}
                  </p>
                </div>
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
                  <p>
                    <span>
                      {getTableName(selectedReservation.tableId, tables)}
                      {(() => {
                        const table = tables.find(t => t.number.toString() === selectedReservation.tableId);
                        return table ? ` (Seats: ${table.capacity})` : '';
                      })()}
                    </span>
                  </p>
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
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Edit Reservation</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {/* Display Guest Information (Read-only) */}
                    <div className="space-y-2">
                      <Label>Guest</Label>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="font-medium">{selectedReservation.guestName}</p>
                        {selectedReservation.guestEmail && (
                          <p className="text-sm text-muted-foreground">{selectedReservation.guestEmail}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
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
                      <div className="space-y-2">
                        <Label htmlFor="edit-reservation-end-time">End Time</Label>
                        <Input
                          id="edit-reservation-end-time"
                          type="time"
                          value={selectedReservation.end_time ? (typeof selectedReservation.end_time === 'string' ? selectedReservation.end_time : format(selectedReservation.end_time, 'HH:mm')) : ''}
                          onChange={e => {
                            // Update end_time as a Date object on the same day as reservation.date
                            const [hours, minutes] = e.target.value.split(":");
                            if (selectedReservation.date && hours && minutes) {
                              const endTime = new Date(selectedReservation.date);
                              endTime.setHours(Number(hours), Number(minutes), 0, 0);
                              setSelectedReservation(prev => ({ ...prev, end_time: endTime }));
                            } else {
                              setSelectedReservation(prev => ({ ...prev, end_time: null }));
                            }
                          }}
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
                        {isTablesLoading ? (
                          <div className="flex h-10 items-center text-sm text-muted-foreground">
                            Loading tables...
                          </div>
                        ) : tablesError ? (
                          <div className="text-sm text-destructive">{tablesError}</div>
                        ) : (
                          <select
                            id="edit-table"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectedReservation?.tableId || ''}
                            onChange={(e) => {
                              if (selectedReservation) {
                                setSelectedReservation({
                                  ...selectedReservation,
                                  tableId: e.target.value
                                });
                              }
                            }}
                            required
                          >
                            <option value="">Select a table</option>
                            {tables.map((table) => (
                              <option key={table.id} value={table.number.toString()}>
                                T{table.number} (Seats: {table.capacity})
                              </option>
                            ))}
                          </select>
                        )}
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
                    <Button 
                      onClick={handleEditReservation}
                      disabled={isEditSubmitting}
                    >
                      {isEditSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {selectedReservation.status === 'confirmed' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => {
                    setCurrentReservationForBill(selectedReservation);
                    setCurrentBillAmount(selectedReservation.billAmount?.toString() || ''); 
                    setBillAmountDialogOpen(true);
                  }}
                >
                  <DollarSign className="h-4 w-4" />
                  Set Bill Amount
                </Button>
              )}
            </div>
          </div>
        )}
        
        <Dialog open={billAmountDialogOpen} onOpenChange={setBillAmountDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Enter Bill Amount</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="bill-amount">Bill Amount (IDR)</Label>
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