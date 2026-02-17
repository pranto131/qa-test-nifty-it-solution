import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  useGetUploadedFilesQuery,
  useDeleteUploadedFileMutation,
  type UploadedFile,
} from '@/store/api/recordingsApi';
import { useGetMeetingByIdQuery } from '@/store/api/meetingsApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setAnalyzing,
  setHasShownCompletionAlert,
} from '@/store/slices/uiSlice';
import { Loader2, FileText, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ConfirmDialog } from './ui/confirm-dialog';

export function ManualMeetingSelector() {
  const dispatch = useAppDispatch();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ id: string; name: string } | null>(null);
  
  // Redux state
  const analyzing = useAppSelector((state) => state.ui.analyzing);
  const currentMeetingId = useAppSelector((state) => state.ui.currentMeetingId);
  const hasShownCompletionAlert = useAppSelector(
    (state) => state.ui.hasShownCompletionAlert
  );

  // RTK Query hooks
  const { data: uploadedFiles = [], isLoading: loadingFiles, refetch: refetchUploadedFiles } = useGetUploadedFilesQuery();
  const [deleteUploadedFile] = useDeleteUploadedFileMutation();
  
  // Fetch meeting status - always fetch if we have a meetingId (to check status on mount after refresh)
  // Poll every 2s only if actively analyzing
  const { data: meeting } = useGetMeetingByIdQuery(currentMeetingId || '', {
    skip: !currentMeetingId,
    pollingInterval: analyzing ? 2000 : 0, // Poll every 2s while analyzing
  });

  // Track when analysis started for timeout detection
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null);

  // Set analysis start time when analysis begins
  useEffect(() => {
    if (analyzing && !analysisStartTime) {
      setAnalysisStartTime(Date.now());
    } else if (!analyzing) {
      setAnalysisStartTime(null);
    }
  }, [analyzing, analysisStartTime]);

  // Check if processing is complete (via RTK Query polling)
  // Also handles case where page was refreshed and meeting status needs to be checked
  // Also checks uploaded file status in case backend process was manually stopped
  useEffect(() => {
    if (!analyzing || !currentMeetingId) {
      // If not analyzing, check if we should resume (e.g., after page refresh)
      if (meeting?.status === 'processing' && currentMeetingId && !analyzing) {
        dispatch(setAnalyzing(true));
        dispatch(setHasShownCompletionAlert(false));
      }
      return;
    }

    // Check meeting status
    if (meeting && (meeting.status === 'completed' || meeting.status === 'failed')) {
      if (!hasShownCompletionAlert) {
        if (meeting.status === 'completed') {
          toast.success('Meeting analysis completed successfully!');
        } else {
          toast.error('Meeting analysis failed. Please try again.');
        }
        dispatch(setAnalyzing(false));
        dispatch(setHasShownCompletionAlert(true));
        // Refetch uploaded files to update their status
        refetchUploadedFiles();
      }
      return;
    }

    // Check uploaded file status - if file is no longer "analyzing", stop the spinner
    // This handles the case where backend process was manually stopped
    const analyzingFile = uploadedFiles.find(
      (file) => file.status === 'analyzing' && file.meeting_id === currentMeetingId
    );
    
    // If we have a meetingId but no file is in "analyzing" status, the process likely stopped
    if (!analyzingFile) {
      const fileWithMeetingId = uploadedFiles.find((file) => file.meeting_id === currentMeetingId);
      if (fileWithMeetingId) {
        // File exists but is not analyzing - process was stopped
        if (fileWithMeetingId.status === 'analyzed') {
          toast.success('Meeting analysis completed successfully!');
        } else if (fileWithMeetingId.status === 'failed') {
          toast.error('Meeting analysis failed. Please try again.');
        } else {
          // File status changed but not to a terminal state - might have been manually stopped
          toast.warning('Analysis process appears to have stopped.');
        }
        dispatch(setAnalyzing(false));
        dispatch(setHasShownCompletionAlert(true));
        refetchUploadedFiles();
        return;
      }
    }

    // Timeout detection: if we've been analyzing for more than 30 minutes without status change, assume stuck
    if (analysisStartTime && Date.now() - analysisStartTime > 30 * 60 * 1000) {
      toast.warning('Analysis is taking longer than expected. The process may have stopped.');
      dispatch(setAnalyzing(false));
      dispatch(setHasShownCompletionAlert(true));
      refetchUploadedFiles();
    }
  }, [meeting, uploadedFiles, analyzing, hasShownCompletionAlert, currentMeetingId, analysisStartTime, dispatch, refetchUploadedFiles]);

  const handleDeleteClick = (fileId: string, fileName: string) => {
    setFileToDelete({ id: fileId, name: fileName });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;

    try {
      await deleteUploadedFile(fileToDelete.id).unwrap();
      toast.success('File deleted successfully');
    } catch (error: unknown) {
      console.error('Error deleting file:', error);
      const err = error as { data?: { error?: string }; message?: string };
      toast.error(err?.data?.error || err?.message || 'Failed to delete file');
    } finally {
      setFileToDelete(null);
    }
  };


  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (date: string | Date): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploaded':
        return <Badge variant="uploaded">Uploaded</Badge>;
      case 'analyzing':
        return null; // Don't show badge for analyzing - show spinner instead
      case 'analyzed':
        return null; // Don't show badge for analyzed - show right side text instead
      case 'failed':
        return <Badge variant="failed">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Find the file currently being analyzed
  const analyzingFile = uploadedFiles.find(
    (file) => file.status === 'analyzing' && file.meeting_id === currentMeetingId
  );

  // Check if meeting is completed or failed - if so, don't show spinner even if file status is still analyzing
  const isMeetingCompleted = meeting?.status === 'completed' || meeting?.status === 'failed';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-4 w-4" />
          Uploaded Files
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {/* Uploaded Files List - Fixed height, scrollable, compact */}
        <div className="h-[280px] overflow-y-auto">
          {loadingFiles && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading files...
            </div>
          )}

          {uploadedFiles.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">No files uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {uploadedFiles.map((file) => {
                const isAnalyzingThisFile = analyzingFile?._id === file._id;
                const canDelete = file.status === 'uploaded' || file.status === 'failed';

                return (
                  <div
                    key={file._id}
                    className="flex items-center justify-between p-1.5 border rounded hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium truncate">{file.original_name}</p>
                          {getStatusBadge(file.status)}
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                          <span>{formatFileSize(file.file_size)}</span>
                          <span>{file.file_type.toUpperCase()}</span>
                          <span>{formatDate(file.uploaded_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Show spinner when file is analyzing AND meeting is not completed/failed */}
                      {(file.status === 'analyzing' || isAnalyzingThisFile) && !isMeetingCompleted && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleDeleteClick(file._id, file.original_name)}
                          disabled={analyzing || file.status === 'analyzing'}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      )}
                      {file.status === 'analyzed' && !isAnalyzingThisFile && (
                        <div className="text-xs text-green-600">
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete File"
        description={`Are you sure you want to delete "${fileToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </Card>
  );
}
