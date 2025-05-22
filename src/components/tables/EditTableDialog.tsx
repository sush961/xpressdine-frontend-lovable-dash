
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TableData } from './types';

interface EditTableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  currentTable: TableData | null;
  setCurrentTable: (table: TableData | null) => void;
}

export function EditTableDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  currentTable, 
  setCurrentTable 
}: EditTableDialogProps) {
  if (!currentTable) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Table</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-table-name">Table Name</Label>
            <Input 
              id="edit-table-name" 
              value={currentTable.name} 
              onChange={(e) => setCurrentTable({...currentTable, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-table-capacity">Capacity</Label>
            <Input 
              id="edit-table-capacity" 
              type="number" 
              min="1"
              value={currentTable.capacity} 
              onChange={(e) => setCurrentTable({...currentTable, capacity: parseInt(e.target.value) || 1})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-table-location">Location</Label>
            <Input 
              id="edit-table-location" 
              value={currentTable.location} 
              onChange={(e) => setCurrentTable({...currentTable, location: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-table-status">Status</Label>
            <select 
              id="edit-table-status"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={currentTable.status}
              onChange={(e) => setCurrentTable({
                ...currentTable, 
                status: e.target.value as 'empty' | 'occupied' | 'booked'
              })}
            >
              <option value="empty">Empty</option>
              <option value="occupied">Occupied</option>
              <option value="booked">Booked</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={onSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
