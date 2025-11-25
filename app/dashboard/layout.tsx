'use client';

import { FileText, Mail, MessageSquare, History, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Cover Letter', href: '/dashboard/cover-letter', icon: FileText },
  { name: 'LinkedIn', href: '/dashboard/linkedin', icon: MessageSquare },
  { name: 'Email', href: '/dashboard/email', icon: Mail },
  { name: 'History', href: '/dashboard/history', icon: History },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-[280px] bg-[#f5f5f5] flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg font-bold">AJ</span>
          </div>
          <span className="text-xl font-bold text-gray-900">AI Job Master</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 overflow-y-auto">
          {/* Main Section */}
          <div className="mb-6">
            <div className="px-3 mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tools</span>
            </div>
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-normal transition-all",
                      isActive
                        ? "bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                        : "text-gray-500 hover:text-gray-900 hover:bg-white/40"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Settings Section */}
          <div>
            <div className="px-3 mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Other</span>
            </div>
            <div className="space-y-1">
              <Link
                href="/settings"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-normal transition-all",
                  pathname === '/settings'
                    ? "bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                    : "text-gray-500 hover:text-gray-900 hover:bg-white/40"
                )}
              >
                <Settings className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-300/50 mt-auto">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-gray-900 truncate">Personal</p>
            </div>
            <button className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white rounded-full border border-gray-300 hover:bg-gray-50 transition-colors">
              Upgrade
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="pl-[280px]">
        <main className="min-h-screen p-8 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
