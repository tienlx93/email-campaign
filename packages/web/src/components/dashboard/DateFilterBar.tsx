import { BsCalendar3 } from 'react-icons/bs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MuiThemeWrapper } from '@/components/dashboard/MuiThemeWrapper';
import type { DatePreset, GroupBy } from '@/helpers/date-range';

interface Props {
  from: Date;
  to: Date;
  activePreset: DatePreset | null;
  groupBy: GroupBy;
  onPreset: (p: DatePreset) => void;
  onCustomRange: (from: Date, to: Date) => void;
}

const PRESETS: { key: DatePreset; label: string }[] = [
  { key: 'thisWeek',    label: 'This week' },
  { key: 'thisMonth',   label: 'This month' },
  { key: 'last3Months', label: 'Last 3 months' },
  { key: 'thisYear',    label: 'This year' },
];

export function DateFilterBar({ from, to, activePreset, groupBy, onPreset, onCustomRange }: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700
                    rounded-lg px-4 py-3 flex flex-wrap items-center gap-3 mb-5">
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
        <BsCalendar3 /> Date Range
      </span>

      {/* Preset pills */}
      <div className="flex gap-1.5">
        {PRESETS.map(p => (
          <button
            key={p.key}
            onClick={() => onPreset(p.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
              ${activePreset === p.key
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />

      {/* MUI date pickers — From / To */}
      <MuiThemeWrapper>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div className="flex items-center gap-2">
            <DatePicker
              label="From"
              value={from}
              maxDate={to}
              onChange={date => { if (date) onCustomRange(date, to); }}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: { width: 150, '& .MuiInputBase-root': { fontSize: 13 } },
                },
              }}
            />
            <span className="text-slate-400 text-sm">→</span>
            <DatePicker
              label="To"
              value={to}
              minDate={from}
              onChange={date => { if (date) onCustomRange(from, date); }}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: { width: 150, '& .MuiInputBase-root': { fontSize: 13 } },
                },
              }}
            />
          </div>
        </LocalizationProvider>
      </MuiThemeWrapper>

      {/* Auto groupBy indicator */}
      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-slate-400">Grouped by</span>
        <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                         px-2 py-0.5 rounded text-xs font-semibold text-slate-700 dark:text-slate-200 capitalize">
          {groupBy}
        </span>
      </div>
    </div>
  );
}
