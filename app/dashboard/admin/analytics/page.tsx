'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  ChevronLeft,
  Loader2,
  TrendingUp,
  Users,
  FileText,
  BarChart3,
  Activity,
  Calendar,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsData {
  userGrowth: {
    total: number;
    last30Days: number;
    last7Days: number;
    today: number;
  };
  contentGeneration: {
    total: {
      coverLetters: number;
      linkedInMessages: number;
      emailMessages: number;
      all: number;
    };
    last30Days: {
      coverLetters: number;
      linkedInMessages: number;
      emailMessages: number;
      all: number;
    };
  };
  dailyStats: Array<{ date: string; count: number }>;
  userTypeDistribution: Array<{ userType: string; count: number }>;
  mostActiveUsers: Array<{
    id: string;
    email: string;
    userType: string;
    totalContent: number;
  }>;
  apiKeyAdoption: {
    openai: number;
    anthropic: number;
    gemini: number;
  };
  statusDistribution: {
    email: Array<{ status: string; count: number }>;
    linkedIn: Array<{ status: string; count: number }>;
  };
}

const COLORS = {
  FREE: '#64748b',
  PLUS: '#a855f7',
  ADMIN: '#ef4444',
  primary: '#0ea5e9',
  secondary: '#8b5cf6',
  accent: '#10b981',
};

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/analytics');
      if (response.status === 403) {
        router.push('/dashboard');
        return;
      }
      if (!response.ok) throw new Error('Failed to load analytics');

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!data) return null;

  const contentByType = [
    { name: 'Cover Letters', value: data.contentGeneration.total.coverLetters, color: '#f59e0b' },
    { name: 'LinkedIn', value: data.contentGeneration.total.linkedInMessages, color: '#3b82f6' },
    { name: 'Email', value: data.contentGeneration.total.emailMessages, color: '#8b5cf6' },
  ];

  const apiAdoption = [
    { name: 'OpenAI', value: data.apiKeyAdoption.openai },
    { name: 'Claude', value: data.apiKeyAdoption.anthropic },
    { name: 'Gemini', value: data.apiKeyAdoption.gemini },
  ];

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/admin')}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-[42px] font-bold text-slate-900 leading-tight">Analytics</h1>
              <p className="text-lg text-slate-500">Platform insights and trends</p>
            </div>
          </div>
          <Button onClick={loadAnalytics} variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-white border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{data.userGrowth.total}</div>
            <div className="text-sm text-slate-600 mb-3">Total Users</div>
            <div className="text-xs text-green-600 font-medium">
              +{data.userGrowth.last30Days} this month
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-white border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {data.contentGeneration.total.all}
            </div>
            <div className="text-sm text-slate-600 mb-3">Total Content</div>
            <div className="text-xs text-green-600 font-medium">
              +{data.contentGeneration.last30Days.all} this month
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-white border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {data.userGrowth.last7Days}
            </div>
            <div className="text-sm text-slate-600 mb-3">New Users (7d)</div>
            <div className="text-xs text-green-600 font-medium">
              +{data.userGrowth.today} today
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-white border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {Math.round((data.contentGeneration.total.all / data.userGrowth.total) * 10) / 10}
            </div>
            <div className="text-sm text-slate-600 mb-3">Avg Content/User</div>
            <div className="text-xs text-slate-500">Platform average</div>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Activity Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-white border-slate-200/60 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Daily Activity (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Content Type Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="bg-white border-slate-200/60 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Content by Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contentByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contentByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Type Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="bg-white border-slate-200/60 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Users by Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.userTypeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="userType" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {data.userTypeDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.userType as keyof typeof COLORS] || '#64748b'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* API Key Adoption */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="bg-white border-slate-200/60 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">API Key Adoption</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={apiAdoption}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Most Active Users */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
        <Card className="bg-white border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Most Active Users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase">Total Content</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.mostActiveUsers.slice(0, 10).map((user, index) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          user.userType === 'ADMIN'
                            ? 'bg-red-100 text-red-700'
                            : user.userType === 'PLUS'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {user.userType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 text-right font-semibold">
                      {user.totalContent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
