
import { Button } from '@/components/ui/button';

interface LinkModeNotificationProps {
  selectedTablesCount: number;
  combinedCapacity: number;
  onLinkTables: () => void;
}

export function LinkModeNotification({ 
  selectedTablesCount, 
  combinedCapacity, 
  onLinkTables 
}: LinkModeNotificationProps) {
  if (selectedTablesCount === 0) return null;
  
  return (
    <div className="bg-muted p-4 rounded-md flex items-center justify-between animate-fade-in">
      <div>
        <span className="font-medium">{selectedTablesCount} tables selected</span>
        <p className="text-sm text-muted-foreground">Combined capacity: {combinedCapacity} seats</p>
      </div>
      <Button onClick={onLinkTables}>Link Selected Tables</Button>
    </div>
  );
}
