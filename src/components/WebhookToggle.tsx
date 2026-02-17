// WEBHOOK FUNCTIONALITY COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
/*
import { useEffect, useState } from 'react';
import { Switch } from './ui/switch';
import { webhookApi } from '@/services/api';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export function WebhookToggle() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchToggleStatus();
  }, []);

  const fetchToggleStatus = async () => {
    try {
      const response = await webhookApi.getToggle();
      setEnabled(response.data.enabled);
    } catch (error) {
      console.error('Error fetching webhook toggle:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (checked: boolean) => {
    setUpdating(true);
    try {
      await webhookApi.setToggle(checked);
      setEnabled(checked);
    } catch (error) {
      console.error('Error updating webhook toggle:', error);
      // Revert on error
      setEnabled(!checked);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading webhook status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {enabled ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-muted-foreground" />
            )}
            <label className="text-sm font-medium">Webhook Processing</label>
          </div>
          <p className="text-xs text-muted-foreground ml-7">
            {enabled 
              ? 'Webhooks from Zoom will be processed and transcripts analyzed' 
              : 'Webhooks will be received but not processed'}
          </p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={handleToggle}
          disabled={updating}
        />
      </div>
      
      {updating && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Updating...</span>
        </div>
      )}

      {!enabled && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
              Webhooks are disabled
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              Enable webhook processing to automatically analyze meeting transcripts and create tasks.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
*/

// Placeholder export to prevent TypeScript errors
export function WebhookToggle() {
  return null;
}
