
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Unlink } from 'lucide-react';
import { TableData } from './types';

interface TableListViewProps {
  tables: TableData[];
  onEditTable: (table: TableData) => void;
  onUnlinkTables: (tableId: string) => void;
}

export function TableListView({ tables, onEditTable, onUnlinkTables }: TableListViewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'empty': return 'bg-green-500';
      case 'occupied': return 'bg-amber-500';
      case 'booked': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Table</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Linked</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tables.map((table) => {
            const linkedTables = table.linkedWith 
              ? tables.filter(t => table.linkedWith?.includes(t.id)).map(t => t.name).join(", ")
              : "";
            
            return (
              <TableRow key={table.id}>
                <TableCell className="font-medium">{table.name}</TableCell>
                <TableCell>{table.capacity}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(table.status)}`}></div>
                    <span>
                      {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{table.location}</TableCell>
                <TableCell>
                  {table.isLinked ? (
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">Yes</span>
                      <span className="text-xs text-muted-foreground">
                        (with {linkedTables})
                      </span>
                    </div>
                  ) : 'No'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEditTable(table)}
                    >
                      Edit
                    </Button>
                    {table.isLinked && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onUnlinkTables(table.id)}
                        className="flex items-center"
                      >
                        <Unlink className="h-4 w-4 mr-1" /> Unlink
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
