'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Settings, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminAccess = useCallback(async () => {
    try {
      // Try to access admin API to verify admin status
      const response = await fetch('/api/admin/users?page=1&limit=1');

      if (response.status === 403) {
        // Not an admin, redirect to dashboard
        router.push('/dashboard');
        return;
      }

      if (response.ok) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Admin check error:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-[42px] font-bold text-slate-900 mb-2 leading-tight">
          Admin Dashboard
        </h1>
        <p className="text-lg text-slate-500">
          Manage users, usage limits, and system settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Users Management */}
        <Link href="/admin/users">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-slate-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Users</h3>
                <p className="text-sm text-slate-600">Manage all users</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              View and manage user accounts, change user types, and set admin privileges.
            </p>
          </Card>
        </Link>

        {/* Usage Limits */}
        <Link href="/dashboard/admin/settings">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-slate-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Settings</h3>
                <p className="text-sm text-slate-600">Usage limits</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Configure max activities for each user type and manage system-wide settings.
            </p>
          </Card>
        </Link>

        {/* Analytics */}
        <Link href="/dashboard/admin/analytics">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-slate-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Analytics</h3>
                <p className="text-sm text-slate-600">Platform insights</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              View system-wide analytics, usage trends, and performance metrics.
            </p>
          </Card>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="mt-8">
        <Card className="p-6 border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="flex gap-4">
            <Link href="/admin/users">
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                View All Users
              </Button>
            </Link>
            <Link href="/dashboard/admin/settings">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configure Limits
              </Button>
            </Link>
            <Link href="/dashboard/admin/analytics">
              <Button variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Documentation */}
      <div className="mt-8">
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">📚 Documentation</h3>
          <p className="text-sm text-slate-700 mb-4">
            Need help? Check out the admin documentation for detailed guides on managing users and settings.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/docs/ADMIN_SETUP.md', '_blank')}
            >
              Admin Setup Guide
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/docs/USAGE_LIMITS_SYSTEM.md', '_blank')}
            >
              Usage Limits System
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
