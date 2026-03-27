import { Navigate, Outlet } from 'react-router-dom';
import { AppNavbar } from '@/components/AppNavbar';
import { selectUser } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';

export function AuthenticatedLayout() {
  const user = useAppSelector(selectUser);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppNavbar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
