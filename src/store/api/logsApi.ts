import { baseApi } from './baseApi';

export interface Log {
  _id: string;
  event_type: string;
  status: string;
  message: string;
  metadata?: Record<string, unknown>;
  meeting_id?: string;
  createdAt: string;
}

export const logsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLogs: builder.query<
      Log[],
      {
        meeting_id?: string;
        status?: string;
        event_type?: string;
        limit?: number;
      } | void
    >({
      query: (params) => ({
        url: '/logs',
        params: params || {},
      }),
      providesTags: ['Log'],
    }),
    getLogsByMeetingId: builder.query<Log[], string>({
      query: (meetingId) => `/logs/meeting/${meetingId}`,
      providesTags: (_result, _error, meetingId) => [{ type: 'Log', id: meetingId }],
    }),
  }),
});

export const { useGetLogsQuery, useGetLogsByMeetingIdQuery } = logsApi;
