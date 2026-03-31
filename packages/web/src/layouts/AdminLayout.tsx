import { Navigate, Outlet } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { MuiThemeWrapper } from '@/components/dashboard/MuiThemeWrapper';
import { selectUser } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';

export function AdminLayout() {
  const user = useAppSelector(selectUser);
  if (!user) return <Navigate to="/login" replace />;

  return (
    <MuiThemeWrapper>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-y-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </LocalizationProvider>
    </MuiThemeWrapper>
  );
}
