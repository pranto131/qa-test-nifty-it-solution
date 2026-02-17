import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { ClickUpHierarchySelector, type ClickUpDestination } from './ClickUpHierarchySelector';
import { useGetClickUpConfigQuery } from '@/store/api/settingsApi';
import { useAppDispatch } from '@/store/hooks';
import { setSelectedDestination } from '@/store/slices/uiSlice';

interface DestinationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDestinationSelected: (destination: ClickUpDestination) => void;
}

export function DestinationModal({ open, onOpenChange, onDestinationSelected }: DestinationModalProps) {
  const dispatch = useAppDispatch();
  const [selectedDestination, setSelectedDestinationLocal] = useState<ClickUpDestination | null>(null);
  const { data: clickUpConfig, isLoading: loadingConfig } = useGetClickUpConfigQuery();

  // Reset selection when modal opens
  useEffect(() => {
    if (open) {
      setSelectedDestinationLocal(null);
    }
  }, [open]);

  const handleDestinationChange = (destination: ClickUpDestination | null) => {
    setSelectedDestinationLocal(destination);
  };

  const handleConfirm = () => {
    if (selectedDestination) {
      dispatch(setSelectedDestination(selectedDestination));
      onDestinationSelected(selectedDestination);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Choose Destination</DialogTitle>
          <DialogDescription>
            Select where tasks should be created in ClickUp
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {loadingConfig ? (
            <div className="text-sm text-muted-foreground p-4 text-center">
              <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
              Loading ClickUp configuration...
            </div>
          ) : clickUpConfig?.configured && clickUpConfig?.workspace_id ? (
            <ClickUpHierarchySelector
              workspaceId={clickUpConfig.workspace_id}
              value={selectedDestination || undefined}
              onChange={handleDestinationChange}
              disabled={false}
            />
          ) : (
            <div className="text-sm text-muted-foreground p-4 text-center border rounded-lg">
              Please configure your ClickUp API token in Settings first.
              {clickUpConfig && (
                <p className="text-xs mt-2">
                  Status: {clickUpConfig.configured ? 'Configured' : 'Not configured'} | 
                  Workspace: {clickUpConfig.workspace_id || 'None'}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedDestination}
            >
              Confirm Selection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
