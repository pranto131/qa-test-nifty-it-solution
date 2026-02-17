import { baseApi, API_BASE_URL } from './baseApi';

export interface AnalyzeFileResponse {
  meeting_id: string;
  message?: string;
  status?: string;
}

export interface UploadedFile {
  _id: string;
  file_name: string;
  original_name: string;
  file_size: number;
  file_type: 'vtt' | 'txt';
  status: 'uploaded' | 'analyzing' | 'analyzed' | 'failed';
  uploaded_at: string | Date;
  meeting_id?: string;
}

export interface UploadFileResponse {
  message: string;
  file: UploadedFile;
}

export const recordingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Upload file (save to disk and database)
    uploadFile: builder.mutation<UploadFileResponse, File>({
      queryFn: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('authToken');
        const API_KEY = import.meta.env.VITE_API_KEY || '';

        const response = await fetch(`${API_BASE_URL}/recordings/upload`, {
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
      invalidatesTags: ['UploadedFile'],
    }),

    // Get all uploaded files
    getUploadedFiles: builder.query<UploadedFile[], void>({
      query: () => '/recordings/uploaded',
      transformResponse: (response: { files: UploadedFile[] }): UploadedFile[] => {
        return response.files || [];
      },
      providesTags: ['UploadedFile'],
    }),

    // Delete uploaded file
    deleteUploadedFile: builder.mutation<void, string>({
      query: (id) => ({
        url: `/recordings/uploaded/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['UploadedFile'],
    }),

    // Analyze uploaded file by ID
    analyzeUploadedFile: builder.mutation<AnalyzeFileResponse, string>({
      query: (id) => ({
        url: `/recordings/uploaded/${id}/analyze`,
        method: 'POST',
      }),
      invalidatesTags: ['Meeting', 'Task', 'UploadedFile'],
    }),

    // Direct file analysis (kept for backward compatibility)
    analyzeFile: builder.mutation<AnalyzeFileResponse, File>({
      queryFn: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('authToken');
        const API_KEY = import.meta.env.VITE_API_KEY || '';

        const response = await fetch(`${API_BASE_URL}/recordings/analyze-file`, {
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
      invalidatesTags: ['Meeting', 'Task'],
    }),
  }),
});

export const {
  useUploadFileMutation,
  useGetUploadedFilesQuery,
  useDeleteUploadedFileMutation,
  useAnalyzeUploadedFileMutation,
  useAnalyzeFileMutation,
} = recordingsApi;
