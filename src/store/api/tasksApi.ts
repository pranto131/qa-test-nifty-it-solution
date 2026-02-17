import { baseApi } from './baseApi';

export interface Task {
  _id: string;
  title: string;
  description: string;
  assignees: string[];
  deadline?: string | Date;
  actionable_items: string[];
  context_used: {
    transcript_snippets: string[];
    pinecone_context: string[];
  };
  clickup_task_id?: string;
  clickup_task_url?: string;
  project_name: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface MeetingWithTasks {
  meeting_id: string;
  meeting_info: {
    meeting_id: string;
    meeting_uuid?: string;
    date: string | Date | null;
    project_name: string | null;
    status: string | null;
    transcript_content: string | null;
  };
  tasks: Task[];
}

export interface TasksResponse {
  meetings: MeetingWithTasks[];
}

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<TasksResponse, void>({
      query: () => '/tasks',
      providesTags: ['Task'],
    }),
    getTaskById: builder.query<Task, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Task', id }],
    }),
  }),
});

export const { useGetTasksQuery, useGetTaskByIdQuery } = tasksApi;
