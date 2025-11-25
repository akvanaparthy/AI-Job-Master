'use client';

import { FileText, Mail, MessageSquare, History, Settings, LogOut, User } from 'lucide-react';
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
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-[200px] bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2.5 h-14 px-4 border-b border-gray-200">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">AJ</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">AI Job Master</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="w-[17px] h-[17px]" strokeWidth={2} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <div className="pt-2 mt-2">
              <Link
                href="/settings"
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium rounded-lg transition-colors",
                  pathname === '/settings'
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Settings className="w-[17px] h-[17px]" strokeWidth={2} />
                <span>Settings</span>
              </Link>
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-2.5 border-t border-gray-200">
            <div className="flex items-center gap-2.5 px-2.5 py-2 bg-gray-50 rounded-lg mb-1.5">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-white" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">John Doe</p>
                <p className="text-[11px] text-gray-500 truncate">john@example.com</p>
              </div>
            </div>
            <button className="flex items-center gap-2 w-full px-2.5 py-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              <LogOut className="w-[15px] h-[15px]" strokeWidth={2} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="pl-[200px]">
        <main className="min-h-screen p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
