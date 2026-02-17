import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ProjectSelector } from './ProjectSelector';
import { Upload, FileText, X } from 'lucide-react';
import { usePreviewDocumentMutation, useUploadDocumentMutation } from '@/store/api/knowledgeBaseApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setKnowledgeBaseFile,
  setKnowledgeBasePreview,
  setKnowledgeBaseProject,
  setUploading,
  clearKnowledgeBaseState,
} from '@/store/slices/uiSlice';
import { toast } from 'sonner';
// PreviewData type not needed - preview comes from Redux state

interface KnowledgeBaseUploadProps {
  onUploadComplete: () => void;
}

export function KnowledgeBaseUpload({ onUploadComplete }: KnowledgeBaseUploadProps) {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileObjectRef = useRef<File | null>(null); // Store actual File object (can't be in Redux)

  // Read state from Redux (persists across navigation)
  const knowledgeBaseFile = useAppSelector((state) => state.ui.knowledgeBaseFile);
  const preview = useAppSelector((state) => state.ui.knowledgeBasePreview);
  const projectName = useAppSelector((state) => state.ui.knowledgeBaseProject);
  const uploading = useAppSelector((state) => state.ui.uploading);

  // RTK Query hooks
  const [previewDocument, { isLoading: previewLoading }] = usePreviewDocumentMutation();
  const [uploadDocument] = useUploadDocumentMutation();

  // Restore file object from input if metadata exists in Redux but file object is missing
  useEffect(() => {
    if (knowledgeBaseFile && !fileObjectRef.current && fileInputRef.current?.files?.[0]) {
      const file = fileInputRef.current.files[0];
      if (file.name === knowledgeBaseFile.name && file.size === knowledgeBaseFile.size) {
        fileObjectRef.current = file;
      }
    }
  }, [knowledgeBaseFile]);

  const handleFileSelect = async (selectedFile: File) => {
    // Validate file type
    const validTypes = ['application/pdf', 'text/plain'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Invalid file type. Only PDF and TXT files are allowed.');
      return;
    }

    // Validate file size (50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error('File size exceeds 50MB limit.');
      return;
    }

    // Store actual File object in ref (can't be serialized in Redux)
    fileObjectRef.current = selectedFile;

    // Store file metadata in Redux (persists across navigation)
    dispatch(setKnowledgeBaseFile({
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
    }));

    try {
      const response = await previewDocument(selectedFile).unwrap();
      dispatch(setKnowledgeBasePreview(response));
    } catch (error: unknown) {
      console.error('Error generating preview:', error);
      const err = error as { data?: { error?: string }; message?: string };
      toast.error(err?.data?.error || err?.message || 'Failed to generate preview');
      dispatch(setKnowledgeBaseFile(null));
      fileObjectRef.current = null;
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!knowledgeBaseFile || !projectName) {
      toast.error('Please select a file and project');
      return;
    }

    // Get actual File object from ref
    const file = fileObjectRef.current;
    if (!file) {
      toast.error('File not found. Please select the file again.');
      dispatch(setKnowledgeBaseFile(null));
      return;
    }

    dispatch(setUploading(true));
    try {
      await uploadDocument({ file, projectName }).unwrap();
      toast.success('Document uploaded successfully!');
      dispatch(clearKnowledgeBaseState());
      fileObjectRef.current = null;
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onUploadComplete();
    } catch (error: unknown) {
      console.error('Error uploading document:', error);
      const err = error as { data?: { error?: string }; message?: string };
      toast.error(err?.data?.error || err?.message || 'Failed to upload document');
    } finally {
      dispatch(setUploading(false));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!knowledgeBaseFile ? (
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <p className="text-lg font-medium mb-2">Drag and drop a file here</p>
            <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
            <p className="text-xs text-muted-foreground">Supported: PDF, TXT (Max 50MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium">{knowledgeBaseFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(knowledgeBaseFile.size)} • {knowledgeBaseFile.type === 'application/pdf' ? 'PDF' : 'TXT'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  fileObjectRef.current = null;
                  dispatch(clearKnowledgeBaseState());
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>

            {/* Preview */}
            {previewLoading ? (
              <div className="p-4 border rounded-lg text-center text-muted-foreground">
                Generating preview...
              </div>
            ) : preview ? (
              <div className="space-y-2">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <p className="text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {preview.preview}
                  </p>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Estimated chunks: {preview.estimatedChunks}</span>
                  <span>Size: {formatFileSize(preview.size)}</span>
                </div>
              </div>
            ) : null}

            {/* Project Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select Project</label>
              <ProjectSelector
                value={projectName}
                onValueChange={(value) => dispatch(setKnowledgeBaseProject(value))}
              />
            </div>

            {/* Upload Button */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  fileObjectRef.current = null;
                  dispatch(clearKnowledgeBaseState());
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploading || !projectName}>
                {uploading ? 'Uploading...' : 'Upload to Knowledge Base'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

