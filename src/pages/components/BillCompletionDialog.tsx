import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface BillCompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: {
    id: string;
    guestName: string;
    partySize: number;
    tableId: string;
  } | null;
  onComplete: (reservationId: string, amount: number) => Promise<boolean>;
}

export function BillCompletionDialog({
  isOpen,
  onClose,
  reservation,
  onComplete,
}: BillCompletionDialogProps) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!reservation) return;
    
    const billAmount = parseFloat(amount);
    if (isNaN(billAmount) || billAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const success = await onComplete(reservation.id, billAmount);
      if (success) {
        setAmount('');
        onClose();
      }
    } catch (err) {
      console.error('Error completing bill:', err);
      setError('Failed to process bill. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!reservation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Reservation</DialogTitle>
          <DialogDescription>
            Enter the final bill amount for {reservation.guestName}'s reservation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bill-amount">Bill Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
              <Input
                id="bill-amount"
                type="number"
                step="0.01"
                min="0.01"
                className="pl-8"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (error) setError('');
                }}
                placeholder="0.00"
                disabled={isSubmitting}
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
          
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Guest: {reservation.guestName}</p>
            <p>Party Size: {reservation.partySize}</p>
            <p>Table: {reservation.tableId}</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !amount}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Complete Reservation'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
