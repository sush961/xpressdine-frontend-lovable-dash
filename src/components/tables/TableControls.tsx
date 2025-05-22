
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { TableView } from './types';

interface TableControlsProps {
  linkMode: boolean;
  onToggleLinkMode: (checked: boolean) => void;
  view: TableView;
  onSetView: (view: TableView) => void;
}

export function TableControls({ 
  linkMode, 
  onToggleLinkMode, 
  view, 
  onSetView 
}: TableControlsProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Switch
          id="link-mode"
          checked={linkMode}
          onCheckedChange={onToggleLinkMode}
        />
        <Label htmlFor="link-mode">Link Tables Mode</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Label>View:</Label>
        <div className="border rounded-md p-1">
          <Button
            variant={view === 'layout' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onSetView('layout')}
            className="rounded-r-none"
          >
            Layout
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onSetView('list')}
            className="rounded-l-none"
          >
            List
          </Button>
        </div>
      </div>
    </div>
  );
}
