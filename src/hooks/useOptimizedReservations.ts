import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';

// Cache layer for faster subsequent loads
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

const getCached = (key: string) => {
  const cached = cache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > cached.ttl) {
    cache.delete(key);
    return null;
  }
  return cached.data;
};

const setCache = (key: string, data: any, ttlMs: number = 300000) => {
  cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
};

// Optimized reservation fetching - same interface as your original
export function useOptimizedReservations() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async (): Promise<void> => {
    // Check cache first
    const cacheKey = 'reservations-all';
    const cached = getCached(cacheKey);
    if (cached) {
      setReservations(cached);
      setIsLoading(false);
      return;
    }

    if (reservations.length === 0) {
      setIsLoading(true);
    }
    
    setError(null);
    try {
      // Try optimized endpoint first, fallback to original
      let response;
      try {
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reservations/optimized`);
        if (!response.ok) throw new Error('Optimized endpoint not available');
      } catch {
        // Fallback to your original endpoint
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reservations`);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Transform data exactly like your original code
      const transformedData: any[] = data.map((item: any) => ({
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
        status: (item.status as any) || 'pending',
        specialRequests: item.specialRequests || item.notes || '',
        billAmount: item.billAmount || item.bill_amount
      }));

      setReservations(transformedData);
      setCache(cacheKey, transformedData, 300000); // Cache for 5 minutes
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Failed to fetch reservations:", error);
      setError(`Failed to fetch reservations: ${error.message}`);
      
      if (reservations.length === 0) {
        setReservations([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [reservations.length]);

  return {
    reservations,
    isLoading,
    error,
    fetchReservations,
    refetch: fetchReservations
  };
}

// Helper function - same as your original
const getInitials = (name: string = ''): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
};
