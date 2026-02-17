import { baseApi } from './baseApi';

export interface ProcessingHistory {
  _id: string;
  meeting_id: string;
  status: string;
  started_at: string;
  completed_at?: string;
  error?: string;
}

export const historyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHistory: builder.query<ProcessingHistory[], void>({
      query: () => '/history',
      providesTags: ['History'],
    }),
    getHistoryByMeetingId: builder.query<ProcessingHistory, string>({
      query: (meetingId) => `/history/${meetingId}`,
      providesTags: (_result, _error, meetingId) => [
        { type: 'History', id: meetingId },
      ],
    }),
  }),
});

export const { useGetHistoryQuery, useGetHistoryByMeetingIdQuery } = historyApi;
