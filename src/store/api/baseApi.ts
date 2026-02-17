import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
export const API_KEY = import.meta.env.VITE_API_KEY || '';

// Base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    // Add API key if available
    if (API_KEY) {
      headers.set('X-API-Key', API_KEY);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Base query with error handling
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // Handle 401 errors - redirect to login
  if (result.error && result.error.status === 401) {
    localStorage.removeItem('authToken');
    window.location.href = '/signin';
  }
  
  return result;
};

// Create base API
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Meeting', 'Task', 'Project', 'KnowledgeDocument', 'Settings', 'Log', 'History', 'UploadedFile'],
  endpoints: () => ({}),
});
