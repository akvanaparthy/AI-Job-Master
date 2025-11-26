'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { Shield, Users, FileText, BarChart3, Home, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface AdminLayoutProps {
  children: ReactNode;
}

interface Stats {
  users: {
    total: number;
  };
  content: {
    totalGenerated: number;
  };
  apiKeys: {
    openai: number;
    anthropic: number;
    gemini: number;
  };
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [stats, setStats] = useState<Stats | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const supabase = createClient();

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, []);

  const loadUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      setUserEmail(user.email);
    }
  }, [supabase]);

  useEffect(() => {
    loadStats();
    loadUser();
  }, [loadStats, loadUser]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/signin');
  };

  const navItems = [
    { icon: Shield, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: SettingsIcon, label: 'Settings', path: '/admin/settings' },
    { icon: Home, label: 'User Dashboard', path: '/dashboard' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700;800&display=swap');

        * {
          font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>

      {/* Left Sidebar */}
      <div className="w-[220px] bg-white shadow-[2px_0_8px_rgba(0,0,0,0.04)] flex-shrink-0 flex flex-col">
        <div className="flex-1 p-6">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center shadow-sm">
                <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">ADMIN</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="mb-10">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Navigation</div>
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                      isActive
                        ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-md shadow-slate-800/20'
                        : 'text-slate-600 hover:bg-slate-50 group'
                    }`}
                  >
                    <Icon
                      className={`w-[18px] h-[18px] ${
                        isActive ? '' : 'text-slate-400 group-hover:text-slate-600 transition-colors'
                      }`}
                      strokeWidth={2}
                    />
                    <span className={isActive ? 'font-semibold' : 'font-medium'}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          {stats && (
            <div className="mb-10">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Overview</div>
              <div className="space-y-3 px-1">
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-blue-900">Total Users</span>
                    <Users className="w-3.5 h-3.5 text-blue-600" strokeWidth={2.5} />
                  </div>
                  <div className="text-2xl font-extrabold text-blue-900">{stats.users.total}</div>
                </div>
                <div className="p-3 rounded-lg bg-orange-50 border border-orange-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-orange-900">Content</span>
                    <FileText className="w-3.5 h-3.5 text-orange-600" strokeWidth={2.5} />
                  </div>
                  <div className="text-2xl font-extrabold text-orange-900">{stats.content.totalGenerated}</div>
                </div>
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-purple-900">API Keys</span>
                    <Shield className="w-3.5 h-3.5 text-purple-600" strokeWidth={2.5} />
                  </div>
                  <div className="text-2xl font-extrabold text-purple-900">
                    {stats.apiKeys.openai + stats.apiKeys.anthropic + stats.apiKeys.gemini}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="p-6 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-all duration-200 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex-shrink-0 shadow-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">{userEmail ? userEmail[0].toUpperCase() : 'A'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">Admin</div>
              <div className="text-[11px] text-slate-500 truncate">{userEmail || 'admin@...'}</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-all duration-200 text-xs font-semibold text-slate-700"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={2.5} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
