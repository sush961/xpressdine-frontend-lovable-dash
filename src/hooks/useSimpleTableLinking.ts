import { useState, useCallback } from 'react';

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useSimpleTableLinking() {
  const [tableLinks, setTableLinks] = useState<{
    id: string;
    tableIds: string[];
    name: string;
  }[]>([]);

  const getTableDisplayName = useCallback((tableId: string, tables: Table[]) => {
    // Check if it's a linked table group
    const link = tableLinks.find(link => link.id === tableId);
    if (link) {
      const tableNumbers = link.tableIds
        .map(id => tables.find(t => t.id === id)?.number)
        .filter(Boolean);
      return `Tables ${tableNumbers.join(' + ')}`;
    }
    
    // Check if it's a regular table
    const table = tables.find(t => t.id === tableId);
    return table ? `Table ${table.number}` : 'Unknown Table';
  }, [tableLinks]);

  return {
    tableLinks,
    getTableDisplayName,
  };
}
