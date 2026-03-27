export type CampaignStatus = 'draft' | 'scheduled' | 'sent';
export type RecipientStatus = 'pending' | 'sent' | 'failed';

export interface Recipient {
  id: number;
  email: string;
  name: string;
  status: RecipientStatus;
  sent_at: string | null;
  opened_at: string | null;
}

export interface Stats {
  total: number;
  sent: number;
  failed: number;
  opened: number;
  open_rate: number;
  send_rate: number;
}

export interface Campaign {
  id: number;
  name: string;
  subject: string;
  body: string;
  status: CampaignStatus;
  scheduled_at: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  recipients: Recipient[];
  stats: Stats;
}

export interface CampaignSummary {
  id: number;
  name: string;
  subject: string;
  status: CampaignStatus;
  scheduled_at: string | null;
  created_at: string;
  recipient_count: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface ListCampaignsResponse {
  campaigns: CampaignSummary[];
  pagination: Pagination;
}

export interface CreateCampaignBody {
  name: string;
  subject: string;
  body: string;
  recipients?: Array<{ email: string; name: string }>;
}

export interface UpdateCampaignBody {
  name?: string;
  subject?: string;
  body?: string;
  /** When provided, replaces the full recipient list (email is the stable identifier). */
  recipients?: Array<{ email: string; name: string }>;
}
