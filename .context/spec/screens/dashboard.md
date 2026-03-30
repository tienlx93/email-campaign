---
screen: Dashboard
route: /dashboard
auth: required (redirect to /login if no valid token)
---

# Dashboard Page Spec

## Purpose

Default landing page after login. Provides an overview of campaign performance with KPI cards, date filtering, and charts visualizing campaign volume and email delivery metrics.

---

## Layout

Full-width page under AdminLayout. Content area scrollable below the fixed top bar.

---

## Date Filter Bar

Positioned at the top of the page content area, above all KPI cards.

### Components

**Preset Buttons**

Four preset date range buttons displayed as horizontal pills:

- "Last 7 days" — from 7 days ago to today
- "Last 30 days" — from 30 days ago to today (default active on page load)
- "Last 3 months" — from 90 days ago to today
- "This year" — from January 1 of the current year to today

Exactly one preset button is active at a time. Clicking a preset activates it, deactivates others, and updates the date range.

**Custom Date Range**

Two date input fields:

- "From" date input (ISO format, e.g. YYYY-MM-DD)
- "To" date input (ISO format, e.g. YYYY-MM-DD)

Selecting custom dates (entering values in both fields) deactivates all preset buttons and uses the custom range instead.

**Auto GroupBy Indicator**

Read-only label showing the computed grouping interval. Not user-selectable.

- Range 1–30 days: "Day"
- Range 31–90 days: "Week"
- Range > 90 days: "Month"

The groupBy value is computed in the frontend based on the date range and passed as a query param to the backend.

---

## KPI Cards (7 cards)

Displayed in a single horizontal row of 7 equal-width cards. All values are filtered by the selected date range.

Each card displays:

- Large value (bold, prominent font size)
- Subtext label below the value

| Card Name | Value | Subtext |
|---|---|---|
| Total | Count of all campaigns (draft + scheduled + sent) within the date range | "campaigns" |
| Draft | Count of draft campaigns within the date range | "campaigns" |
| Scheduled | Count of scheduled campaigns within the date range (status = scheduled) | "campaigns" |
| Emails Sent | Sum of recipient_count for all sent campaigns within the date range | "recipients" |
| Success Rate | FE-computed: (sentRecipients / totalRecipients) × 100, rounded to 1 decimal, displayed as percentage with % symbol | "sent / total" |
| Open Rate | FE-computed: (openedRecipients / sentRecipients) × 100, rounded to 1 decimal, displayed as percentage with % symbol | "opened / sent" |
| Failed Rate | FE-computed: (failedRecipients / totalRecipients) × 100, rounded to 1 decimal, displayed as percentage with % symbol | "failed / total" |

Percentages are computed in the frontend only. The backend returns raw integer counts.

---

## Performance Overview Section

### Section Header

- Section title: "Performance Overview" (bold, prominent)
- Subtitle: "fromDate – toDate · grouped by [Day|Week|Month]" (muted text)

Example: "Mar 1, 2026 – Mar 30, 2026 · grouped by Day"

### Chart 1 — Campaign Volume Trend

Full-width stacked bar chart (MUI x-charts BarChart).

**Data Series:**

- Scheduled (amber/yellow color) — count of scheduled campaigns per period
- Sent (green color) — count of sent campaigns per period
- Draft campaigns are excluded (no sent_at timestamp, cannot be placed on time axis)

**Axes:**

- X axis: time periods (labeled as dates or week/month ranges depending on groupBy)
- Y axis: count of campaigns

**Styling:**

- Each bar group shows a total count label above it (sum of scheduled + sent for that period)
- Tooltip on hover: series name, count for that series, and percentage of total for that period

**Empty State:**

If no scheduled or sent campaigns exist in the date range, show a message: "No campaign volume data available."

### Chart 2 — Email Delivery Performance

Full-width stacked bar chart below Chart 1 (MUI x-charts BarChart).

**Data Series:**

- Sent (blue color) — count of sentRecipients per period
- Opened (green color) — count of openedRecipients per period
- Failed (red color) — count of failedRecipients per period

**Axes:**

- X axis: time periods (labeled as dates or week/month ranges depending on groupBy)
- Y axis: count of recipients

**Data Filtering:**

Only periods with at least one sent campaign are shown. If a period has no sent campaigns, it is omitted from the chart.

**Styling:**

- Each bar group shows a total recipient count label above it (sum of sent + opened + failed for that period)
- Tooltip on hover: series name, count for that series, and percentage of total recipients for that period

**Empty State:**

If no sent campaigns exist in the date range, show a message: "No delivery data available."

---

## Backend Endpoint — GET /dashboard

Single endpoint returns KPI and chart data. Auth required.

### Query Parameters

- from (string, required) — ISO date YYYY-MM-DD (start of range, inclusive)
- to (string, required) — ISO date YYYY-MM-DD (end of range, inclusive)
- groupBy (string, required) — one of "day", "week", "month"

### Response Shape

```
{
  "kpi": {
    "totalCampaigns": integer,
    "draftCampaigns": integer,
    "scheduledCampaigns": integer,
    "sentCampaigns": integer,
    "totalRecipients": integer,
    "sentRecipients": integer,
    "openedRecipients": integer,
    "failedRecipients": integer
  },
  "volumeSeries": [
    {
      "period": string (e.g. "2026-03-01" or "Mar 1"),
      "scheduledCount": integer,
      "sentCount": integer
    },
    ...
  ],
  "deliverySeries": [
    {
      "period": string (e.g. "2026-03-01" or "Mar 1"),
      "sentRecipients": integer,
      "openedRecipients": integer,
      "failedRecipients": integer
    },
    ...
  ]
}
```

### Notes

- All values in kpi object are integers (no percentages)
- Percentages (Success Rate, Open Rate, Failed Rate) are computed in the frontend
- volumeSeries includes only periods with at least one scheduled or sent campaign (Draft campaigns are not included in time-based grouping)
- deliverySeries includes only periods with at least one sent campaign
- period field is a string formatted as appropriate for display (e.g. date, week range, or month name depending on groupBy)

---

## Data Flow

1. User lands on /dashboard or selects a date range / preset
2. Frontend computes fromDate, toDate, and groupBy based on user selection
3. Frontend calls GET /dashboard with query params
4. Backend returns KPI counts and series data
5. Frontend computes percentages and renders KPI cards and charts
6. Charts use period values from volumeSeries and deliverySeries to label X axis

---

## Notes

- Default date range on page load: Last 30 days
- Charts use MUI x-charts library for rendering
- All calculations are performed in the frontend using raw counts from backend
