
import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TableView } from '@/components/tables/types';
import { TableHeader } from '@/components/tables/TableHeader';
import { LinkModeNotification } from '@/components/tables/LinkModeNotification';
import { TableControls } from '@/components/tables/TableControls';
import { TableLayoutView } from '@/components/tables/TableLayoutView';
import { TableListView } from '@/components/tables/TableListView';
import { AddTableDialog } from '@/components/tables/AddTableDialog';
import { EditTableDialog } from '@/components/tables/EditTableDialog';
import { useTableManager } from '@/hooks/useTableManager';

export default function Tables() {
  const [view, setView] = useState<TableView>('layout');
  
  const {
    tablesData,
    linkMode,
    selectedTables,
    isAddTableOpen,
    isEditTableOpen,
    currentEditTable,
    setLinkMode,
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
  } = useTableManager();

  const handleToggleLinkMode = (checked: boolean) => {
    setLinkMode(checked);
    if (!checked) {
      setSelectedTables([]);
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <TableHeader 
          onExport={handleExport}
          onOpenAddTableDialog={() => setIsAddTableOpen(true)}
        />

        {linkMode && selectedTables.length > 0 && (
          <LinkModeNotification 
            selectedTablesCount={selectedTables.length}
            combinedCapacity={calculateTotalCapacity(selectedTables)}
            onLinkTables={handleLinkTables}
          />
        )}

        <TableControls 
          linkMode={linkMode}
          onToggleLinkMode={handleToggleLinkMode}
          view={view}
          onSetView={setView}
        />

        {view === 'layout' ? (
          <TableLayoutView 
            tables={tablesData}
            onSelectTable={handleTableSelect}
            onEditTable={(table) => {
              setCurrentEditTable(table);
              setIsEditTableOpen(true);
            }}
            onUnlinkTables={handleUnlinkTables}
            selectedTables={selectedTables}
          />
        ) : (
          <TableListView 
            tables={tablesData}
            onEditTable={(table) => {
              setCurrentEditTable(table);
              setIsEditTableOpen(true);
            }}
            onUnlinkTables={handleUnlinkTables}
          />
        )}

        <AddTableDialog 
          isOpen={isAddTableOpen}
          onClose={() => setIsAddTableOpen(false)}
          onAddTable={handleAddTable}
        />

        <EditTableDialog 
          isOpen={isEditTableOpen}
          onClose={() => setIsEditTableOpen(false)}
          onSave={handleEditTable}
          currentTable={currentEditTable}
          setCurrentTable={setCurrentEditTable}
        />
      </div>
    </DashboardLayout>
  );
}
