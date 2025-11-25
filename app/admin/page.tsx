'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Shield, Users, FileText, MessageSquare, Mail, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">Loading admin dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="max-w-[1400px] mx-auto p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-[42px] font-bold text-slate-900 leading-tight">Admin Dashboard</h1>
            <p className="text-lg text-slate-500">Platform overview and user management</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-white border-slate-200/60 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats.users.total}</div>
            <div className="text-sm text-slate-600">Total Users</div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex gap-4 text-xs">
              <div><span className="text-slate-500">Free:</span> <span className="font-semibold text-slate-700">{stats.users.free}</span></div>
              <div><span className="text-slate-500">Plus:</span> <span className="font-semibold text-purple-600">{stats.users.plus}</span></div>
              <div><span className="text-slate-500">Admin:</span> <span className="font-semibold text-red-600">{stats.users.admin}</span></div>
            </div>
          </Card>
        </motion.div>

        {/* Total Content */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-white border-slate-200/60 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-amber-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats.content.totalGenerated}</div>
            <div className="text-sm text-slate-600">Content Generated</div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex gap-4 text-xs">
              <div><span className="text-slate-500">Cover:</span> <span className="font-semibold text-slate-700">{stats.content.coverLetters}</span></div>
              <div><span className="text-slate-500">LinkedIn:</span> <span className="font-semibold text-blue-600">{stats.content.linkedInMessages}</span></div>
              <div><span className="text-slate-500">Email:</span> <span className="font-semibold text-purple-600">{stats.content.emailMessages}</span></div>
            </div>
          </Card>
        </motion.div>

        {/* Resumes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-white border-slate-200/60 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats.content.resumes}</div>
            <div className="text-sm text-slate-600">Resumes Uploaded</div>
          </Card>
        </motion.div>

        {/* API Keys */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-white border-slate-200/60 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats.apiKeys.openai + stats.apiKeys.anthropic + stats.apiKeys.gemini}</div>
            <div className="text-sm text-slate-600">API Keys Configured</div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex gap-4 text-xs">
              <div><span className="text-slate-500">OpenAI:</span> <span className="font-semibold text-slate-700">{stats.apiKeys.openai}</span></div>
              <div><span className="text-slate-500">Claude:</span> <span className="font-semibold text-orange-600">{stats.apiKeys.anthropic}</span></div>
              <div><span className="text-slate-500">Gemini:</span> <span className="font-semibold text-blue-600">{stats.apiKeys.gemini}</span></div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="bg-white border-slate-200/60 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/admin/users')}
              className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors text-left"
            >
              <Users className="w-5 h-5 text-blue-600 mb-2" />
              <div className="font-medium text-slate-900">Manage Users</div>
              <div className="text-sm text-slate-600">View and manage all users</div>
            </button>

            <button className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100 hover:border-purple-200 transition-colors text-left opacity-50 cursor-not-allowed">
              <MessageSquare className="w-5 h-5 text-purple-600 mb-2" />
              <div className="font-medium text-slate-900">User Activity</div>
              <div className="text-sm text-slate-600">Coming soon</div>
            </button>

            <button className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-100 hover:border-emerald-200 transition-colors text-left opacity-50 cursor-not-allowed">
              <TrendingUp className="w-5 h-5 text-emerald-600 mb-2" />
              <div className="font-medium text-slate-900">Analytics</div>
              <div className="text-sm text-slate-600">Coming soon</div>
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
