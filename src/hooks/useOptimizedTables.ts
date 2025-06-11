import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';

// Same caching system
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

export function useOptimizedTables() {
  const [tables, setTables] = useState<any[]>([]);
  const [isTablesLoading, setIsTablesLoading] = useState(true);
  const [tablesError, setTablesError] = useState<string | null>(null);

  const fetchTables = useCallback(async (): Promise<void> => {
    const cacheKey = 'tables-today';
    const cached = getCached(cacheKey);
    if (cached) {
      setTables(cached);
      setIsTablesLoading(false);
      return;
    }

    setIsTablesLoading(true);
    setTablesError(null);
    try {
      const currentDate = format(new Date(), 'yyyy-MM-dd');
      
      // Try optimized endpoint first, fallback to original
      let response;
      try {
        response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/tables/optimized?date=${currentDate}`
        );
        if (!response.ok) throw new Error('Optimized endpoint not available');
      } catch {
        // Fallback to your original endpoint
        response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/tables?date=${currentDate}`
        );
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle response exactly like your original code
      if (data.availableTables) {
        setTables(Array.isArray(data.availableTables) ? data.availableTables : []);
      } else if (Array.isArray(data)) {
        setTables(data);
      } else {
        console.warn('Unexpected API response format:', data);
        setTables([]);
      }
      
      setCache(cacheKey, tables, 300000); // Cache for 5 minutes
    } catch (error) {
      console.error('Error fetching tables:', error);
      setTablesError('Failed to load tables. Please try again later.');
      setTables([]);
    } finally {
      setIsTablesLoading(false);
    }
  }, []);

  return {
    tables,
    isTablesLoading,
    tablesError,
    fetchTables
  };
}
