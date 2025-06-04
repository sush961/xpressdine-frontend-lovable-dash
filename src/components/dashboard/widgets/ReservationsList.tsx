import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format as formatDateFns } from 'date-fns'; // For formatting today's date

// Interface for the reservation data expected by this component's display logic
interface ReservationDisplayItem {
  id: string;
  name: string;
  time: string; // e.g., "12:30 PM"
  guests: number;
  status: string; // Status from API, e.g., 'confirmed', 'pending'
}

export function ReservationsList() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<ReservationDisplayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodaysReservations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const today = formatDateFns(new Date(), 'yyyy-MM-dd');
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
        if (!apiBaseUrl) {
          console.error('API_BASE_URL is not set. Ensure VITE_API_BASE_URL is configured in Vercel and prefixed correctly.');
          throw new Error('API endpoint is not configured. Please contact support.');
        }
        const response = await fetch(`${apiBaseUrl}/api/reservations/today`);
        
        if (!response.ok) {
          let errorText = `API request failed with status ${response.status}`;
          try {
            // Attempt to parse error message from API response body
            const errorData = await response.json();
            errorText = errorData.error || errorText;
          } catch (jsonError) {
            // If response is not JSON or error field is not present, use the status-based message
          }
          throw new Error(errorText);
        }
        
        const result = await response.json(); // Expects { data: ReservationDisplayItem[], error: string | null }
        
        if (result.error) {
          throw new Error(result.error);
        }

        setReservations(result.data || []);

      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error("Failed to fetch today's reservations:", error);
        setError(error.message || 'Failed to load reservations. Please try again later.');
        setReservations([]); // Clear reservations on error to avoid displaying stale data
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodaysReservations();
  }, []); // Empty dependency array ensures this effect runs once on component mount

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">Today's Reservations</CardTitle>
          {/* Placeholder for View All button to maintain layout consistency */}
          <button 
            className="text-sm text-brand-orange font-medium hover:underline invisible"
            aria-hidden="true"
          >
            View All
          </button>
        </CardHeader>
        <CardContent className="px-6 pb-4">
          <p>Loading reservations...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">Today's Reservations</CardTitle>
           {/* Placeholder for View All button */}
          <button 
            className="text-sm text-brand-orange font-medium hover:underline invisible"
            aria-hidden="true"
          >
            View All
          </button>
        </CardHeader>
        <CardContent className="px-6 pb-4">
          <p className="text-red-600">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Today's Reservations</CardTitle>
        <button 
          className="text-sm text-brand-orange font-medium hover:underline"
          onClick={() => navigate('/reservations?filter=today')}
        >
          View All
        </button>
      </CardHeader>
      <CardContent className="px-6 pb-4">
        {reservations.length === 0 ? (
          <p>No reservations for today.</p>
        ) : (
          <div className="space-y-4">
            {reservations.slice(0, 8).map((reservation) => (
              <div 
                key={reservation.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-medium text-sm">
                    {reservation.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium">{reservation.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {reservation.time} · {reservation.guests} guests
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                      reservation.status === 'confirmed' 
                        ? 'bg-green-50 text-green-700' 
                        : reservation.status === 'pending'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-gray-100 text-gray-700' // A default style for other statuses
                    }`}
                  >
                    {reservation.status}
                  </span>
                </div>
              </div>
            ))}
            {reservations.length > 8 && (
              <div className="pt-2 text-center">
                <button 
                  onClick={() => navigate('/reservations?filter=today')}
                  className="text-sm text-brand-orange font-medium hover:underline"
                >
                  View All {reservations.length} Reservations
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}