import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
export const API_KEY = import.meta.env.VITE_API_KEY || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'X-API-Key': API_KEY }),
  },
});

// Add JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized) - redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
};

// ZOOM OAUTH COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
// export const zoomApi = {
//   authorize: () => `${API_BASE_URL}/auth/zoom/authorize`,
//   getStatus: () => api.get('/auth/zoom/status'),
//   disconnect: () => api.post('/auth/zoom/disconnect'),
// };

// WEBHOOK FUNCTIONALITY COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
// Webhook
// export const webhookApi = {
//   getToggle: () => api.get('/webhooks/toggle'),
//   setToggle: (enabled: boolean) => api.post('/webhooks/toggle', { enabled }),
//   getEvents: (params?: { limit?: number; since?: string }) =>
//     api.get('/webhooks/events', { params }),
// };

// Tasks
export const tasksApi = {
  getAll: () => api.get('/tasks'),
  getById: (id: string) => api.get(`/tasks/${id}`),
};

// Logs
export const logsApi = {
  getAll: (params?: {
    meeting_id?: string;
    status?: string;
    event_type?: string;
    limit?: number;
  }) => api.get('/logs', { params }),
  getByMeetingId: (meetingId: string) => api.get(`/logs/meeting/${meetingId}`),
};

// History
export const historyApi = {
  getAll: () => api.get('/history'),
  getByMeetingId: (meetingId: string) => api.get(`/history/${meetingId}`),
};

// Meetings
export const meetingsApi = {
  getAll: () => api.get('/meetings'),
  getById: (id: string) => api.get(`/meetings/${id}`),
};

// Settings
export const settingsApi = {
  getClickUpConfig: () => api.get('/settings/clickup'),
  updateClickUpConfig: (config: {
    api_token: string;
    workspace_id: string;
    list_id: string;
  }) => api.post('/settings/clickup', config),
  getClickUpLists: (apiToken: string, workspaceId: string) =>
    api.get('/settings/clickup/lists', {
      params: { api_token: apiToken, workspace_id: workspaceId },
    }),
  getProjects: () => api.get('/settings/projects'),
  deleteAllMeetings: () => api.delete('/settings/data/meetings'),
  deleteAllLogs: () => api.delete('/settings/data/logs'),
  deleteAllProcessingHistory: () =>
    api.delete('/settings/data/processing-history'),
  deleteAllTasks: () => api.delete('/settings/data/tasks'),
  // PIPELINE EVALUATION COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
  // deleteAllPipelineEvaluations: () =>
  //   api.delete('/settings/data/pipeline-evaluations'),
  clearPineconeMeetingContext: () =>
    api.delete('/settings/data/pinecone/meeting-context'),
  deleteAllData: () => api.delete('/settings/data/all'),
};

// Recordings
const recordingsApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
    ...(API_KEY && { 'X-API-Key': API_KEY }),
  },
});

export const recordingsApi = {
  getAll: (params?: {
    page?: number;
    page_size?: number;
    from?: string;
    to?: string;
    next_page_token?: string;
  }) => api.get('/recordings', { params }),
  analyze: (meetingId: string) =>
    api.post(`/recordings/${encodeURIComponent(meetingId)}/analyze`),
  analyzeFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return recordingsApiClient.post('/recordings/analyze-file', formData);
  },
};

// Projects
export const projectsApi = {
  getAll: () => api.get('/projects'),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: { name: string }) => api.post('/projects', data), // Only name required, AI generates description and keywords
  update: (
    id: string,
    data: { name?: string; description?: string; keywords?: string }
  ) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// Knowledge Base
const knowledgeBaseApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
    ...(API_KEY && { 'X-API-Key': API_KEY }),
  },
});

export const knowledgeBaseApi = {
  preview: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return knowledgeBaseApiClient.post('/knowledge-base/preview', formData);
  },
  upload: (file: File, projectName: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectName', projectName);
    return knowledgeBaseApiClient.post('/knowledge-base/upload', formData);
  },
  getAll: (params?: { project_name?: string }) =>
    api.get('/knowledge-base/documents', { params }),
  getById: (id: string) => api.get(`/knowledge-base/documents/${id}`),
  delete: (id: string) => api.delete(`/knowledge-base/documents/${id}`),
};

// PIPELINE EVALUATION COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
// Pipeline Evaluations
// export const pipelineEvaluationApi = {
//   getAll: () => api.get('/pipeline-evaluations'),
//   getByMeetingId: (meetingId: string) =>
//     api.get(`/pipeline-evaluations/${meetingId}`),
// };

// Legal Documents
export const legalApi = {
  getPrivacyPolicy: () => api.get('/legal/privacy-policy'),
  getTermsOfUse: () => api.get('/legal/terms-of-use'),
  getUserGuide: () => api.get('/legal/user-guide'),
};

export default api;