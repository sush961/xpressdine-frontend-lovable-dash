
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children?: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <Sidebar className="flex-shrink-0 h-screen sticky top-0" />
      <div className="flex-1">
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 h-16">
            <div>
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-accent transition-colors">
                <span className="sr-only">Settings</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-600"
                >
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <div className="w-10 h-10 rounded-full bg-brand-orange text-white flex items-center justify-center font-medium">
                XD
              </div>
            </div>
          </div>
        </header>
        <main className="p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
