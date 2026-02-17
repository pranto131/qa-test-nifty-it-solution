import { useState } from 'react';
import { DocumentCard } from './DocumentCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { useGetDocumentsQuery, useDeleteDocumentMutation, type KnowledgeDocument } from '@/store/api/knowledgeBaseApi';
import { useGetProjectsQuery } from '@/store/api/projectsApi';
import { Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Project {
  _id: string;
  name: string;
  description?: string;
  keywords?: string[];
}

interface DocumentListProps {
  onDocumentDeleted: () => void;
  onPreview?: (document: KnowledgeDocument) => void;
}

export function DocumentList({ onDocumentDeleted, onPreview }: DocumentListProps) {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // RTK Query hooks
  const { data: projectsData } = useGetProjectsQuery();
  // Ensure projects is always an array
  const projects: Project[] = Array.isArray(projectsData) ? projectsData : [];
  
  const { data: documents, isLoading: loading } = useGetDocumentsQuery(
    selectedProject !== 'all' ? { project_name: selectedProject } : undefined
  );
  
  const [deleteDocument] = useDeleteDocumentMutation();

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id).unwrap();
      toast.success('Document deleted successfully');
      onDocumentDeleted();
    } catch (error: unknown) {
      const err = error as { data?: { error?: string }; message?: string };
      console.error('Error deleting document:', error);
      toast.error(err?.data?.error || err?.message || 'Failed to delete document');
    }
  };

  // Ensure documents is always an array
  const documentsArray = Array.isArray(documents) ? documents : [];

  const filteredDocuments = documentsArray.filter((doc) => {
    if (searchQuery) {
      return (
        doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.project_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project._id} value={project.name}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Document Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium">No documents found</p>
          <p className="text-sm mt-2">
            {searchQuery || selectedProject !== 'all'
              ? 'Try adjusting your filters'
              : 'Upload your first document to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document._id}
              document={document}
              onDelete={handleDelete}
              onPreview={onPreview}
            />
          ))}
        </div>
      )}
    </div>
  );
}

