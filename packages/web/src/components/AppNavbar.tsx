import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { clearCredentials, selectUser } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';

export function AppNavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);

  function handleLogout() {
    dispatch(clearCredentials());
    void navigate('/login');
  }

  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Left: logo */}
        <Link to="/campaigns" className="font-semibold text-lg tracking-tight shrink-0">
          Campaign Manager
        </Link>

        {/* Center: nav */}
        <nav className="hidden sm:flex items-center gap-1">
          <NavLink
            to="/campaigns"
            className={({ isActive }) =>
              `text-sm px-3 py-1.5 rounded-md transition-colors ${
                isActive
                  ? 'font-semibold text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            Campaigns
          </NavLink>
        </nav>

        {/* Right: user info + logout */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
