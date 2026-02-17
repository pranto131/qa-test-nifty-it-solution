import { useState } from 'react';
import { KnowledgeBaseUpload } from '@/components/KnowledgeBaseUpload';
import { DocumentList } from '@/components/DocumentList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type { KnowledgeDocument } from '@/store/api/knowledgeBaseApi';

export default function KnowledgeBase() {
  const [previewDocument, setPreviewDocument] = useState<KnowledgeDocument | null>(null);

  // RTK Query handles cache invalidation automatically, no need for refreshKey
  const handleUploadComplete = () => {
    // Cache will be invalidated automatically via tags
  };

  const handleDocumentDeleted = () => {
    // Cache will be invalidated automatically via tags
  };

  const handlePreview = (document: KnowledgeDocument) => {
    setPreviewDocument(document);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Upload and manage project context documents for better AI matching
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div>
          <KnowledgeBaseUpload onUploadComplete={handleUploadComplete} />
        </div>

        {/* Info Section */}
        <Card>
          <CardHeader>
            <CardTitle>About Knowledge Base</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              The Knowledge Base stores project context documents that help the AI better understand
              and match projects from meeting transcripts.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Upload PDF or TXT files with project documentation</li>
              <li>Documents are chunked and stored in Pinecone for semantic search</li>
              <li>Each document is associated with a project</li>
              <li>AI uses these documents to improve project matching accuracy</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Uploaded Documents</h2>
        <DocumentList
          onDocumentDeleted={handleDocumentDeleted}
          onPreview={handlePreview}
        />
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewDocument} onOpenChange={() => setPreviewDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewDocument?.file_name}</DialogTitle>
            <DialogDescription>
              Project: {previewDocument?.project_name} •{' '}
              {previewDocument?.chunks.length} chunks
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm whitespace-pre-wrap">{previewDocument?.content}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

