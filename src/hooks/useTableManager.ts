
import { useState, useEffect, useCallback } from 'react';
import { TableData, TableFormValues } from '@/components/tables/types';
import { useToast } from '@/components/ui/use-toast';

export function useTableManager() {
  const { toast } = useToast();
  const [tablesData, setTablesData] = useState<TableData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [linkMode, setLinkMode] = useState(false);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [isEditTableOpen, setIsEditTableOpen] = useState(false);
  const [currentEditTable, setCurrentEditTable] = useState<TableData | null>(null);
  
  // Fetch tables from API
  const fetchTablesFromAPI = useCallback(async () => {
    try {
      const response = await fetch('/api/tables');
      if (!response.ok) {
        throw new Error('Failed to fetch tables');
      }
      const backendTables = await response.json();
      
      // Convert to frontend format
      const frontendTables = backendTables.map((table: any) => ({
        id: table.id,
        name: `Table ${table.number}`,
        capacity: table.capacity,
        status: table.currentStatus || 'empty',
        location: 'Window', // Keep as display-only for now
        isLinked: false, // Keep linking as frontend-only
        // Preserve any existing table data if it exists
        ...tablesData.find(t => t.id === table.id)
      }));
      
      setTablesData(frontendTables);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tables. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, tablesData]);
  
  // Fetch tables on mount
  useEffect(() => {
    fetchTablesFromAPI();
    
    // Set up polling every 30 seconds to refresh table status
    const intervalId = setInterval(fetchTablesFromAPI, 30000);
    
    return () => clearInterval(intervalId);
  }, [fetchTablesFromAPI]);

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
