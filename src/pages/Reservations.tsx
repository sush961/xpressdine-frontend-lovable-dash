import { useState, useEffect, useCallback, useMemo } from 'react';
import { format, addDays, isAfter, isBefore, startOfDay } from 'date-fns';
import { 
  Calendar, 
  FileText, 
  Plus, 
  DollarSign,
  AlertTriangle,
  Clock,
  Users,
  Loader2
} from 'lucide-react';
import React from 'react';

// Helper functions
const getInitials = (name = '') => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getTableName = (table, tablesList = []) => {
  if (!table) return 'TBD';
  if (typeof table === 'string') {
    const foundTable = tablesList.find(t => t.id === table);
    return foundTable ? `T${foundTable.number}` : 'Unknown';
  }
  return `T${table.number}`;
};

// Mock business hours - in production, fetch from API
const mockBusinessHours = {
  monday: { open: '11:00', close: '22:00' },
  tuesday: { open: '11:00', close: '22:00' },
  wednesday: { open: '11:00', close: '22:00' },
  thursday: { open: '11:00', close: '22:00' },
  friday: { open: '11:00', close: '23:00' },
  saturday: { open: '10:00', close: '23:00' },
  sunday: { open: '10:00', close: '21:00' }
};

// Mock API calls for demonstration
const mockApiClient = {
  get: async (url, options) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (url === '/api/reservations') {
      return {
        data: [
          {
            id: '1',
            guest_id: 'g1',
            customer_name: 'John Doe',
            customer_email: 'john@example.com',
            date: '2025-06-08',
            time: '19:00',
            party_size: 4,
            table_id: 't1',
            status: 'confirmed',
            special_requests: 'Window seat preferred'
          },
          {
            id: '2',
            guest_id: 'g2',
            customer_name: 'Jane Smith',
            customer_email: 'jane@example.com',
            date: '2025-06-08',
            time: '20:00',
            party_size: 2,
            table_id: 't2',
            status: 'pending'
          }
        ]
      };
    }
    
    if (url === '/api/tables') {
      if (options?.params?.date && options?.params?.time) {
        return {
          data: {
            availableTables: [
              { id: 't1', number: 1, capacity: 4 },
              { id: 't3', number: 3, capacity: 6 }
            ]
          }
        };
      }
      return {
        data: [
          { id: 't1', number: 1, capacity: 4 },
          { id: 't2', number: 2, capacity: 2 },
          { id: 't3', number: 3, capacity: 6 },
          { id: 't4', number: 4, capacity: 4 }
        ]
      };
    }
    
    return { data: {} };
  },
  
  post: async (url, data) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { data: { ...data, id: Date.now().toString() } };
  }
};

export default function ImprovedReservations() {
  // States
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTablesLoading, setIsTablesLoading] = useState(true);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isAddReservationOpen, setIsAddReservationOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [overbookingWarning, setOverbookingWarning] = useState(null);
  const [businessHours] = useState(mockBusinessHours);
  
  const [newReservation, setNewReservation] = useState({
    guestId: null,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    date: new Date(),
    time: '19:00',
    partySize: 2,
    tableId: '',
    specialRequests: ''
  });

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Validation functions
  const validateReservationTime = useCallback((date, time) => {
    const errors = [];
    const dayOfWeek = format(date, 'EEEE').toLowerCase();
    const hours = businessHours[dayOfWeek];
    
    if (hours?.isClosed) {
      errors.push({
        field: 'date',
        message: 'Restaurant is closed on this day'
      });
      return errors;
    }
    
    const [requestedHour, requestedMinute] = time.split(':').map(Number);
    const [openHour, openMinute] = hours.open.split(':').map(Number);
    const [closeHour, closeMinute] = hours.close.split(':').map(Number);
    
    const requestedMinutes = requestedHour * 60 + requestedMinute;
    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;
    
    if (requestedMinutes < openMinutes || requestedMinutes > closeMinutes - 90) {
      errors.push({
        field: 'time',
        message: `Please select a time between ${hours.open} and ${format(new Date(0, 0, 0, Math.floor((closeMinutes - 90) / 60), (closeMinutes - 90) % 60), 'HH:mm')} (last seating)`
      });
    }
    
    // Check if date is within booking window (30 days)
    const maxBookingDate = addDays(new Date(), 30);
    if (isAfter(date, maxBookingDate)) {
      errors.push({
        field: 'date',
        message: 'Reservations can only be made up to 30 days in advance'
      });
    }
    
    // Allow same-day bookings for walk-ins
    const now = new Date();
    if (format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      if (requestedMinutes < currentMinutes) {
        errors.push({
          field: 'time',
          message: 'Cannot make reservations for past times'
        });
      }
    }
    
    return errors;
  }, [businessHours]);

  // Fetch functions
  const fetchReservations = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await mockApiClient.get('/api/reservations');
      const data = response.data.map((item) => ({
        id: item.id,
        guestId: item.guest_id || '',
        guestName: item.customer_name,
        guestEmail: item.customer_email,
        guestPhone: item.customer_phone,
        guestInitials: getInitials(item.customer_name),
        date: new Date(item.date),
        time: item.time,
        partySize: item.party_size,
        tableId: item.table_id,
        status: item.status,
        specialRequests: item.special_requests
      }));
      setReservations(data);
    } catch (err) {
      console.error('Error fetching reservations:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTables = useCallback(async () => {
    try {
      setIsTablesLoading(true);
      const response = await mockApiClient.get('/api/tables');
      setTables(response.data);
    } catch (err) {
      console.error('Error fetching tables:', err);
    } finally {
      setIsTablesLoading(false);
    }
  }, []);

  const fetchAvailableTables = useCallback(async (date, time) => {
    try {
      setIsCheckingAvailability(true);
      setOverbookingWarning(null);
      
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await mockApiClient.get('/api/tables', {
        params: {
          date: dateStr,
          time,
          duration: 90
        }
      });
      
      const available = response.data.availableTables || [];
      setAvailableTables(available);
      
      // Check for potential overbooking
      if (available.length === 0 && tables.length > 0) {
        setOverbookingWarning('All tables are booked for this time. You can still create a reservation, but it may result in overbooking.');
      }
    } catch (error) {
      console.error('Error fetching available tables:', error);
      setAvailableTables([]);
    } finally {
      setIsCheckingAvailability(false);
    }
  }, [tables]);

  // Effects
  useEffect(() => {
    fetchReservations();
    fetchTables();
  }, [fetchReservations, fetchTables]);

  useEffect(() => {
    if (newReservation.date && newReservation.time) {
      fetchAvailableTables(newReservation.date, newReservation.time);
    }
  }, [newReservation.date, newReservation.time, fetchAvailableTables]);

  // Handlers
  const handleAddReservation = async () => {
    // Clear previous errors
    setValidationErrors([]);
    
    // Validate required fields
    const errors = [];
    
    if (!newReservation.guestId || !newReservation.guestName) {
      errors.push({
        field: 'guest',
        message: 'Please select a customer'
      });
    }
    
    if (newReservation.partySize < 1) {
      errors.push({
        field: 'partySize',
        message: 'Party size must be at least 1'
      });
    }
    
    if (!newReservation.tableId) {
      errors.push({
        field: 'table',
        message: 'Please select a table'
      });
    }
    
    // Validate time
    const timeErrors = validateReservationTime(newReservation.date, newReservation.time);
    errors.push(...timeErrors);
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        customer_name: newReservation.guestName,
        customer_email: newReservation.guestEmail || '',
        customer_phone: newReservation.guestPhone || '',
        guest_id: newReservation.guestId,
        date: format(newReservation.date, 'yyyy-MM-dd'),
        time: newReservation.time,
        party_size: newReservation.partySize,
        table_id: newReservation.tableId,
        special_requests: newReservation.specialRequests || '',
        status: 'confirmed'
      };
      
      await mockApiClient.post('/api/reservations', payload);
      
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
      // Reset form
      setNewReservation({
        guestId: null,
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        date: new Date(),
        time: '19:00',
        partySize: 2,
        tableId: '',
        specialRequests: ''
      });
      
      setIsAddReservationOpen(false);
      setOverbookingWarning(null);
      await fetchReservations();
    } catch (error) {
      console.error('Error creating reservation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getValidationError = (field) => {
    return validationErrors.find(e => e.field === field)?.message;
  };

  // Loading states components
  const TableLoadingSkeleton = () => (
    <div className="space-y-2">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  );

  const ReservationLoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-center space-x-4 p-4">
          <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
          </div>
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50">
          <div className="flex items-center">
            <span className="mr-2">✓</span>
            <span>Reservation created successfully!</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reservations</h1>
        <button
          onClick={() => setIsAddReservationOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Reservation
        </button>
      </div>

      {/* Add Reservation Modal */}
      {isAddReservationOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Create New Reservation</h2>
                <button
                  onClick={() => {
                    setIsAddReservationOpen(false);
                    setValidationErrors([]);
                    setOverbookingWarning(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Validation Errors Alert */}
                {validationErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                      <div className="text-sm text-red-800">
                        <p className="font-medium">Please fix the following errors:</p>
                        <ul className="list-disc list-inside mt-1">
                          {validationErrors.map((error, index) => (
                            <li key={index}>{error.message}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Overbooking Warning */}
                {overbookingWarning && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                      <p className="text-sm text-yellow-800">{overbookingWarning}</p>
                    </div>
                  </div>
                )}

                {/* Guest Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Search or enter customer name"
                    value={newReservation.guestName}
                    onChange={(e) => {
                      setNewReservation({
                        ...newReservation,
                        guestName: e.target.value,
                        guestId: e.target.value ? 'guest-' + Date.now() : null
                      });
                      setValidationErrors(errors => errors.filter(e => e.field !== 'guest'));
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      getValidationError('guest') ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {getValidationError('guest') && (
                    <p className="text-sm text-red-500 mt-1">{getValidationError('guest')}</p>
                  )}
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={format(newReservation.date, 'yyyy-MM-dd')}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      setNewReservation({ ...newReservation, date });
                      setValidationErrors(errors => errors.filter(e => e.field !== 'date'));
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      getValidationError('date') ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {getValidationError('date') && (
                    <p className="text-sm text-red-500 mt-1">{getValidationError('date')}</p>
                  )}
                </div>

                {/* Time and Party Size */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Time
                    </label>
                    <input
                      type="time"
                      value={newReservation.time}
                      onChange={(e) => {
                        setNewReservation({ ...newReservation, time: e.target.value });
                        setValidationErrors(errors => errors.filter(e => e.field !== 'time'));
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        getValidationError('time') ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {getValidationError('time') && (
                      <p className="text-sm text-red-500 mt-1">{getValidationError('time')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Users className="inline h-4 w-4 mr-1" />
                      Party Size
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newReservation.partySize}
                      onChange={(e) => {
                        setNewReservation({ ...newReservation, partySize: parseInt(e.target.value) || 1 });
                        setValidationErrors(errors => errors.filter(e => e.field !== 'partySize'));
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        getValidationError('partySize') ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {getValidationError('partySize') && (
                      <p className="text-sm text-red-500 mt-1">{getValidationError('partySize')}</p>
                    )}
                  </div>
                </div>

                {/* Table Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Table <span className="text-red-500">*</span>
                    {isCheckingAvailability && (
                      <Loader2 className="inline h-3 w-3 ml-2 animate-spin text-gray-400" />
                    )}
                  </label>
                  
                  {isTablesLoading ? (
                    <TableLoadingSkeleton />
                  ) : (
                    <>
                      <select
                        value={newReservation.tableId}
                        onChange={(e) => {
                          setNewReservation({ ...newReservation, tableId: e.target.value });
                          setValidationErrors(errors => errors.filter(e => e.field !== 'table'));
                        }}
                        disabled={isSubmitting || isCheckingAvailability}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          getValidationError('table') ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select a table</option>
                        {tables.map((table) => {
                          const isAvailable = availableTables.some(t => t.id === table.id);
                          const isFlexibleFit = table.capacity >= newReservation.partySize;
                          
                          return (
                            <option
                              key={table.id}
                              value={table.id}
                              disabled={!isAvailable && !overbookingWarning}
                            >
                              Table {table.number} (Capacity: {table.capacity})
                              {!isAvailable && ' - Occupied'}
                              {isAvailable && !isFlexibleFit && ' - May be too small'}
                            </option>
                          );
                        })}
                      </select>
                      
                      {availableTables.length > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          {availableTables.length} table{availableTables.length > 1 ? 's' : ''} available for this time slot
                        </p>
                      )}
                    </>
                  )}
                  
                  {getValidationError('table') && (
                    <p className="text-sm text-red-500 mt-1">{getValidationError('table')}</p>
                  )}
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Any dietary restrictions, celebrations, or special needs?"
                    value={newReservation.specialRequests}
                    onChange={(e) => setNewReservation({ ...newReservation, specialRequests: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setIsAddReservationOpen(false);
                    setValidationErrors([]);
                    setOverbookingWarning(null);
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddReservation}
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Reservation'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Today's Reservations</h2>
            <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              <FileText className="mr-2 h-4 w-4" />
              Export
            </button>
          </div>

          {isLoading ? (
            <ReservationLoadingSkeleton />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Guest</th>
                    <th className="text-left py-3 px-4">Date & Time</th>
                    <th className="text-left py-3 px-4">Party Size</th>
                    <th className="text-left py-3 px-4">Table</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.length > 0 ? (
                    reservations.map((reservation) => (
                      <tr key={reservation.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <span className="text-sm font-medium text-gray-600">
                                {reservation.guestInitials}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{reservation.guestName}</p>
                              {reservation.guestEmail && (
                                <p className="text-sm text-gray-500">{reservation.guestEmail}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p>{format(reservation.date, 'MMM d, yyyy')}</p>
                            <p className="text-sm text-gray-500">{reservation.time}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">{reservation.partySize}</td>
                        <td className="py-3 px-4">{getTableName(reservation.tableId, tables)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            reservation.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {reservation.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <button className="text-gray-600 hover:text-gray-900 text-sm">
                              Edit
                            </button>
                            {reservation.status !== 'completed' && reservation.status !== 'cancelled' && (
                              <button className="text-gray-600 hover:text-gray-900 text-sm inline-flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                Bill
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No reservations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}