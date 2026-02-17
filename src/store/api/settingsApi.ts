import { baseApi } from './baseApi';

export interface ClickUpConfig {
  workspace_id?: string;
  configured?: boolean;
}

export interface ClickUpList {
  id: string;
  name: string;
}

export interface SettingsApi {
  getClickUpConfig: () => Promise<{ data: ClickUpConfig }>;
  updateClickUpConfig: (config: ClickUpConfig) => Promise<{ data: ClickUpConfig }>;
  getClickUpLists: (
    apiToken: string,
    workspaceId: string
  ) => Promise<{ data: ClickUpList[] }>;
}

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClickUpConfig: builder.query<ClickUpConfig, void>({
      query: () => '/settings/clickup',
      providesTags: ['Settings'],
    }),
    updateClickUpConfig: builder.mutation<ClickUpConfig, ClickUpConfig>({
      query: (config) => ({
        url: '/settings/clickup',
        method: 'POST',
        body: config,
      }),
      invalidatesTags: ['Settings'],
    }),
    getClickUpLists: builder.query<
      ClickUpList[],
      { api_token: string; workspace_id: string }
    >({
      query: (params) => ({
        url: '/settings/clickup/lists',
        params,
      }),
    }),
    getClickUpWorkspaces: builder.query<{ workspaces: Array<{ workspace_id: string; name: string }> }, void>({
      query: () => '/settings/clickup/workspaces',
      providesTags: ['Settings'],
    }),
    getClickUpSpaces: builder.query<{ spaces: Array<{ space_id: string; name: string }> }, string>({
      query: (workspaceId) => `/settings/clickup/spaces/${workspaceId}`,
      providesTags: ['Settings'],
    }),
    getClickUpFolders: builder.query<{ folders: Array<{ folder_id: string; name: string }> }, string>({
      query: (spaceId) => `/settings/clickup/folders/${spaceId}`,
      providesTags: ['Settings'],
    }),
    getClickUpListsBySpace: builder.query<
      { lists: Array<{ list_id: string; name: string; is_sprint?: boolean }> },
      { spaceId: string; folderId?: string | null }
    >({
      query: ({ spaceId, folderId }) => ({
        url: `/settings/clickup/lists/${spaceId}`,
        params: folderId !== undefined && folderId !== null ? { folderId } : {},
      }),
      providesTags: ['Settings'],
    }),
    syncClickUpHierarchy: builder.mutation<{ message: string }, { api_token: string; workspace_id: string }>({
      query: (body) => ({
        url: '/settings/clickup/sync',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Settings'],
    }),
    getClickUpHierarchy: builder.query<{ hierarchy: any }, string>({
      query: (workspaceId) => `/settings/clickup/hierarchy/${workspaceId}`,
      providesTags: ['Settings'],
    }),
    updateDestinationMode: builder.mutation<{ message: string }, { destination_selection_mode: 'ai' | 'manual' | 'hybrid' }>({
      query: (body) => ({
        url: '/settings/clickup/destination-mode',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Settings'],
    }),
    deleteAllMeetings: builder.mutation<void, void>({
      query: () => ({
        url: '/settings/data/meetings',
        method: 'DELETE',
      }),
      invalidatesTags: ['Meeting', 'Task'],
    }),
    deleteAllLogs: builder.mutation<void, void>({
      query: () => ({
        url: '/settings/data/logs',
        method: 'DELETE',
      }),
      invalidatesTags: ['Log'],
    }),
    deleteAllProcessingHistory: builder.mutation<void, void>({
      query: () => ({
        url: '/settings/data/processing-history',
        method: 'DELETE',
      }),
      invalidatesTags: ['History'],
    }),
    deleteAllTasks: builder.mutation<void, void>({
      query: () => ({
        url: '/settings/data/tasks',
        method: 'DELETE',
      }),
      invalidatesTags: ['Task'],
    }),
    clearPineconeMeetingContext: builder.mutation<void, void>({
      query: () => ({
        url: '/settings/data/pinecone/meeting-context',
        method: 'DELETE',
      }),
      invalidatesTags: ['Meeting', 'Task'],
    }),
    deleteAllData: builder.mutation<void, void>({
      query: () => ({
        url: '/settings/data/all',
        method: 'DELETE',
      }),
      invalidatesTags: ['Meeting', 'Task', 'Project', 'KnowledgeDocument', 'Log', 'History'],
    }),
  }),
});

export const {
  useGetClickUpConfigQuery,
  useUpdateClickUpConfigMutation,
  useGetClickUpListsQuery,
  useGetClickUpWorkspacesQuery,
  useGetClickUpSpacesQuery,
  useGetClickUpFoldersQuery,
  useGetClickUpListsBySpaceQuery,
  useSyncClickUpHierarchyMutation,
  useGetClickUpHierarchyQuery,
  useUpdateDestinationModeMutation,
  useDeleteAllMeetingsMutation,
  useDeleteAllLogsMutation,
  useDeleteAllProcessingHistoryMutation,
  useDeleteAllTasksMutation,
  useClearPineconeMeetingContextMutation,
  useDeleteAllDataMutation,
} = settingsApi;
