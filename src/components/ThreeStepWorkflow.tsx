import { useState, useEffect } from 'react';
import { Upload, FolderOpen, Briefcase, Zap, Loader2, X, Edit } from 'lucide-react';
import { Button } from './ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setAnalyzing,
  setCurrentMeetingId,
  setHasShownCompletionAlert,
  setSelectedFile,
  setSelectedProject,
  setSelectedDestination,
  clearWorkflowState,
} from '@/store/slices/uiSlice';
import { useGetMeetingByIdQuery } from '@/store/api/meetingsApi';
import { useGetUploadedFilesQuery } from '@/store/api/recordingsApi';
import { useGetClickUpHierarchyQuery, useGetClickUpConfigQuery } from '@/store/api/settingsApi';
import { toast } from 'sonner';
import { UploadModal } from './UploadModal';
import { ProjectModal } from './ProjectModal';
import { DestinationModal } from './DestinationModal';
import type { ClickUpDestination } from './ClickUpHierarchySelector';
import { cn } from '@/lib/utils';

export function ThreeStepWorkflow() {
  const dispatch = useAppDispatch();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [destinationModalOpen, setDestinationModalOpen] = useState(false);
  
  const selectedFile = useAppSelector((state) => state.ui.selectedFile);
  const selectedProject = useAppSelector((state) => state.ui.selectedProject);
  const selectedDestination = useAppSelector((state) => state.ui.selectedDestination);
  const analyzing = useAppSelector((state) => state.ui.analyzing);
  const currentMeetingId = useAppSelector((state) => state.ui.currentMeetingId);
  const hasShownCompletionAlert = useAppSelector((state) => state.ui.hasShownCompletionAlert);

  // Fetch meeting status - poll every 2s only if actively analyzing
  const { data: meeting } = useGetMeetingByIdQuery(currentMeetingId || '', {
    skip: !currentMeetingId,
    pollingInterval: analyzing ? 2000 : 0,
  });

  // Also poll uploaded files to check file status (in case backend process was manually stopped)
  const { data: uploadedFiles = [] } = useGetUploadedFilesQuery(undefined, {
    pollingInterval: analyzing && selectedFile ? 2000 : 0,
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

  // Check if processing is complete or stuck
  useEffect(() => {
    if (!analyzing || !currentMeetingId) return;

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
        // Clear workflow state after completion
        dispatch(clearWorkflowState());
      }
      return;
    }

    // Check uploaded file status - if file is no longer "analyzing", stop the spinner
    if (selectedFile && uploadedFiles.length > 0) {
      const currentFile = uploadedFiles.find((f) => f._id === selectedFile.id);
      if (currentFile) {
        // If file status changed from "analyzing" to something else, stop analyzing
        if (currentFile.status !== 'analyzing' && currentFile.meeting_id === currentMeetingId) {
          if (currentFile.status === 'analyzed') {
            toast.success('Meeting analysis completed successfully!');
          } else if (currentFile.status === 'failed') {
            toast.error('Meeting analysis failed. Please try again.');
          } else {
            // File status changed but not to a terminal state - might have been manually stopped
            toast.warning('Analysis process appears to have stopped.');
          }
          dispatch(setAnalyzing(false));
          dispatch(setHasShownCompletionAlert(true));
          dispatch(clearWorkflowState());
          return;
        }
      }
    }

    // Timeout detection: if we've been analyzing for more than 30 minutes without status change, assume stuck
    if (analysisStartTime && Date.now() - analysisStartTime > 30 * 60 * 1000) {
      toast.warning('Analysis is taking longer than expected. The process may have stopped.');
      dispatch(setAnalyzing(false));
      dispatch(setHasShownCompletionAlert(true));
      dispatch(clearWorkflowState());
    }
  }, [meeting, uploadedFiles, analyzing, hasShownCompletionAlert, currentMeetingId, selectedFile, analysisStartTime, dispatch]);

  const canSelectProject = !!selectedFile;
  const canSelectDestination = !!selectedFile && !!selectedProject;
  const canAnalyze = !!selectedFile && !!selectedProject && !!selectedDestination;

  const handleUploadComplete = (_fileId: string, _fileName: string, _fileSize: number, _fileType: string) => {
    // File is already set in Redux by UploadModal
    // Just close the modal
    setUploadModalOpen(false);
  };

  const handleDestinationSelected = (_destination: ClickUpDestination) => {
    // Destination is already set in Redux by DestinationModal
    // Just close the modal
    setDestinationModalOpen(false);
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !selectedProject || !selectedDestination) return;

    dispatch(setAnalyzing(true));
    dispatch(setHasShownCompletionAlert(false));

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const API_KEY = import.meta.env.VITE_API_KEY || '';
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/recordings/uploaded/${selectedFile.id}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY && { 'X-API-Key': API_KEY }),
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          destination_mode: 'manual',
          destination: selectedDestination,
          project_mode: selectedProject.mode,
          project_name: selectedProject.mode === 'manual' ? selectedProject.name : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to start analysis');
      }

      const data = await response.json();
      const meetingId = data.meeting_id;

      if (meetingId) {
        dispatch(setCurrentMeetingId(meetingId));
      } else {
        throw new Error('No meeting ID returned from server');
      }
    } catch (error: unknown) {
      console.error('Error analyzing uploaded file:', error);
      const err = error as { data?: { message?: string; error?: string }; message?: string };
      const message = err?.data?.message || err?.data?.error || err?.message || 'Failed to start analysis';
      toast.error(message);
      dispatch(setAnalyzing(false));
      dispatch(setCurrentMeetingId(null));
      dispatch(setHasShownCompletionAlert(false));
    }
  };

  const handleRemoveFile = () => {
    dispatch(setSelectedFile(null));
    dispatch(setSelectedProject(null));
    dispatch(setSelectedDestination(null));
  };

  const handleProjectSelected = (project: { name: string | null; mode: 'ai' | 'manual' }) => {
    dispatch(setSelectedProject(project));
    setProjectModalOpen(false);
    // Clear destination when project changes (may need different destination for different projects)
    dispatch(setSelectedDestination(null));
  };

  const handleRemoveProject = () => {
    dispatch(setSelectedProject(null));
    dispatch(setSelectedDestination(null));
  };

  const handleChangeDestination = () => {
    setDestinationModalOpen(true);
  };


  const { data: clickUpConfig } = useGetClickUpConfigQuery();
  const { data: hierarchyData } = useGetClickUpHierarchyQuery(
    clickUpConfig?.workspace_id || '',
    { skip: !clickUpConfig?.workspace_id || !selectedDestination }
  );

  const formatDestinationPath = (dest: ClickUpDestination): string => {
    if (!hierarchyData?.hierarchy) return 'Destination Selected';
    
    const hierarchy = hierarchyData.hierarchy;
    
    // Find the space
    const space = hierarchy.find((s: any) => s.space_id === dest.space_id);
    if (!space) return 'Destination Selected';
    
    let path = space.name;
    
    // Find the folder if it exists
    if (dest.folder_id) {
      const folder = space.folders?.find((f: any) => f.folder_id === dest.folder_id);
      if (folder) {
        path += ` > ${folder.name}`;
      }
    }
    
    // Find the list
    let listName = '';
    if (dest.folder_id) {
      const folder = space.folders?.find((f: any) => f.folder_id === dest.folder_id);
      const list = folder?.lists?.find((l: any) => l.list_id === dest.list_id);
      listName = list?.name || '';
    } else {
      const list = space.folderless_lists?.find((l: any) => l.list_id === dest.list_id);
      listName = list?.name || '';
    }
    
    if (listName) {
      path += ` > ${listName}`;
    }
    
    return path || 'Destination Selected';
  };


  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="w-full">
      <div className="flex items-stretch justify-center gap-3 md:gap-4 flex-wrap md:flex-nowrap">
        {/* Step 1: Upload File */}
        <div className="w-full md:w-[280px] flex-shrink-0">
          <div
            className={cn(
              "relative rounded-lg border-2 h-full min-h-[200px] p-4 flex flex-col transition-all cursor-pointer",
              selectedFile
                ? "border-primary bg-primary/5"
                : "border-dashed border-muted-foreground/30 hover:border-muted-foreground/50",
              analyzing && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !analyzing && setUploadModalOpen(true)}
          >
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                  selectedFile
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Upload className="h-6 w-6 text-blue-500" />
              </div>
              
              {selectedFile ? (
                <div className="w-full flex flex-col items-center gap-1.5">
                  <p 
                    className="font-medium text-sm text-center break-words px-1 min-h-[20px]" 
                    title={selectedFile.name}
                  >
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground min-h-[16px]">
                    {formatFileSize(selectedFile.size)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs mt-1 bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700 w-auto px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                  >
                    <X className="h-3 w-3 mr-1 text-red-500" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-medium">Upload Transcript File</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Click to upload</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Connector Arrow */}
        <div className="hidden md:flex items-center justify-center w-6 h-0.5 bg-muted-foreground/30 relative self-center">
          <div className={cn(
            "absolute w-0 h-0 border-l-6 border-l-muted-foreground/30 border-t-3 border-t-transparent border-b-3 border-b-transparent",
            canSelectProject && "border-l-primary"
          )} style={{ right: '-6px' }} />
        </div>

        {/* Step 2: Choose Project */}
        <div className="w-full md:w-[280px] flex-shrink-0">
          <div
            className={cn(
              "relative rounded-lg border-2 h-full min-h-[200px] p-4 flex flex-col transition-all",
              selectedProject
                ? "border-primary bg-primary/5 cursor-pointer"
                : canSelectProject
                ? "border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 cursor-pointer"
                : "border-dashed border-muted-foreground/20 opacity-50 cursor-not-allowed",
              analyzing && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !analyzing && canSelectProject && setProjectModalOpen(true)}
          >
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                  selectedProject
                    ? "bg-primary/10 text-primary"
                    : canSelectProject
                    ? "bg-muted text-muted-foreground"
                    : "bg-muted/50 text-muted-foreground/50"
                )}
              >
                <Briefcase className="h-6 w-6 text-purple-500" />
              </div>
              
              {selectedProject ? (
                <div className="w-full flex flex-col items-center gap-1.5">
                  <p 
                    className="font-medium text-sm text-center break-words px-1 min-h-[20px]" 
                    title={selectedProject.mode === 'manual' ? selectedProject.name || '' : 'Let AI find out'}
                  >
                    {selectedProject.mode === 'manual' 
                      ? selectedProject.name 
                      : 'Let AI find out'}
                  </p>
                  <div className="text-xs text-muted-foreground min-h-[16px]"></div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs mt-1 bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700 w-auto px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveProject();
                    }}
                  >
                    <X className="h-3 w-3 mr-1 text-red-500" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-medium">Choose Project</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {canSelectProject ? 'Click to choose' : 'Upload file first'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Connector Arrow */}
        <div className="hidden md:flex items-center justify-center w-6 h-0.5 bg-muted-foreground/30 relative self-center">
          <div className={cn(
            "absolute w-0 h-0 border-l-6 border-l-muted-foreground/30 border-t-3 border-t-transparent border-b-3 border-b-transparent",
            canSelectDestination && "border-l-primary"
          )} style={{ right: '-6px' }} />
        </div>

        {/* Step 3: Choose Destination */}
        <div className="w-full md:w-[280px] flex-shrink-0">
          <div
            className={cn(
              "relative rounded-lg border-2 h-full min-h-[200px] p-4 flex flex-col transition-all",
              selectedDestination
                ? "border-primary bg-primary/5 cursor-pointer"
                : canSelectDestination
                ? "border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 cursor-pointer"
                : "border-dashed border-muted-foreground/20 opacity-50 cursor-not-allowed",
              analyzing && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !analyzing && canSelectDestination && setDestinationModalOpen(true)}
          >
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                  selectedDestination
                    ? "bg-primary/10 text-primary"
                    : canSelectDestination
                    ? "bg-muted text-muted-foreground"
                    : "bg-muted/50 text-muted-foreground/50"
                )}
              >
                <FolderOpen className="h-6 w-6 text-green-500" />
              </div>
              
              {selectedDestination ? (
                <div className="w-full flex flex-col items-center gap-1.5">
                  <p 
                    className="font-medium text-sm text-center break-words px-1 min-h-[20px]" 
                    title={formatDestinationPath(selectedDestination)}
                  >
                    {formatDestinationPath(selectedDestination)}
                  </p>
                  <div className="text-xs text-muted-foreground min-h-[16px]"></div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs mt-1 bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700 w-auto px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChangeDestination();
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1 text-blue-500" />
                    Change
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-medium">Choose Destination</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {canSelectDestination ? 'Click to choose' : selectedProject ? 'Select project first' : 'Upload file first'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analyze Button - Below the three steps */}
      <div className="flex justify-center mt-6 mb-4">
        <div className="w-full max-w-[280px]">
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="default"
              size="lg"
              className={cn(
                "w-full text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md",
                !canAnalyze && "opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400"
              )}
              onClick={handleAnalyze}
              disabled={!canAnalyze || analyzing}
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className={cn(
                    "h-5 w-5 mr-2",
                    !canAnalyze ? "text-white" : "text-yellow-500"
                  )} />
                  Analyze Now
                </>
              )}
            </Button>
            {!canAnalyze && (
              <p className="text-xs text-muted-foreground mt-1">
                Complete all steps above
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <UploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUploadComplete={handleUploadComplete}
      />
      
      <ProjectModal
        open={projectModalOpen}
        onOpenChange={setProjectModalOpen}
        onProjectSelected={handleProjectSelected}
        currentSelection={selectedProject}
      />
      
      <DestinationModal
        open={destinationModalOpen}
        onOpenChange={setDestinationModalOpen}
        onDestinationSelected={handleDestinationSelected}
      />
    </div>
  );
}
