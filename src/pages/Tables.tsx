
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
import { Plus, FileText, Unlink, Link } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

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
const initialTablesData: TableData[] = [
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
  const { toast } = useToast();
  const [tablesData, setTablesData] = useState<TableData[]>(initialTablesData);
  const [view, setView] = useState<'layout' | 'list'>('layout');
  const [linkMode, setLinkMode] = useState(false);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [newTable, setNewTable] = useState({
    name: '',
    capacity: 2,
    location: 'Window'
  });
  const [isEditTableOpen, setIsEditTableOpen] = useState(false);
  const [currentEditTable, setCurrentEditTable] = useState<TableData | null>(null);

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

  const calculateTotalCapacity = (tableIds: string[]) => {
    return tableIds.reduce((total, id) => {
      const table = tablesData.find(t => t.id === id);
      return total + (table?.capacity || 0);
    }, 0);
  };

  const handleLinkTables = () => {
    if (selectedTables.length < 2) {
      toast({
        title: "Cannot link tables",
        description: "Please select at least two tables to link.",
        variant: "destructive"
      });
      return;
    }

    const updatedTables = tablesData.map(table => {
      if (selectedTables.includes(table.id)) {
        return {
          ...table,
          isLinked: true,
          linkedWith: selectedTables.filter(id => id !== table.id)
        };
      }
      return table;
    });

    setTablesData(updatedTables);
    setLinkMode(false);
    setSelectedTables([]);

    toast({
      title: "Tables linked",
      description: `Successfully linked ${selectedTables.length} tables with combined capacity of ${calculateTotalCapacity(selectedTables)}.`
    });
  };

  const handleUnlinkTables = (tableId: string) => {
    const tableToUnlink = tablesData.find(t => t.id === tableId);
    if (!tableToUnlink || !tableToUnlink.linkedWith) return;

    const tablesToUpdate = [tableId, ...tableToUnlink.linkedWith];
    
    const updatedTables = tablesData.map(table => {
      if (tablesToUpdate.includes(table.id)) {
        return {
          ...table,
          isLinked: false,
          linkedWith: undefined
        };
      }
      return table;
    });

    setTablesData(updatedTables);
    
    toast({
      title: "Tables unlinked",
      description: "The tables have been successfully unlinked."
    });
  };

  const handleAddTable = () => {
    if (!newTable.name.trim()) {
      toast({
        title: "Error",
        description: "Table name is required",
        variant: "destructive"
      });
      return;
    }

    const newTableId = `T${(tablesData.length + 1).toString().padStart(2, '0')}`;
    
    const tableToAdd: TableData = {
      id: newTableId,
      name: newTable.name,
      capacity: Number(newTable.capacity),
      status: 'empty',
      location: newTable.location,
      isLinked: false
    };

    setTablesData([...tablesData, tableToAdd]);
    setIsAddTableOpen(false);
    setNewTable({ name: '', capacity: 2, location: 'Window' });
    
    toast({
      title: "Table added",
      description: `${newTable.name} has been successfully added.`
    });
  };

  const handleEditTable = () => {
    if (!currentEditTable) return;

    const updatedTables = tablesData.map(table => {
      if (table.id === currentEditTable.id) {
        return currentEditTable;
      }
      return table;
    });

    setTablesData(updatedTables);
    setIsEditTableOpen(false);
    
    toast({
      title: "Table updated",
      description: `${currentEditTable.name} has been successfully updated.`
    });
  };

  const handleExport = () => {
    // Mock CSV export functionality
    const headers = ['ID', 'Name', 'Capacity', 'Status', 'Location', 'Linked'];
    const csvContent = [
      headers.join(','),
      ...tablesData.map(table => [
        table.id,
        table.name,
        table.capacity,
        table.status,
        table.location,
        table.isLinked ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'tables_export.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Export successful",
      description: "Tables data has been exported to CSV."
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'empty': return 'bg-green-500';
      case 'occupied': return 'bg-amber-500';
      case 'booked': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTableSize = (capacity: number, isLinked: boolean, linkedWith?: string[]) => {
    let totalCapacity = capacity;
    
    if (isLinked && linkedWith) {
      totalCapacity = calculateTotalCapacity([...linkedWith, capacity.toString()]);
    }
    
    if (totalCapacity <= 2) return 'w-20 h-20';
    if (totalCapacity <= 4) return 'w-24 h-24';
    if (totalCapacity <= 6) return 'w-28 h-24';
    if (totalCapacity <= 8) return 'w-32 h-28';
    return 'w-40 h-32';
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Tables</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport}
              className="hidden sm:flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              Export
            </Button>
            <Dialog open={isAddTableOpen} onOpenChange={setIsAddTableOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Table</span>
                </Button>
              </DialogTrigger>
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
                    <Button variant="outline" onClick={() => setIsAddTableOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddTable}>Add Table</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {linkMode && selectedTables.length > 0 && (
          <div className="bg-muted p-4 rounded-md flex items-center justify-between animate-fade-in">
            <div>
              <span className="font-medium">{selectedTables.length} tables selected</span>
              <p className="text-sm text-muted-foreground">Combined capacity: {calculateTotalCapacity(selectedTables)} seats</p>
            </div>
            <Button onClick={handleLinkTables}>Link Selected Tables</Button>
          </div>
        )}

        <div className="flex items-center justify-between">
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

        {view === 'layout' ? (
          <div className="bg-muted p-6 rounded-lg min-h-[600px] relative border border-dashed">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {tablesData.map((table) => {
                const isSelected = selectedTables.includes(table.id);
                const linkedClasses = table.isLinked ? 'ring-2 ring-blue-500' : '';
                const selectedClasses = isSelected ? 'ring-2 ring-primary ring-offset-2' : '';
                
                return (
                  <div 
                    key={table.id}
                    className={`relative ${getTableSize(table.capacity, table.isLinked, table.linkedWith)} rounded-md ${
                      table.isLinked ? 'bg-blue-100' : 'bg-white'
                    } shadow-md hover:shadow-lg transition-all flex flex-col items-center justify-center cursor-pointer ${linkedClasses} ${selectedClasses} group`}
                    onClick={() => handleTableSelect(table.id)}
                  >
                    <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full ${getStatusColor(table.status)}`} title={table.status}></div>
                    <span className="font-semibold">{table.name}</span>
                    <span className="text-xs text-muted-foreground">{table.capacity} seats</span>

                    {/* Edit button that shows on hover */}
                    <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentEditTable(table);
                          setIsEditTableOpen(true);
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
                            handleUnlinkTables(table.id);
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tablesData.map((table) => {
                  const linkedTables = table.linkedWith 
                    ? tablesData.filter(t => table.linkedWith?.includes(t.id)).map(t => t.name).join(", ")
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
                            onClick={() => {
                              setCurrentEditTable(table);
                              setIsEditTableOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          {table.isLinked && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUnlinkTables(table.id)}
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
        )}

        {/* Edit Table Dialog */}
        <Dialog open={isEditTableOpen} onOpenChange={setIsEditTableOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Table</DialogTitle>
            </DialogHeader>
            {currentEditTable && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-table-name">Table Name</Label>
                  <Input 
                    id="edit-table-name" 
                    value={currentEditTable.name} 
                    onChange={(e) => setCurrentEditTable({...currentEditTable, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-table-capacity">Capacity</Label>
                  <Input 
                    id="edit-table-capacity" 
                    type="number" 
                    min="1"
                    value={currentEditTable.capacity} 
                    onChange={(e) => setCurrentEditTable({...currentEditTable, capacity: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-table-location">Location</Label>
                  <Input 
                    id="edit-table-location" 
                    value={currentEditTable.location} 
                    onChange={(e) => setCurrentEditTable({...currentEditTable, location: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-table-status">Status</Label>
                  <select 
                    id="edit-table-status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={currentEditTable.status}
                    onChange={(e) => setCurrentEditTable({
                      ...currentEditTable, 
                      status: e.target.value as 'empty' | 'occupied' | 'booked'
                    })}
                  >
                    <option value="empty">Empty</option>
                    <option value="occupied">Occupied</option>
                    <option value="booked">Booked</option>
                  </select>
                </div>
                <div className="pt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditTableOpen(false)}>Cancel</Button>
                  <Button onClick={handleEditTable}>Save Changes</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
