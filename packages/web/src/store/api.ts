import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './index';
import type { AuthResponse } from '@/models/auth.type';
import type {
  Campaign,
  ListCampaignsResponse,
  CreateCampaignBody,
  UpdateCampaignBody,
} from '@/models/campaign.type';
import type { DashboardResponse, DashboardQueryParams } from '@/models/dashboard.type';

// Re-export model types so pages can import from a single store location if preferred
export type { AuthResponse } from '@/models/auth.type';
export type { User } from '@/models/auth.type';
export type {
  Campaign,
  CampaignSummary,
  CampaignStatus,
  Recipient,
  RecipientStatus,
  Stats,
  Pagination,
  ListCampaignsResponse,
  CreateCampaignBody,
  UpdateCampaignBody,
} from '@/models/campaign.type';

// ─── API ─────────────────────────────────────────────────────────────────────

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders(headers, { getState }) {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Campaign', 'Dashboard'],
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, { name: string; email: string; password: string }>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    listCampaigns: builder.query<
      ListCampaignsResponse,
      { page?: number; limit?: number; search?: string; status?: string }
    >({
      query: ({ page = 1, limit = 20, search, status } = {}) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) params.set('search', search);
        if (status && status !== 'all') params.set('status', status);
        return `/campaigns?${params.toString()}`;
      },
      providesTags: ['Campaign'],
    }),
    getCampaign: builder.query<Campaign, number>({
      query: (id) => `/campaigns/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Campaign', id }],
    }),
    createCampaign: builder.mutation<Campaign, CreateCampaignBody>({
      query: (body) => ({ url: '/campaigns', method: 'POST', body }),
      invalidatesTags: ['Campaign'],
    }),
    updateCampaign: builder.mutation<Campaign, { id: number } & UpdateCampaignBody>({
      query: ({ id, ...body }) => ({ url: `/campaigns/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_result, _err, { id }) => [{ type: 'Campaign', id }, 'Campaign'],
    }),
    deleteCampaign: builder.mutation<void, number>({
      query: (id) => ({ url: `/campaigns/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Campaign'],
    }),
    scheduleCampaign: builder.mutation<Campaign, { id: number; scheduled_at: string | null }>({
      query: ({ id, scheduled_at }) => ({
        url: `/campaigns/${id}/schedule`,
        method: 'POST',
        body: { scheduled_at },
      }),
      invalidatesTags: (_result, _err, { id }) => [{ type: 'Campaign', id }, 'Campaign'],
    }),
    sendCampaign: builder.mutation<Campaign, number>({
      query: (id) => ({ url: `/campaigns/${id}/send`, method: 'POST' }),
      invalidatesTags: (_result, _err, id) => [{ type: 'Campaign', id }, 'Campaign'],
    }),
    getDashboard: builder.query<DashboardResponse, DashboardQueryParams>({
      query: ({ from, to, groupBy }) =>
        `/dashboard?from=${from}&to=${to}&groupBy=${groupBy}`,
      providesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useListCampaignsQuery,
  useGetCampaignQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useScheduleCampaignMutation,
  useSendCampaignMutation,
  useGetDashboardQuery,
} = api;
