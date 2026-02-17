import { baseApi } from './baseApi';

export interface Meeting {
  _id: string;
  meeting_id: string;
  meeting_uuid: string;
  meeting_title?: string;
  date: Date | string;
  transcript_content?: string;
  project_name?: string;
  status: string;
  transcript_url?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const meetingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMeetings: builder.query<Meeting[], void>({
      query: () => '/meetings',
      providesTags: ['Meeting'],
    }),
    getMeetingById: builder.query<Meeting, string>({
      query: (id) => `/meetings/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Meeting', id }],
    }),
  }),
});

export const { useGetMeetingsQuery, useGetMeetingByIdQuery } = meetingsApi;
