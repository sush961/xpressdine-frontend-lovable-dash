
import { useState } from 'react';
import { TableData, TableFormValues } from '@/components/tables/types';
import { useToast } from '@/components/ui/use-toast';

// Initial mock data - would be fetched from API in real implementation
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

export function useTableManager() {
  const { toast } = useToast();
  const [tablesData, setTablesData] = useState<TableData[]>(initialTablesData);
  const [linkMode, setLinkMode] = useState(false);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [isEditTableOpen, setIsEditTableOpen] = useState(false);
  const [currentEditTable, setCurrentEditTable] = useState<TableData | null>(null);

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

  const handleAddTable = (newTableData: TableFormValues) => {
    if (!newTableData.name.trim()) {
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
      name: newTableData.name,
      capacity: Number(newTableData.capacity),
      status: 'empty',
      location: newTableData.location,
      isLinked: false
    };

    setTablesData([...tablesData, tableToAdd]);
    setIsAddTableOpen(false);
    
    toast({
      title: "Table added",
      description: `${newTableData.name} has been successfully added.`
    });
    
    return true;
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

  return {
    tablesData,
    linkMode,
    selectedTables,
    isAddTableOpen,
    isEditTableOpen,
    currentEditTable,
    setLinkMode,
    setSelectedTables,
    setIsAddTableOpen,
    setIsEditTableOpen,
    setCurrentEditTable,
    handleTableSelect,
    calculateTotalCapacity,
    handleLinkTables,
    handleUnlinkTables,
    handleAddTable,
    handleEditTable,
    handleExport
  };
}
