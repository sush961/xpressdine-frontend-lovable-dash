
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TableFormValues } from './types';

interface AddTableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTable: (tableData: TableFormValues) => void;
}

export function AddTableDialog({ isOpen, onClose, onAddTable }: AddTableDialogProps) {
  const [newTable, setNewTable] = useState<TableFormValues>({
    name: '',
    capacity: 2,
    location: 'Window'
  });

  const handleSubmit = () => {
    onAddTable(newTable);
    setNewTable({ name: '', capacity: 2, location: 'Window' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Table</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="table-name">Table Name</Label>
            <Input 
              id="table-name" 
              value={newTable.name} 
              onChange={(e) => setNewTable({...newTable, name: e.target.value})}
              placeholder="e.g. Table 9"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="table-capacity">Capacity</Label>
            <Input 
              id="table-capacity" 
              type="number" 
              min="1"
              value={newTable.capacity} 
              onChange={(e) => setNewTable({...newTable, capacity: parseInt(e.target.value) || 1})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="table-location">Location</Label>
            <Input 
              id="table-location" 
              value={newTable.location} 
              onChange={(e) => setNewTable({...newTable, location: e.target.value})}
              placeholder="e.g. Window, Bar, Patio"
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit}>Add Table</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
