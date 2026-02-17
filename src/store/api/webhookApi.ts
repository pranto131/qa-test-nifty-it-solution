// WEBHOOK FUNCTIONALITY COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
// import { baseApi } from './baseApi';

// export interface WebhookToggle {
//   enabled: boolean;
// }

// export interface WebhookEvent {
//   _id: string;
//   event_type: string;
//   payload: Record<string, unknown>;
//   processed: boolean;
//   createdAt: string;
// }

// export const webhookApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     getWebhookToggle: builder.query<WebhookToggle, void>({
//       query: () => '/webhooks/toggle',
//       providesTags: ['Settings'],
//     }),
//     setWebhookToggle: builder.mutation<WebhookToggle, boolean>({
//       query: (enabled) => ({
//         url: '/webhooks/toggle',
//         method: 'POST',
//         body: { enabled },
//       }),
//       invalidatesTags: ['Settings'],
//     }),
//     getWebhookEvents: builder.query<
//       WebhookEvent[],
//       { limit?: number; since?: string } | void
//     >({
//       query: (params) => ({
//         url: '/webhooks/events',
//         params: params || {},
//       }),
//     }),
//   }),
// });

// export const {
//   useGetWebhookToggleQuery,
//   useSetWebhookToggleMutation,
//   useGetWebhookEventsQuery,
// } = webhookApi;
