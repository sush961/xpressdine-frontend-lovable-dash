
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

interface TableHeaderProps {
  onExport: () => void;
  onOpenAddTableDialog: () => void;
}

export function TableHeader({ onExport, onOpenAddTableDialog }: TableHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold tracking-tight">Tables</h1>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onExport}
          className="hidden sm:flex items-center gap-1"
        >
          <FileText className="h-4 w-4" />
          Export
        </Button>
        <Button 
          size="sm" 
          className="flex items-center gap-1"
          onClick={onOpenAddTableDialog}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Table</span>
        </Button>
      </div>
    </div>
  );
}
