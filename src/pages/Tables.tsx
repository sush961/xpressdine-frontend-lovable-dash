
import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface TableData {
  id: string;
  name: string;
  capacity: number;
  status: 'empty' | 'occupied' | 'booked';
  location: string;
  isLinked: boolean;
  linkedWith?: string[];
}

// Mock data - would be fetched from API in real implementation
const tablesData: TableData[] = [
  { id: 'T01', name: 'Table 1', capacity: 4, status: 'empty', location: 'Window', isLinked: false },
  { id: 'T02', name: 'Table 2', capacity: 2, status: 'occupied', location: 'Window', isLinked: false },
  { id: 'T03', name: 'Table 3', capacity: 2, status: 'empty', location: 'Bar', isLinked: false },
  { id: 'T04', name: 'Table 4', capacity: 6, status: 'booked', location: 'Center', isLinked: false },
  { id: 'T05', name: 'Table 5', capacity: 4, status: 'empty', location: 'Patio', isLinked: false },
  { id: 'T06', name: 'Table 6', capacity: 8, status: 'booked', location: 'Private Room', isLinked: true, linkedWith: ['T07'] },
  { id: 'T07', name: 'Table 7', capacity: 4, status: 'booked', location: 'Private Room', isLinked: true, linkedWith: ['T06'] },
  { id: 'T08', name: 'Table 8', capacity: 2, status: 'occupied', location: 'Patio', isLinked: false },
];

export default function Tables() {
  const [view, setView] = useState<'layout' | 'list'>('layout');
  const [linkMode, setLinkMode] = useState(false);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);

  const handleToggleView = () => {
    setView(view === 'layout' ? 'list' : 'layout');
  };

  const handleTableSelect = (tableId: string) => {
    if (!linkMode) return;
    
    setSelectedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId) 
        : [...prev, tableId]
    );
  };

  const handleLinkTables = () => {
    // In a real implementation, this would update the API
    console.log('Linking tables:', selectedTables);
    setLinkMode(false);
    setSelectedTables([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'empty': return 'bg-green-500';
      case 'occupied': return 'bg-amber-500';
      case 'booked': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTableSize = (capacity: number) => {
    if (capacity <= 2) return 'w-20 h-20';
    if (capacity <= 4) return 'w-24 h-24';
    if (capacity <= 6) return 'w-28 h-24';
    return 'w-32 h-28';
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Tables</h1>
          <div className="flex items-center gap-4">
            {view === 'layout' && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="link-mode"
                  checked={linkMode}
                  onCheckedChange={(checked) => {
                    setLinkMode(checked);
                    if (!checked) setSelectedTables([]);
                  }}
                />
                <Label htmlFor="link-mode">Link Tables Mode</Label>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Label>View:</Label>
              <div className="border rounded-md p-1">
                <Button
                  variant={view === 'layout' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('layout')}
                  className="rounded-r-none"
                >
                  Layout
                </Button>
                <Button
                  variant={view === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('list')}
                  className="rounded-l-none"
                >
                  List
                </Button>
              </div>
            </div>
          </div>
        </div>

        {linkMode && selectedTables.length > 0 && (
          <div className="bg-muted p-4 rounded-md flex items-center justify-between">
            <div>
              <span className="font-medium">{selectedTables.length} tables selected</span>
              <p className="text-sm text-muted-foreground">Select tables to link them together for larger parties</p>
            </div>
            <Button onClick={handleLinkTables}>Link Selected Tables</Button>
          </div>
        )}

        {view === 'layout' ? (
          <div className="bg-muted p-6 rounded-lg min-h-[600px] relative border border-dashed">
            <div className="grid grid-cols-4 gap-6">
              {tablesData.map((table) => {
                const isSelected = selectedTables.includes(table.id);
                const linkedClasses = table.isLinked ? 'ring-2 ring-blue-500' : '';
                const selectedClasses = isSelected ? 'ring-2 ring-primary ring-offset-2' : '';
                
                return (
                  <div 
                    key={table.id}
                    className={`relative ${getTableSize(table.capacity)} rounded-md ${
                      table.isLinked ? 'bg-blue-100' : 'bg-white'
                    } shadow-md hover:shadow-lg transition-all flex flex-col items-center justify-center cursor-pointer ${linkedClasses} ${selectedClasses}`}
                    onClick={() => handleTableSelect(table.id)}
                  >
                    <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full ${getStatusColor(table.status)}`}></div>
                    <span className="font-semibold">{table.name}</span>
                    <span className="text-xs text-muted-foreground">{table.capacity} seats</span>
                    
                    {(table.isLinked || isSelected) && (
                      <div className="absolute -top-1 -left-1 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                        {isSelected ? selectedTables.indexOf(table.id) + 1 : '↔'}
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
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Linked</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tablesData.map((table) => (
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
                    <TableCell>{table.isLinked ? 'Yes' : 'No'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
