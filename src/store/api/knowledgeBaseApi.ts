import { baseApi, API_BASE_URL } from './baseApi';

export interface PreviewResponse {
  preview: string;
  estimatedChunks: number;
  size: number;
}

export interface KnowledgeDocument {
  _id: string;
  file_name: string;
  project_name: string;
  file_type?: 'pdf' | 'txt';
  file_size?: number;
  content: string;
  chunks: Array<{
    chunk_id?: string;
    text: string;
    page_number?: number;
    metadata?: Record<string, unknown>;
  }>;
  pinecone_vector_ids?: string[];
  uploaded_at?: string | Date;
  createdAt?: string;
  updatedAt?: string;
}

export interface KnowledgeDocumentsResponse {
  documents: KnowledgeDocument[];
}

export const knowledgeBaseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    previewDocument: builder.mutation<PreviewResponse, File>({
      queryFn: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('authToken');
        const API_KEY = import.meta.env.VITE_API_KEY || '';

        const response = await fetch(`${API_BASE_URL}/knowledge-base/preview`, {
          method: 'POST',
          body: formData,
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
            ...(API_KEY && { 'X-API-Key': API_KEY }),
          },
        });

        if (!response.ok) {
          const error = await response.json();
          return { error: { status: response.status, data: error } };
        }

        const data = await response.json();
        return { data };
      },
    }),
    uploadDocument: builder.mutation<
      { message: string; document: KnowledgeDocument },
      { file: File; projectName: string }
    >({
      queryFn: async ({ file, projectName }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectName', projectName);
        const token = localStorage.getItem('authToken');
        const API_KEY = import.meta.env.VITE_API_KEY || '';

        const response = await fetch(`${API_BASE_URL}/knowledge-base/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
            ...(API_KEY && { 'X-API-Key': API_KEY }),
          },
        });

        if (!response.ok) {
          const error = await response.json();
          return { error: { status: response.status, data: error } };
        }

        const data = await response.json();
        return { data };
      },
      invalidatesTags: ['KnowledgeDocument'],
    }),
    getDocuments: builder.query<KnowledgeDocument[], { project_name?: string } | void>({
      query: (params) => ({
        url: '/knowledge-base/documents',
        params: params || {},
      }),
      transformResponse: (response: { documents: KnowledgeDocument[] }): KnowledgeDocument[] => {
        return response.documents || [];
      },
      providesTags: ['KnowledgeDocument'],
    }),
    getDocumentById: builder.query<KnowledgeDocument, string>({
      query: (id) => `/knowledge-base/documents/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'KnowledgeDocument', id }],
    }),
    deleteDocument: builder.mutation<void, string>({
      query: (id) => ({
        url: `/knowledge-base/documents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['KnowledgeDocument'],
    }),
  }),
});

export const {
  usePreviewDocumentMutation,
  useUploadDocumentMutation,
  useGetDocumentsQuery,
  useGetDocumentByIdQuery,
  useDeleteDocumentMutation,
} = knowledgeBaseApi;
