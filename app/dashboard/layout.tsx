'use client';

import { FileText, Mail, MessageSquare, History, Settings, LogOut, Sparkles, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Cover Letter', href: '/dashboard/cover-letter', icon: FileText, color: 'from-blue-500 to-cyan-500' },
  { name: 'LinkedIn', href: '/dashboard/linkedin', icon: MessageSquare, color: 'from-purple-500 to-pink-500' },
  { name: 'Email', href: '/dashboard/email', icon: Mail, color: 'from-orange-500 to-red-500' },
  { name: 'History', href: '/dashboard/history', icon: History, color: 'from-green-500 to-emerald-500' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-xl z-50">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 h-20 px-6 border-b border-slate-200/60">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI Job Master
              </h1>
              <p className="text-xs text-slate-500">Your AI Career Assistant</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center mr-3 transition-all duration-200",
                    isActive
                      ? "bg-white/20"
                      : `bg-gradient-to-br ${item.color} opacity-10 group-hover:opacity-20`
                  )}>
                    <Icon className={cn(
                      "w-5 h-5 transition-all duration-200",
                      isActive ? "text-white" : "text-slate-700 group-hover:text-slate-900"
                    )} />
                  </div>
                  <span className="flex-1">{item.name}</span>
                  {isActive && (
                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white"></div>
                  )}
                </Link>
              );
            })}

            <div className="pt-4">
              <Link
                href="/settings"
                className={cn(
                  "group relative flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200",
                  pathname === '/settings'
                    ? "bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-lg shadow-slate-500/30"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center mr-3 transition-all duration-200",
                  pathname === '/settings'
                    ? "bg-white/20"
                    : "bg-slate-200 group-hover:bg-slate-300"
                )}>
                  <Settings className={cn(
                    "w-5 h-5 transition-all duration-200",
                    pathname === '/settings' ? "text-white" : "text-slate-700 group-hover:text-slate-900"
                  )} />
                </div>
                <span className="flex-1">Settings</span>
              </Link>
            </div>
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-slate-200/60 space-y-2">
            {/* User Info Card */}
            <div className="px-4 py-3 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">Job Seeker</p>
                  <p className="text-xs text-slate-500 truncate">user@example.com</p>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="outline"
              className="w-full justify-start border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200"
              asChild
            >
              <a href="/api/auth/signout">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </a>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="pl-72">
        <main className="min-h-screen p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
