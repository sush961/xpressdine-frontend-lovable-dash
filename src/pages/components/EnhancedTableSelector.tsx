import { Table } from '@/types/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface EnhancedTableSelectorProps {
  selectedTableId: string;
  onTableSelect: (tableId: string) => void;
  partySize: number;
  tables: Table[];
  disabled?: boolean;
}

export function EnhancedTableSelector({
  selectedTableId,
  onTableSelect,
  partySize,
  tables,
  disabled = false,
}: EnhancedTableSelectorProps) {
  const getTableStatus = (table: Table) => {
    if (table.capacity < partySize) {
      return { status: 'over', message: `Table too small (${table.capacity} seats)` };
    }
    if (table.capacity === partySize) {
      return { status: 'perfect', message: 'Perfect fit' };
    }
    if (table.capacity <= partySize + 2) {
      return { status: 'good', message: 'Good fit' };
    }
    return { status: 'large', message: 'Large table' };
  };

  const sortedTables = [...tables].sort((a, b) => a.number - b.number);

  return (
    <div className="space-y-2">
      <Select
        value={selectedTableId}
        onValueChange={onTableSelect}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a table" />
        </SelectTrigger>
        <SelectContent>
          {sortedTables.map((table) => {
            const { status, message } = getTableStatus(table);
            return (
              <SelectItem key={table.id} value={table.id}>
                <div className="flex items-center justify-between w-full">
                  <span>Table {table.number}</span>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      status === 'perfect' && 'bg-green-100 text-green-800',
                      status === 'good' && 'bg-blue-100 text-blue-800',
                      status === 'over' && 'bg-red-100 text-red-800',
                      status === 'large' && 'bg-yellow-100 text-yellow-800'
                    )}
                  >
                    {status === 'perfect' && '⭐ '}
                    {message}
                  </span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      {selectedTableId && (
        <div className="text-sm text-muted-foreground">
          {(() => {
            const table = tables.find(t => t.id === selectedTableId);
            if (!table) return null;
            
            const { status, message } = getTableStatus(table);
            return (
              <div className={cn(
                'p-2 rounded-md text-sm',
                status === 'perfect' && 'bg-green-50 text-green-700',
                status === 'good' && 'bg-blue-50 text-blue-700',
                status === 'over' && 'bg-red-50 text-red-700',
                status === 'large' && 'bg-yellow-50 text-yellow-700'
              )}>
                {status === 'perfect' && '⭐ '}
                {message} - Table {table.number} has {table.capacity} seats
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
