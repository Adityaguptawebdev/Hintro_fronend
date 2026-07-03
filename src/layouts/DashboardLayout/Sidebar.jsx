import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Bell, CheckSquare, LayoutDashboard, LogOut, Settings,
  Sparkles, Video, X,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/utils/cn';
import api from '@/api/interceptors';
import { ENDPOINTS } from '@/api/endpoints';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/meetings', label: 'Meetings', icon: Video },
  { path: '/action-items', label: 'Action Items', icon: CheckSquare },
  { path: '/reminders', label: 'Reminders', icon: Bell },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  const handleLogout = async () => {
    try {
      await api.post(ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // swallow — token may already be invalid
    }
    logout();
    toast.success('Logged out successfully');
    navigate('/', { replace: true });
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'shrink-0 shadow-[4px_0_24px_-8px_oklch(0.646_0.222_41.116/0.4)] bg-zinc-900 border-r border-orange-500/30 flex p-6 flex-col w-60 h-screen fixed lg:sticky top-0 left-0 overflow-hidden z-40 transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex mb-8 px-1 items-center justify-between">
          <span className="font-bold text-xl tracking-tight text-neutral-50">Hintro</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden size-8 flex items-center justify-center rounded-lg text-[#9f9fa9] hover:text-neutral-50 hover:bg-zinc-800 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col flex-1 gap-1">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'rounded-lg flex px-3 py-2.5 items-center gap-3 w-full text-sm transition-colors',
                  isActive
                    ? 'bg-gradient-to-r from-amber-400/80 to-orange-600/80 shadow-[0_0_12px_oklch(0.646_0.222_41.116/0.3)] hover:shadow-[0_0_16px_oklch(0.646_0.222_41.116/0.4)] font-medium text-white'
                    : 'text-[#9f9fa9]'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('size-4', isActive ? '' : 'text-primary/70')} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

      {/* User profile + logout */}
      <div className="mt-4 relative">
        <button
          onClick={() => setShowMenu((v) => !v)}
          className="w-full rounded-xl bg-zinc-800/60 border border-white/10 flex p-2 items-center gap-3 hover:bg-zinc-800 transition-colors"
        >
          <div className="relative shrink-0">
            <div className="size-9 rounded-full bg-primary/30 flex items-center justify-center font-semibold text-sm text-primary">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <span className="size-2.5 bg-emerald-400 ring-2 ring-zinc-900 rounded-full absolute right-0 bottom-0" />
          </div>
          <div className="min-w-0 flex flex-col text-left flex-1">
            <span className="truncate font-medium text-sm text-neutral-50">{user?.name ?? 'User'}</span>
            <span className="text-[#9f9fa9] text-xs truncate">{user?.email ?? 'Online'}</span>
          </div>
          {/* Chevron indicator */}
          <span className="text-[#9f9fa9] text-xs">⋯</span>
        </button>

        {/* Dropdown menu */}
        {showMenu && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />

            <div className="absolute bottom-full left-0 right-0 mb-2 z-20 rounded-xl bg-zinc-800 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
              {/* User info header */}
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <p className="text-sm font-semibold text-neutral-50">{user?.name}</p>
                <p className="text-xs text-[#9f9fa9] truncate">{user?.email}</p>
              </div>

              {/* Menu items */}
              <div className="p-1">
                <button
                  onClick={() => { setShowMenu(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#9f9fa9] hover:bg-zinc-700 hover:text-neutral-50 transition-colors"
                >
                  <Settings className="size-4" />
                  Settings
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <LogOut className="size-4" />
                  Log out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      </aside>
    </>
  );
}
