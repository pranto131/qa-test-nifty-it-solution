import { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Upload, Loader2 } from 'lucide-react';
import { useUploadFileMutation } from '@/store/api/recordingsApi';
import { useAppDispatch } from '@/store/hooks';
import { setSelectedFile } from '@/store/slices/uiSlice';
import { toast } from 'sonner';

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: (fileId: string, fileName: string, fileSize: number, fileType: string) => void;
}

export function UploadModal({ open, onOpenChange, onUploadComplete }: UploadModalProps) {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadFile, { isLoading: uploading }] = useUploadFileMutation();

  const handleFileSelect = async (selectedFile: File) => {
    // Validate file type
    const validExtensions = ['.vtt', '.txt'];
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      toast.error('Invalid file type. Only .vtt and .txt files are allowed.');
      return;
    }

    // Validate file size (50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error('File size exceeds 50MB limit.');
      return;
    }

    try {
      const response = await uploadFile(selectedFile).unwrap();
      toast.success('File uploaded successfully!');
      
      // Update Redux state
      dispatch(setSelectedFile({
        id: response.file._id,
        name: response.file.original_name,
        size: response.file.file_size,
        type: response.file.file_type,
      }));
      
      // Call completion callback
      onUploadComplete(
        response.file._id,
        response.file.original_name,
        response.file.file_size,
        response.file.file_type
      );
      
      // Close modal
      onOpenChange(false);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: unknown) {
      console.error('Error uploading file:', error);
      const err = error as { data?: { error?: string }; message?: string };
      toast.error(err?.data?.error || err?.message || 'Failed to upload file');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Transcript File</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <p className="text-lg font-medium mb-2">Drag and drop a transcript file here</p>
            <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
            <p className="text-xs text-muted-foreground">Supported: .vtt, .txt (Max 50MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".vtt,.txt"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={uploading}
            />
          </div>
          
          {uploading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading file...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
