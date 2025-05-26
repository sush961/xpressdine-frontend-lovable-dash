
import { Button } from '@/components/ui/button';
import { Unlink } from 'lucide-react';
import { TableData } from './types';

interface TableLayoutViewProps {
  tables: TableData[];
  onSelectTable: (tableId: string) => void;
  onEditTable: (table: TableData) => void;
  onUnlinkTables: (tableId: string) => void;
  selectedTables: string[];
}

export function TableLayoutView({ 
  tables, 
  onSelectTable, 
  onEditTable, 
  onUnlinkTables, 
  selectedTables 
}: TableLayoutViewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'empty': return 'bg-green-500';
      case 'occupied': return 'bg-amber-500';
      case 'booked': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTableSizeAndCapacity = (table: TableData) => {
    let effectiveCapacity = table.capacity;
    if (table.isLinked && table.linkedWith && table.linkedWith.length > 0) {
      effectiveCapacity = table.linkedWith.reduce((currentSum, linkedTableId) => {
        const foundLinkedTable = tables.find(t => t.id === linkedTableId);
        return currentSum + (foundLinkedTable?.capacity || 0);
      }, table.capacity); // Start with current table's capacity
    }
    
    let sizeClass = '';
    if (effectiveCapacity <= 2) sizeClass = 'w-20 h-20';
    else if (effectiveCapacity <= 4) sizeClass = 'w-24 h-24';
    else if (effectiveCapacity <= 6) sizeClass = 'w-28 h-24';
    else if (effectiveCapacity <= 8) sizeClass = 'w-32 h-28';
    else sizeClass = 'w-40 h-32';
    
    return { sizeClass, effectiveCapacity };
  };

  return (
    <div className="bg-muted p-6 rounded-lg min-h-[600px] relative border border-dashed">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {tables.map((table) => {
          const isSelected = selectedTables.includes(table.id);
          const linkedClasses = table.isLinked ? 'ring-2 ring-blue-500' : '';
          const selectedClasses = isSelected ? 'ring-2 ring-primary ring-offset-2' : '';
          const { sizeClass, effectiveCapacity } = getTableSizeAndCapacity(table);
          
          return (
            <div 
              key={table.id}
              className={`relative ${sizeClass} rounded-md ${
                table.isLinked ? 'bg-blue-100' : 'bg-white'
              } shadow-md hover:shadow-lg transition-all flex flex-col items-center justify-center cursor-pointer ${linkedClasses} ${selectedClasses} group`}
              onClick={() => onSelectTable(table.id)}
            >
              <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full ${getStatusColor(table.status)}`} title={table.status}></div>
              <span className="font-semibold">{table.name}</span>
              <span className="text-xs text-muted-foreground">
                {effectiveCapacity} seats {table.isLinked ? "(group)" : ""}
              </span>

              {/* Edit button that shows on hover */}
              <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditTable(table);
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z" fill="currentColor" />
                  </svg>
                </Button>
              </div>
              
              {/* Table linking indicator and unlink button */}
              {(table.isLinked) && (
                <div className="absolute -top-1 -left-1 flex items-center space-x-1">
                  <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                    ↔
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs py-0 h-5 px-1 bg-white hover:bg-red-50 border-red-200 text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnlinkTables(table.id);
                    }}
                  >
                    <Unlink className="h-3 w-3 mr-1" /> Unlink
                  </Button>
                </div>
              )}

              {/* Selection indicator for link mode */}
              {(isSelected) && (
                <div className="absolute -top-1 -left-1 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs">
                  {selectedTables.indexOf(table.id) + 1}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="absolute bottom-4 right-4 bg-white/90 p-3 rounded-md shadow">
        <div className="text-xs font-medium mb-2">Table Status</div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs">Empty</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-xs">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs">Booked</span>
          </div>
          <div className="flex items-center gap-2 mt-1 pt-1 border-t">
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px]">↔</div>
            <span className="text-xs">Linked Tables</span>
          </div>
        </div>
      </div>
    </div>
  );
}
