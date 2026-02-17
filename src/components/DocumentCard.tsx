import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { FileText, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import type { KnowledgeDocument } from '@/store/api/knowledgeBaseApi';
import { ConfirmDialog } from './ui/confirm-dialog';

interface DocumentCardProps {
  document: KnowledgeDocument;
  onDelete: (id: string) => void;
  onPreview?: (document: KnowledgeDocument) => void;
}

export function DocumentCard({ document, onDelete, onPreview }: DocumentCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <FileText className="h-5 w-5 mt-1 text-blue-500 flex-shrink-0" />
            <div className="flex-1 min-w-0 overflow-hidden">
              <CardTitle className="text-base break-words line-clamp-2">{document.file_name}</CardTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {document.file_type && (
                <Badge variant="secondary" className="text-xs border-border">
                  {document.file_type?.toUpperCase() || 'UNKNOWN'}
                </Badge>
                )}
                <Badge variant="project" className="text-xs">
                  {document.project_name}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Size: {document.file_size ? formatFileSize(document.file_size) : 'Unknown'}</span>
            <span>{document.uploaded_at ? formatDate(document.uploaded_at) : 'Unknown date'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {document.chunks.length} chunk{document.chunks.length !== 1 ? 's' : ''} •{' '}
              {document.pinecone_vector_ids?.length || 0} vector{(document.pinecone_vector_ids?.length || 0) !== 1 ? 's' : ''} in Pinecone
            </span>
          </div>
          <div className="flex gap-2 pt-2">
            {onPreview && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPreview(document)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2 text-blue-500" />
                Preview
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2 text-red-500" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Document"
        description={`Are you sure you want to delete "${document.file_name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() => {
          onDelete(document._id);
          setDeleteDialogOpen(false);
        }}
      />
    </Card>
  );
}

