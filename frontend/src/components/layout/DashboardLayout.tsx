import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white border-b border-surface-200 flex items-center justify-between px-4 sm:px-6 h-14 flex-shrink-0">
          <button
            className="lg:hidden p-2 rounded-lg text-surface-600 hover:bg-surface-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 lg:flex-none" />

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-surface-600 hover:bg-surface-100">
              <Bell className="w-4 h-4" />
            </button>
            {user && (
              <div className="flex items-center gap-2">
                <Avatar name={user.name} size="sm" />
                <span className="hidden sm:block text-sm font-medium text-surface-800">
                  {user.name.split(' ')[0]}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
