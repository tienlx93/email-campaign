export interface DashboardKpi {
  totalCampaigns: number;
  draftCampaigns: number;
  scheduledCampaigns: number;
  sentCampaigns: number;
  totalRecipients: number;
  sentRecipients: number;
  openedRecipients: number;
  failedRecipients: number;
}

export interface VolumePeriod {
  period: string;
  scheduledCount: number;
  sentCount: number;
}

export interface DeliveryPeriod {
  period: string;
  sentRecipients: number;
  openedRecipients: number;
  failedRecipients: number;
}

export interface DashboardResponse {
  kpi: DashboardKpi;
  volumeSeries: VolumePeriod[];
  deliverySeries: DeliveryPeriod[];
}

export interface DashboardQueryParams {
  from: string;
  to: string;
  groupBy: 'day' | 'week' | 'month';
}
