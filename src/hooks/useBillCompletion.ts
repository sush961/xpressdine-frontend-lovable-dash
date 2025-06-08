import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ApiClient } from '@/lib/ApiClient';

interface UseBillCompletionProps {
  fetchReservations: () => Promise<void>;
}

export function useBillCompletion({ fetchReservations }: UseBillCompletionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const completeReservationWithBill = async (reservationId: string, amount: number) => {
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid bill amount.',
        variant: 'destructive',
      });
      return false;
    }

    setIsProcessing(true);
    try {
      await ApiClient.put(`/reservations/${reservationId}`, {
        status: 'completed',
        total_amount: amount,
        end_time: new Date().toISOString(),
      });

      toast({
        title: 'Reservation Completed',
        description: `Bill of $${amount.toFixed(2)} has been processed.`,
      });

      await fetchReservations();
      return true;
    } catch (error) {
      console.error('Error completing reservation:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete reservation. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return { completeReservationWithBill, isProcessing };
}
