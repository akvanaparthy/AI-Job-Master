'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Settings, ChevronLeft, Save, Loader2, Users, Crown, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UsageLimit {
  id: string;
  userType: 'FREE' | 'PLUS' | 'ADMIN';
  maxActivities: number;
  includeFollowups: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [limits, setLimits] = useState<UsageLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadLimits = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/usage-limits');
      if (response.status === 403) {
        router.push('/dashboard');
        return;
      }
      if (!response.ok) throw new Error('Failed to load usage limits');

      const data = await response.json();
      setLimits(data.limits);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load usage limits',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    loadLimits();
  }, [loadLimits]);

  const updateLimit = async (userType: string, maxActivities: number, includeFollowups: boolean) => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/usage-limits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userType, maxActivities, includeFollowups }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast({
        title: 'Success',
        description: 'Usage limit updated successfully',
      });

      loadLimits();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update usage limit',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMaxActivitiesChange = (userType: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setLimits(limits.map(limit =>
      limit.userType === userType
        ? { ...limit, maxActivities: numValue }
        : limit
    ));
  };

  const handleIncludeFollowupsChange = (userType: string, checked: boolean) => {
    setLimits(limits.map(limit =>
      limit.userType === userType
        ? { ...limit, includeFollowups: checked }
        : limit
    ));
  };

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'FREE':
        return <Users className="w-5 h-5" />;
      case 'PLUS':
        return <Crown className="w-5 h-5" />;
      case 'ADMIN':
        return <Shield className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'FREE':
        return {
          bg: 'from-slate-50 to-gray-50',
          border: 'border-slate-200',
          icon: 'bg-slate-100 text-slate-600',
        };
      case 'PLUS':
        return {
          bg: 'from-purple-50 to-pink-50',
          border: 'border-purple-200',
          icon: 'bg-purple-100 text-purple-600',
        };
      case 'ADMIN':
        return {
          bg: 'from-red-50 to-orange-50',
          border: 'border-red-200',
          icon: 'bg-red-100 text-red-600',
        };
      default:
        return {
          bg: 'from-slate-50 to-gray-50',
          border: 'border-slate-200',
          icon: 'bg-slate-100 text-slate-600',
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

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
            <Button variant="outline" size="sm" onClick={() => router.push('/admin')}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-[42px] font-bold text-slate-900 leading-tight">Usage Limits</h1>
              <p className="text-lg text-slate-500">Configure activity limits for each user type</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Usage Limits Cards */}
      <div className="space-y-6">
        {limits.map((limit, index) => {
          const colors = getUserTypeColor(limit.userType);
          return (
            <motion.div
              key={limit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`bg-gradient-to-br ${colors.bg} border ${colors.border} shadow-sm overflow-hidden`}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${colors.icon} flex items-center justify-center`}>
                        {getUserTypeIcon(limit.userType)}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">{limit.userType} Users</h3>
                        <p className="text-sm text-slate-600 mt-0.5">
                          {limit.userType === 'FREE' && 'Free tier users with basic access'}
                          {limit.userType === 'PLUS' && 'Premium users with extended access'}
                          {limit.userType === 'ADMIN' && 'Administrators with unlimited access'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Max Activities */}
                    <div className="space-y-2">
                      <Label htmlFor={`max-${limit.userType}`} className="text-sm font-medium text-slate-900">
                        Maximum Activities
                      </Label>
                      <div className="flex items-center gap-4">
                        <Input
                          id={`max-${limit.userType}`}
                          type="number"
                          min="0"
                          value={limit.maxActivities}
                          onChange={(e) => handleMaxActivitiesChange(limit.userType, e.target.value)}
                          className="w-[200px] h-11 bg-white"
                          disabled={limit.userType === 'ADMIN'}
                        />
                        <span className="text-sm text-slate-600">
                          {limit.userType === 'ADMIN'
                            ? 'Unlimited activities'
                            : `${limit.maxActivities === 0 ? 'Unlimited' : limit.maxActivities} activities allowed`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Set to 0 for unlimited activities. This counts cover letters, LinkedIn messages, and emails.
                      </p>
                    </div>

                    {/* Include Follow-ups */}
                    <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-slate-200">
                      <div className="space-y-0.5">
                        <Label htmlFor={`followup-${limit.userType}`} className="text-sm font-medium text-slate-900">
                          Include Follow-up Messages in Count
                        </Label>
                        <p className="text-xs text-slate-500">
                          When enabled, follow-up messages count towards the activity limit
                        </p>
                      </div>
                      <Switch
                        id={`followup-${limit.userType}`}
                        checked={limit.includeFollowups}
                        onCheckedChange={(checked) => handleIncludeFollowupsChange(limit.userType, checked)}
                        disabled={limit.userType === 'ADMIN'}
                      />
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 border-t border-slate-200">
                      <Button
                        onClick={() => updateLimit(limit.userType, limit.maxActivities, limit.includeFollowups)}
                        disabled={saving || limit.userType === 'ADMIN'}
                        className="bg-slate-900 hover:bg-slate-800 text-white"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <Card className="bg-blue-50 border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            About Usage Limits
          </h3>
          <ul className="text-sm text-slate-700 space-y-2">
            <li>• <strong>Activities</strong> include cover letters, LinkedIn messages, and email messages</li>
            <li>• <strong>Follow-up messages</strong> can optionally be excluded from the count</li>
            <li>• <strong>Admin users</strong> always have unlimited access</li>
            <li>• <strong>Setting to 0</strong> grants unlimited activities for that user type</li>
            <li>• Changes take effect immediately for all users of that type</li>
          </ul>
        </Card>
      </motion.div>
    </div>
  );
}
