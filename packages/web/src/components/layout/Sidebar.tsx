import { NavLink } from 'react-router-dom';
import { BsGrid, BsEnvelope, BsPerson } from 'react-icons/bs';
import { useAppSelector } from '@/store/hooks';
import { selectSidebarOpen } from '@/store/uiSlice';

export function Sidebar() {
  const open = useAppSelector(selectSidebarOpen);

  return (
    <aside
      className={`${open ? 'w-[220px]' : 'w-14'} shrink-0 bg-slate-900 flex flex-col
                  transition-[width] duration-200 overflow-hidden`}
    >
      {/* Logo row */}
      <div className="h-12 flex items-center gap-2 px-3.5 border-b border-slate-800 shrink-0">
        <div className="w-7 h-7 bg-blue-500 rounded-md flex items-center justify-center
                        text-white font-black text-sm shrink-0">M</div>
        {open && (
          <span className="text-slate-100 font-bold text-xs leading-tight">
            MarTech<br />
            <span className="text-slate-400 font-normal">Campaign Mgr</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-hidden">
        {open && (
          <p className="px-3.5 pb-1.5 text-slate-500 text-[10px] font-bold tracking-widest uppercase">
            Main Menu
          </p>
        )}
        <SidebarLink to="/dashboard" icon={<BsGrid />} label="Dashboard" open={open} />
        <SidebarLink to="/campaigns" icon={<BsEnvelope />} label="Email Campaigns" open={open} />
        {open && (
          <p className="px-3.5 pt-3 pb-1.5 text-slate-500 text-[10px] font-bold tracking-widest uppercase">
            Account
          </p>
        )}
        {!open && <div className="mt-1" />}
        <SidebarLink to="/settings" icon={<BsPerson />} label="User Settings" open={open} />
      </nav>
    </aside>
  );
}

function SidebarLink({ to, icon, label, open }: {
  to: string; icon: React.ReactNode; label: string; open: boolean;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors
         ${isActive
           ? 'bg-slate-800 border-l-2 border-blue-500 text-slate-100 font-medium'
           : 'text-slate-400 hover:text-slate-200 border-l-2 border-transparent'}`
      }
    >
      <span className="text-base shrink-0">{icon}</span>
      {open && <span className="truncate">{label}</span>}
    </NavLink>
  );
}
