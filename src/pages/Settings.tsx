import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { settingsApi } from '@/services/api';
import { useGetClickUpConfigQuery } from '@/store/api/settingsApi';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';


export default function Settings() {
  const [clickUpConfig, setClickUpConfig] = useState({
    api_token: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'meetings' | 'logs' | 'processing-history' | 'tasks' | 'pinecone-context' | 'all' | null>(null);

  // RTK Query hooks
  const { data: configData, refetch: refetchConfig } = useGetClickUpConfigQuery();
  console.log('configData', configData);

  useEffect(() => {
    fetchClickUpConfig();
  }, []);

  // Update local state when config data changes - only preserve API token
  useEffect(() => {
    // Keep existing token in local state (not returned from API for security)
  }, [configData]);

  const fetchClickUpConfig = async () => {
    try {
      const response = await settingsApi.getClickUpConfig();
      if (response.data) {
        // Don't overwrite the token in local state - keep what user typed
        // The backend doesn't return the token for security
      }
    } catch (error) {
      console.error('Error fetching ClickUp config:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleSave = async () => {
    if (!clickUpConfig.api_token) {
      toast.error('API token is required');
      return;
    }
    setSaving(true);
    try {
      await settingsApi.updateClickUpConfig({
        api_token: clickUpConfig.api_token,
      } as any);
      toast.success('ClickUp configuration saved and hierarchy synced successfully!');
      // Clear the token from local state after successful save (for security)
      setClickUpConfig({ api_token: '' });
      // Refetch config to get the updated workspace_id and configured flag
      await refetchConfig();
    } catch (error: any) {
      console.error('Error saving ClickUp config:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to save configuration';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (
    // PIPELINE EVALUATION COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
    type: 'meetings' | 'logs' | 'processing-history' | 'tasks' | /* 'pipeline-evaluations' | */ 'pinecone-context' | 'all'
  ) => {
    setDeleteType(type);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteType) return;

    setDeleting(deleteType);
    try {
      let response;
      switch (deleteType) {
        case 'meetings':
          response = await settingsApi.deleteAllMeetings();
          break;
        case 'logs':
          response = await settingsApi.deleteAllLogs();
          break;
        case 'processing-history':
          response = await settingsApi.deleteAllProcessingHistory();
          break;
        case 'tasks':
          response = await settingsApi.deleteAllTasks();
          break;
        // PIPELINE EVALUATION COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
        // case 'pipeline-evaluations':
        //   response = await settingsApi.deleteAllPipelineEvaluations();
        //   break;
        case 'pinecone-context':
          response = await settingsApi.clearPineconeMeetingContext();
          break;
        case 'all':
          response = await settingsApi.deleteAllData();
          break;
      }
      
      const message = response.data.message || 'Data deleted successfully';
      const deletedCount =
        response.data.deletedCount !== undefined
          ? response.data.deletedCount
          : response.data.deleted?.total;
      const countText =
        typeof deletedCount === 'number'
          ? ` Deleted: ${deletedCount} item(s)`
          : '';
      toast.success(`${message}${countText}`);
    } catch (error: any) {
      console.error(`Error deleting ${deleteType}:`, error);
      const errorMessage = error.response?.data?.error || 'Failed to delete data';
      toast.error(errorMessage);
    } finally {
      setDeleting(null);
      setDeleteType(null);
    }
  };

  const getDeleteDialogContent = () => {
    if (!deleteType) return { title: '', description: '' };
    
    if (deleteType === 'all') {
      return {
        title: 'Delete All Data',
        description: '⚠️ WARNING: This will delete ALL meetings, logs, processing history, and tasks. Webhook settings, ClickUp config, and Zoom tokens will be preserved. This action cannot be undone. Are you sure?',
      };
    } else if (deleteType === 'pinecone-context') {
      return {
        title: 'Clear Pinecone Meeting Context',
        description: 'This will remove every vector inside the Pinecone meeting context index while keeping the index itself. This action cannot be undone. Continue?',
      };
    } else {
      return {
        title: `Delete All ${deleteType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
        description: `Are you sure you want to delete all ${deleteType.replace('-', ' ')}? This action cannot be undone.`,
      };
    }
  };

  if (loading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ClickUp Configuration</CardTitle>
          <CardDescription>Configure your ClickUp API credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api_token">ClickUp API Token</Label>
            <Input
              id="api_token"
              type="password"
              value={clickUpConfig.api_token}
              onChange={(e) =>
                setClickUpConfig({ ...clickUpConfig, api_token: e.target.value })
              }
              placeholder="pk_..."
            />
            <p className="text-xs text-muted-foreground">
              Enter your ClickUp API token. The system will automatically fetch your workspace and sync the hierarchy.
            </p>
          </div>
          {configData?.configured && configData?.workspace_id && (
            <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
              <Label>Current Configuration</Label>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="text-green-600 font-medium">✓ ClickUp is configured</p>
                <p>Workspace ID: {configData.workspace_id}</p>
                <p className="text-xs mt-2">The API token is securely stored. Enter a new token to update the configuration.</p>
              </div>
            </div>
          )}
          <Button onClick={handleSave} disabled={saving || !clickUpConfig.api_token}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving and Syncing...
              </>
            ) : (
              'Save API Token & Sync'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Data Management
          </CardTitle>
          <CardDescription>
            Remove data from the database. Webhook settings, ClickUp configuration, and Zoom tokens will be preserved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Meetings</Label>
              <Button
                variant="destructive"
                onClick={() => handleDeleteClick('meetings')}
                disabled={deleting !== null}
                className="w-full"
              >
                {deleting === 'meetings' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                    Delete All Meetings
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Remove all meeting records and transcripts
              </p>
            </div>

            <div className="space-y-2">
              <Label>Logs</Label>
              <Button
                variant="destructive"
                onClick={() => handleDeleteClick('logs')}
                disabled={deleting !== null}
                className="w-full"
              >
                {deleting === 'logs' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                    Delete All Logs
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Remove all logs (webhook logs preserved)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Processing History</Label>
              <Button
                variant="destructive"
                onClick={() => handleDeleteClick('processing-history')}
                disabled={deleting !== null}
                className="w-full"
              >
                {deleting === 'processing-history' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                    Delete All Processing History
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Remove all processing history records
              </p>
            </div>

            <div className="space-y-2">
              <Label>Tasks</Label>
              <Button
                variant="destructive"
                onClick={() => handleDeleteClick('tasks')}
                disabled={deleting !== null}
                className="w-full"
              >
                {deleting === 'tasks' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                    Delete All Tasks
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Remove all task records
              </p>
            </div>

            {/* PIPELINE EVALUATION COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE */}
            {/* <div className="space-y-2">
              <Label>Pipeline Evaluations</Label>
              <Button
                variant="destructive"
                onClick={() => handleDelete('pipeline-evaluations')}
                disabled={deleting !== null}
                className="w-full"
              >
                {deleting === 'pipeline-evaluations' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                    Delete All Pipeline Evaluations
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Remove all pipeline evaluation records
              </p>
            </div> */}

            <div className="space-y-2">
              <Label>Pinecone Meeting Context</Label>
              <Button
                variant="destructive"
                onClick={() => handleDeleteClick('pinecone-context')}
                disabled={deleting !== null}
                className="w-full"
              >
                {deleting === 'pinecone-context' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                    Clear Meeting Context Index
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Remove every namespace and vector inside the Pinecone meeting context index (index remains)
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="space-y-2">
              <Label className="text-destructive">Delete All Data</Label>
              <Button
                variant="destructive"
                onClick={() => handleDeleteClick('all')}
                disabled={deleting !== null}
                className="w-full"
              >
                {deleting === 'all' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting All...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                    Delete All Data
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Remove all meetings, logs, processing history, and tasks at once. Webhook settings, ClickUp config, and Zoom tokens will be preserved.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={getDeleteDialogContent().title}
        description={getDeleteDialogContent().description}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

