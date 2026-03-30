import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsList, BsMoon, BsSun, BsGear, BsBoxArrowRight, BsChevronDown } from 'react-icons/bs';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSidebar, toggleTheme, selectTheme } from '@/store/uiSlice';
import { clearCredentials, selectUser } from '@/store/authSlice';
import { getInitials, getAvatarColor } from '@/helpers/avatar';

export function TopBar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const theme = useAppSelector(selectTheme);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  function handleLogout() {
    dispatch(clearCredentials());
    void navigate('/login');
  }

  const initials = user ? getInitials(user.name) : '';
  const avatarColor = user ? getAvatarColor(user.name) : '#3b82f6';

  return (
    <header className="h-12 bg-white dark:bg-slate-900 border-b border-slate-200
                       dark:border-slate-800 flex items-center px-5 gap-3.5 shrink-0">
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-lg p-1"
        aria-label="Toggle sidebar"
      >
        <BsList />
      </button>

      <span className="font-bold text-[15px] text-slate-900 dark:text-slate-100 tracking-tight">
        MarTech Campaign Manager
      </span>

      <div className="flex-1" />

      {/* Theme toggle */}
      <button
        onClick={() => dispatch(toggleTheme())}
        className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-base p-1.5"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <BsSun /> : <BsMoon />}
      </button>

      {/* Avatar dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(v => !v)}
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-slate-200
                     dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-white
                       text-[9px] font-bold shrink-0"
            style={{ backgroundColor: avatarColor }}
          >
            {initials}
          </span>
          <span className="text-slate-700 dark:text-slate-200 font-medium text-xs hidden sm:block">
            {user?.name}
          </span>
          <BsChevronDown className="text-slate-400 text-[10px]" />
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800
                            border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg
                            py-1 z-20">
              <Link
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700
                           dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <BsGear /> User Settings
              </Link>
              <hr className="my-1 border-slate-100 dark:border-slate-700" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500
                           hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <BsBoxArrowRight /> Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
