'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Users, FileText, MessageSquare, TrendingUp, BarChart3, Search, Bell, MoreHorizontal, Home, Briefcase, UserCircle, Settings as SettingsIcon, Plus, ChevronRight, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Stats {
  users: {
    total: number;
    free: number;
    plus: number;
    admin: number;
  };
  content: {
    resumes: number;
    coverLetters: number;
    linkedInMessages: number;
    emailMessages: number;
    totalGenerated: number;
  };
  apiKeys: {
    openai: number;
    anthropic: number;
    gemini: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState<string>('');
  const supabase = createClient();

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.status === 403) {
        router.push('/dashboard');
        return;
      }
      if (!response.ok) throw new Error('Failed to load stats');
      const data = await response.json();
      setStats(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAFA]">
        <div className="text-slate-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAFA]">
        <div className="text-red-600 text-sm">Error: {error}</div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700;800&display=swap');

        * {
          font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .stat-card {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .stat-card:nth-child(1) { animation-delay: 0.1s; opacity: 0; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; opacity: 0; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; opacity: 0; }
        .stat-card:nth-child(4) { animation-delay: 0.4s; opacity: 0; }

        .nav-item {
          animation: slideIn 0.4s ease-out forwards;
        }

        .nav-item:nth-child(1) { animation-delay: 0.1s; opacity: 0; }
        .nav-item:nth-child(2) { animation-delay: 0.15s; opacity: 0; }
        .nav-item:nth-child(3) { animation-delay: 0.2s; opacity: 0; }
        .nav-item:nth-child(4) { animation-delay: 0.25s; opacity: 0; }
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
              <span className="text-lg font-bold text-slate-900 tracking-tight">ROUNDS</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="mb-10">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Navigation</div>
            <div className="space-y-1">
              <button
                onClick={() => router.push('/admin')}
                className="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-md shadow-slate-800/20"
              >
                <Shield className="w-[18px] h-[18px]" strokeWidth={2} />
                <span className="font-semibold">Admin</span>
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-all duration-200 text-sm text-slate-600 group"
              >
                <Home className="w-[18px] h-[18px] text-slate-400 group-hover:text-slate-600 transition-colors" strokeWidth={2} />
                <span className="font-medium">Dashboard</span>
              </button>
              <button
                onClick={() => router.push('/admin/users')}
                className="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-all duration-200 text-sm text-slate-600 group"
              >
                <Users className="w-[18px] h-[18px] text-slate-400 group-hover:text-slate-600 transition-colors" strokeWidth={2} />
                <span className="font-medium">Users</span>
              </button>
              <button
                onClick={() => router.push('/admin/analytics')}
                className="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-all duration-200 text-sm text-slate-600 group"
              >
                <BarChart3 className="w-[18px] h-[18px] text-slate-400 group-hover:text-slate-600 transition-colors" strokeWidth={2} />
                <span className="font-medium">Analytics</span>
              </button>
              <button
                onClick={() => router.push('/admin/settings')}
                className="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-all duration-200 text-sm text-slate-600 group"
              >
                <SettingsIcon className="w-[18px] h-[18px] text-slate-400 group-hover:text-slate-600 transition-colors" strokeWidth={2} />
                <span className="font-medium">Settings</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <div className="h-16 bg-white border-b border-slate-200/60 flex items-center px-8 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-2.5 w-[280px] border border-slate-200/60">
              <Search className="w-[17px] h-[17px] text-slate-400" strokeWidth={2} />
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent border-none outline-none text-[13px] text-slate-900 placeholder-slate-400 w-full font-medium"
              />
            </div>

            <button
              onClick={() => router.push('/admin/users')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-200/60"
            >
              <UserCircle className="w-[17px] h-[17px] text-slate-500" strokeWidth={2} />
              <span className="text-[13px] font-semibold text-slate-700">Manage Users</span>
            </button>

            <button
              onClick={() => router.push('/admin/analytics')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-200/60"
            >
              <BarChart3 className="w-[17px] h-[17px] text-slate-500" strokeWidth={2} />
              <span className="text-[13px] font-semibold text-slate-700">Analytics</span>
            </button>

            <button
              onClick={() => router.push('/admin/settings')}
              className="p-2.5 rounded-lg hover:bg-slate-50 transition-all duration-200"
            >
              <SettingsIcon className="w-5 h-5 text-slate-500" strokeWidth={2} />
            </button>
          </div>

          <div className="flex items-center gap-5">
            <span className="text-[13px] font-medium text-slate-500">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-[13px] font-bold flex items-center gap-2 hover:bg-slate-800 transition-all duration-200 shadow-md shadow-slate-900/20 active:scale-[0.98]"
            >
              Go to Dashboard
              <span className="text-base">→</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-[#FAFAFA]">
          <div className="p-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Admin Dashboard</h1>
              <p className="text-[15px] text-slate-500">Monitor platform statistics and manage your application</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Users Card */}
              <div className="stat-card bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-slate-300/60 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" strokeWidth={3} />
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Active</span>
                  </div>
                </div>
                <div className="text-4xl font-extrabold text-slate-900 leading-none mb-2">{stats.users.total}</div>
                <div className="text-[13px] font-bold text-slate-500 mb-4 uppercase tracking-wide">Total Users</div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <div className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-wider">Free</div>
                    <div className="text-base font-extrabold text-slate-900">{stats.users.free}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-wider">Plus</div>
                    <div className="text-base font-extrabold text-blue-600">{stats.users.plus}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-wider">Admin</div>
                    <div className="text-base font-extrabold text-rose-600">{stats.users.admin}</div>
                  </div>
                </div>
              </div>

              {/* Content Generated Card */}
              <div className="stat-card bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-slate-300/60 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" strokeWidth={3} />
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Growth</span>
                  </div>
                </div>
                <div className="text-4xl font-extrabold text-slate-900 leading-none mb-2">{stats.content.totalGenerated}</div>
                <div className="text-[13px] font-bold text-slate-500 mb-4 uppercase tracking-wide">Content Generated</div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <div className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-wider">Cover</div>
                    <div className="text-base font-extrabold text-slate-900">{stats.content.coverLetters}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-wider">LinkedIn</div>
                    <div className="text-base font-extrabold text-blue-600">{stats.content.linkedInMessages}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-wider">Email</div>
                    <div className="text-base font-extrabold text-violet-600">{stats.content.emailMessages}</div>
                  </div>
                </div>
              </div>

              {/* Resumes Card */}
              <div className="stat-card bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-slate-300/60 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="text-4xl font-extrabold text-slate-900 leading-none mb-2">{stats.content.resumes}</div>
                <div className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Resumes Uploaded</div>
              </div>

              {/* API Keys Card */}
              <div className="stat-card bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-slate-300/60 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="text-4xl font-extrabold text-slate-900 leading-none mb-2">
                  {stats.apiKeys.openai + stats.apiKeys.anthropic + stats.apiKeys.gemini}
                </div>
                <div className="text-[13px] font-bold text-slate-500 mb-4 uppercase tracking-wide">API Keys Configured</div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <div className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-wider">OpenAI</div>
                    <div className="text-base font-extrabold text-slate-900">{stats.apiKeys.openai}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-wider">Claude</div>
                    <div className="text-base font-extrabold text-orange-600">{stats.apiKeys.anthropic}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-wider">Gemini</div>
                    <div className="text-base font-extrabold text-blue-600">{stats.apiKeys.gemini}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-5 uppercase tracking-wide">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Manage Users */}
                <button
                  onClick={() => router.push('/admin/users')}
                  className="group bg-white rounded-2xl p-6 border border-slate-200/60 hover:border-blue-300/60 hover:shadow-xl transition-all duration-300 text-left"
                >
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="font-bold text-base text-slate-900 mb-1.5">Manage Users</div>
                  <div className="text-[13px] text-slate-500 font-medium">View and manage all users</div>
                </button>

                {/* Usage Limits */}
                <button
                  onClick={() => router.push('/admin/settings')}
                  className="group bg-white rounded-2xl p-6 border border-slate-200/60 hover:border-purple-300/60 hover:shadow-xl transition-all duration-300 text-left"
                >
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform duration-300">
                      <MessageSquare className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="font-bold text-base text-slate-900 mb-1.5">Usage Limits</div>
                  <div className="text-[13px] text-slate-500 font-medium">Configure limits</div>
                </button>

                {/* Analytics */}
                <button
                  onClick={() => router.push('/admin/analytics')}
                  className="group bg-white rounded-2xl p-6 border border-slate-200/60 hover:border-emerald-300/60 hover:shadow-xl transition-all duration-300 text-left"
                >
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                      <BarChart3 className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="font-bold text-base text-slate-900 mb-1.5">Analytics</div>
                  <div className="text-[13px] text-slate-500 font-medium">View insights</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
