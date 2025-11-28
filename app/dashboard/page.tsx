'use client';

import { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, MessageSquare, Mail, ArrowRight, TrendingUp, Clock, ArrowUpRight, Reply, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useToast } from '@/hooks/use-toast';

// Animated number component
function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (current) => Math.round(current));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    spring.set(value);
    const unsubscribe = display.on('change', (latest) => {
      setDisplayValue(latest);
    });
    return unsubscribe;
  }, [value, spring, display]);

  return <>{displayValue}</>;
}

const QUICK_ACTIONS = [
  {
    title: 'Cover Letters',
    description: 'Tailored applications',
    href: '/dashboard/cover-letter',
    icon: FileText,
    bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50/80',
    iconBg: 'bg-amber-500',
    textColor: 'text-amber-900',
  },
  {
    title: 'LinkedIn',
    description: 'Network outreach',
    href: '/dashboard/linkedin',
    icon: MessageSquare,
    bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50/80',
    iconBg: 'bg-blue-500',
    textColor: 'text-blue-900',
  },
  {
    title: 'Emails',
    description: 'Professional messages',
    href: '/dashboard/email',
    icon: Mail,
    bgColor: 'bg-gradient-to-br from-slate-50 to-gray-100/80',
    iconBg: 'bg-slate-500',
    textColor: 'text-slate-900',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Use custom hook for dashboard stats with caching
  const { data: stats, isLoading: loading, error, refreshStats } = useDashboardStats();

  // Force refresh on mount to get latest data
  useEffect(() => {
    refreshStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalGenerated = (stats?.totalCoverLetters || 0) + (stats?.totalLinkedInMessages || 0) + (stats?.totalEmails || 0);

  // Handle follow-up button click
  const handleFollowup = (activity: any) => {
    const params = new URLSearchParams({
      followup: 'true',
      id: activity.id,
      positionTitle: activity.position,
      companyName: activity.company,
    });

    // Add specific data based on type
    if (activity.data) {
      Object.keys(activity.data).forEach(key => {
        if (activity.data[key]) {
          params.set(key, activity.data[key]);
        }
      });
    }

    const route = activity.type === 'LinkedIn'
      ? '/dashboard/linkedin'
      : '/dashboard/email';

    router.push(`${route}?${params.toString()}`);
  };

  // Handle delete button click
  const handleDelete = async (activity: any) => {
    if (!confirm(`Are you sure you want to delete this ${activity.type}?`)) {
      return;
    }

    try {
      const endpoint = activity.type === 'Cover Letter'
        ? `/api/cover-letters/${activity.id}`
        : activity.type === 'LinkedIn'
        ? `/api/linkedin-messages/${activity.id}`
        : `/api/email-messages/${activity.id}`;

      const response = await fetch(endpoint, { method: 'DELETE' });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `${activity.type} deleted successfully`,
        });
        refreshStats(); // Refresh dashboard stats
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-[42px] font-bold text-slate-900 dark:text-gray-100 mb-2 leading-tight">
          Hello there,
        </h1>
        <p className="text-lg text-slate-500 dark:text-gray-400">
          Accelerate your job search with AI-powered content generation.
        </p>
      </motion.div>

      {/* Stats & Content Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6 mb-6 md:mb-8">
        {/* Quick Action Cards */}
        {QUICK_ACTIONS.map((action, index) => {
          const Icon = action.icon;
          let count = 0;
          if (action.title === 'Cover Letters') count = stats?.totalCoverLetters || 0;
          else if (action.title === 'LinkedIn') count = stats?.totalLinkedInMessages || 0;
          else if (action.title === 'Emails') count = stats?.totalEmails || 0;

          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Link href={action.href} className="block h-full">
                <Card className={`relative overflow-hidden border border-slate-200/60 dark:border-gray-700 hover:border-slate-300 dark:hover:border-gray-600 shadow-sm hover:shadow-md dark:shadow-lg transition-all duration-300 cursor-pointer group h-full ${action.bgColor} dark:bg-gray-800`}>
                  <div className="p-4 sm:p-5 md:p-6 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4 md:mb-5 lg:mb-6">
                      <div className="flex-1">
                        <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-0.5 line-clamp-1">
                          {action.title}
                        </h3>
                        <p className="text-xs md:text-sm text-slate-600 line-clamp-1">{action.description}</p>
                      </div>
                      <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-[12px] sm:rounded-[14px] ${action.iconBg} flex items-center justify-center shadow-md opacity-90 group-hover:opacity-100 transition-opacity flex-shrink-0`}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className={`text-[40px] sm:text-[56px] font-bold leading-none ${action.textColor}`}>
                        {loading ? (
                          <>
                            <span className="inline-block animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                            <span className="inline-block animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                            <span className="inline-block animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                          </>
                        ) : <AnimatedNumber value={count} />}
                      </span>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900/90 dark:bg-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                        <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}

        {/* Stats Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
        >
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-0 text-white shadow-lg h-full">
            <div className="p-4 sm:p-5 md:p-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-2 md:gap-2.5 mb-4 md:mb-5 lg:mb-6">
                  <div className="w-9 h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 rounded-[12px] md:rounded-[14px] bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl md:text-[28px] lg:text-[32px] font-bold leading-none">
                      {loading ? (
                        <>
                          <span className="inline-block animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                          <span className="inline-block animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                          <span className="inline-block animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                        </>
                      ) : (
                        <>
                          <AnimatedNumber value={totalGenerated} />+
                        </>
                      )}
                    </p>
                    <p className="text-sm text-slate-300">generated</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-2.5">
                <div className="w-9 h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 rounded-[12px] md:rounded-[14px] bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 md:w-5 md:h-5 text-white" strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl md:text-[28px] lg:text-[32px] font-bold leading-none">
                    {loading ? (
                      <>
                        <span className="inline-block animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                        <span className="inline-block animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                        <span className="inline-block animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                      </>
                    ) : <AnimatedNumber value={stats?.hoursSaved || 0} />}
                  </p>
                  <p className="text-sm text-slate-300">hours saved</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        {/* Main Content - Left Side (2/3) */}
        <div className="xl:col-span-2 space-y-6 md:space-y-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 md:mb-5">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-gray-100 mb-1">
                  Latest activity
                </h2>
                <p className="text-xs md:text-sm text-slate-500 dark:text-gray-400">Track your recent generations</p>
              </div>
              <Link href="/dashboard/activity-history">
                <Button variant="ghost" size="sm" className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100">
                  View all
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <Card className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700">
                <div className="p-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 py-4 border-b border-slate-100 dark:border-gray-700 last:border-0">
                      <div className="w-14 h-14 rounded-[14px] bg-slate-200 dark:bg-gray-700 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
                      </div>
                      <div className="w-16 h-8 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </Card>
            ) : !stats || stats.recentActivity.length === 0 ? (
              <Card className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700">
                <div className="p-16 text-center">
                  <div className="w-20 h-20 rounded-[20px] bg-slate-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-10 h-10 text-slate-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100 mb-2">No activity yet</h3>
                  <p className="text-sm text-slate-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                    Start by creating your first cover letter, email, or LinkedIn message
                  </p>
                  <Link href="/dashboard/cover-letter">
                    <Button className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <>
                {/* Desktop Table View */}
                <Card className="hidden lg:block bg-white dark:bg-gray-800 border-slate-200/60 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-gray-700">
                          <th className="text-left text-sm font-semibold text-slate-700 dark:text-gray-300 py-4 px-6">
                            Application
                          </th>
                          <th className="text-left text-sm font-semibold text-slate-700 dark:text-gray-300 py-4 px-4">
                            Date
                          </th>
                          <th className="text-center text-sm font-semibold text-slate-700 dark:text-gray-300 py-4 px-4">
                            Status
                          </th>
                          <th className="text-center text-sm font-semibold text-slate-700 dark:text-gray-300 py-4 px-4">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats?.recentActivity.map((activity, index) => {
                          const Icon =
                            activity.type === 'Cover Letter'
                              ? FileText
                              : activity.type === 'LinkedIn'
                              ? MessageSquare
                              : Mail;
                          const iconBg =
                            activity.type === 'Cover Letter'
                              ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                              : activity.type === 'LinkedIn'
                              ? 'bg-gradient-to-br from-blue-400 to-indigo-500'
                              : 'bg-gradient-to-br from-slate-400 to-gray-500';

                          return (
                            <motion.tr
                              key={activity.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + index * 0.1 }}
                              className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50/50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                              <td className="py-5 px-6">
                                <div className="flex items-center gap-3.5">
                                  <div className={`w-14 h-14 rounded-[14px] ${iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                    <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-900 dark:text-gray-100 text-[15px] mb-0.5">
                                      {activity.position}
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-gray-400">
                                      {activity.company}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-5 px-4">
                                <p className="text-sm text-slate-600 dark:text-gray-400">
                                  {new Date(activity.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </p>
                              </td>
                              <td className="text-center py-5 px-4">
                                {activity.type === 'Cover Letter' ? (
                                  <span className="text-sm text-slate-400 dark:text-gray-500">—</span>
                                ) : (
                                  <Badge
                                    variant={
                                      activity.status === 'SENT' ? 'default' :
                                      activity.status === 'DONE' ? 'secondary' :
                                      activity.status === 'GHOST' ? 'destructive' : 'outline'
                                    }
                                    className="font-medium"
                                  >
                                    {activity.status}
                                  </Badge>
                                )}
                              </td>
                              <td className="text-center py-5 px-4">
                                <div className="flex items-center justify-center gap-2">
                                  {/* Follow-up button for LinkedIn/Email NEW messages without follow-ups */}
                                  {(activity.type === 'LinkedIn' || activity.type === 'Email') &&
                                   activity.messageType === 'NEW' &&
                                   !activity.hasFollowUp && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleFollowup(activity)}
                                      className="h-8 text-xs"
                                    >
                                      <Reply className="w-3 h-3 mr-1" />
                                      Follow-up
                                    </Button>
                                  )}

                                  {/* "Followed up" status for NEW messages that have follow-ups */}
                                  {(activity.type === 'LinkedIn' || activity.type === 'Email') &&
                                   activity.messageType === 'NEW' &&
                                   activity.hasFollowUp && (
                                    <Badge variant="secondary" className="text-xs">
                                      Followed up
                                    </Badge>
                                  )}

                                  {/* "Follow-up sent" status for follow-up messages */}
                                  {activity.messageType === 'FOLLOW_UP' && (
                                    <Badge variant="outline" className="text-xs">
                                      Follow-up sent
                                    </Badge>
                                  )}

                                  {/* Delete button only for cover letters and NEW messages (not follow-ups) */}
                                  {(activity.type === 'Cover Letter' || activity.messageType === 'NEW') && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDelete(activity)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden space-y-3">
                  {stats?.recentActivity.map((activity, index) => {
                    const Icon =
                      activity.type === 'Cover Letter'
                        ? FileText
                        : activity.type === 'LinkedIn'
                        ? MessageSquare
                        : Mail;
                    const iconBg =
                      activity.type === 'Cover Letter'
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                        : activity.type === 'LinkedIn'
                        ? 'bg-gradient-to-br from-blue-400 to-indigo-500'
                        : 'bg-gradient-to-br from-slate-400 to-gray-500';

                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <Card className="bg-white border-slate-200/60 hover:border-slate-300 transition-colors">
                          <div className="p-4">
                            <div className="flex items-start gap-3 mb-3">
                              <div className={`w-12 h-12 rounded-[12px] ${iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-900 text-sm mb-0.5 truncate">
                                  {activity.position}
                                </p>
                                <p className="text-xs text-slate-600 truncate">
                                  {activity.company}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                  {new Date(activity.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                              <div className="flex items-center gap-2 flex-1">
                                {activity.type === 'Cover Letter' ? (
                                  <span className="text-xs text-slate-400">No status</span>
                                ) : (
                                  <Badge
                                    variant={
                                      activity.status === 'SENT' ? 'default' :
                                      activity.status === 'DONE' ? 'secondary' :
                                      activity.status === 'GHOST' ? 'destructive' : 'outline'
                                    }
                                    className="text-xs font-medium"
                                  >
                                    {activity.status}
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5">
                                {/* Follow-up button for LinkedIn/Email NEW messages without follow-ups */}
                                {(activity.type === 'LinkedIn' || activity.type === 'Email') &&
                                 activity.messageType === 'NEW' &&
                                 !activity.hasFollowUp && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleFollowup(activity)}
                                    className="h-8 text-xs px-2"
                                  >
                                    <Reply className="w-3 h-3 mr-1" />
                                    Follow-up
                                  </Button>
                                )}

                                {/* "Followed up" status for NEW messages that have follow-ups */}
                                {(activity.type === 'LinkedIn' || activity.type === 'Email') &&
                                 activity.messageType === 'NEW' &&
                                 activity.hasFollowUp && (
                                  <Badge variant="secondary" className="text-xs">
                                    Followed up
                                  </Badge>
                                )}

                                {/* "Follow-up sent" status for follow-up messages */}
                                {activity.messageType === 'FOLLOW_UP' && (
                                  <Badge variant="outline" className="text-xs">
                                    Follow-up sent
                                  </Badge>
                                )}

                                {/* Delete button only for cover letters and NEW messages (not follow-ups) */}
                                {(activity.type === 'Cover Letter' || activity.messageType === 'NEW') && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDelete(activity)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* Right Sidebar - Stats */}
        <div className="space-y-4 md:space-y-6">
          {/* Usage Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="bg-white dark:bg-gray-800 border-slate-200/60 dark:border-gray-700">
              <div className="p-5 md:p-6 lg:p-7">
                <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-gray-100 mb-1">Your usage</h3>
                <p className="text-xs md:text-sm text-slate-500 dark:text-gray-400 mb-5 md:mb-6 lg:mb-7">
                  Current plan: {loading ? (
                    <span className="inline-block w-12 h-4 bg-slate-200 rounded animate-pulse"></span>
                  ) : (
                    stats?.userType === 'FREE' ? 'Free' : stats?.userType === 'PLUS' ? 'Plus' : 'Admin'
                  )}
                </p>

                {/* Gauge Chart */}
                <div className="flex items-center justify-center mb-5 md:mb-6 lg:mb-7">
                  <div className="relative w-48 h-28 md:w-52 md:h-30 lg:w-56 lg:h-32">
                    {/* Background arc */}
                    <svg className="w-full h-full" viewBox="0 0 200 110">
                      <path
                        d="M 15 95 A 85 85 0 0 1 185 95"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="18"
                        strokeLinecap="round"
                      />
                      {/* Filled arc */}
                      <path
                        d="M 15 95 A 85 85 0 0 1 185 95"
                        fill="none"
                        stroke="url(#gaugeGradient)"
                        strokeWidth="18"
                        strokeLinecap="round"
                        strokeDasharray={loading ? `267 267` : `${((stats?.usagePercentage || 0) / 100) * 267} 267`}
                        className="transition-all duration-1000 ease-out"
                        style={loading ? {
                          animation: 'gaugePulse 2s ease-in-out infinite'
                        } : undefined}
                      />
                      <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="50%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-end justify-center pb-1 md:pb-2">
                      <span className="text-[44px] md:text-[50px] lg:text-[56px] font-bold text-slate-900 dark:text-gray-100 leading-none">
                        {loading ? (
                          <>
                            <span className="inline-block animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                            <span className="inline-block animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                            <span className="inline-block animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                          </>
                        ) : (
                          <>
                            <AnimatedNumber value={stats?.usagePercentage || 0} />
                            <span className="text-2xl md:text-3xl text-slate-600 dark:text-gray-400">%</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-center text-sm text-slate-600 dark:text-gray-400 mb-6">
                  {loading ? (
                    <>
                      <span className="inline-block w-3 h-3 bg-slate-300 dark:bg-gray-700 rounded animate-pulse"></span>
                      {' items used of '}
                      <span className="inline-block w-8 h-3 bg-slate-300 dark:bg-gray-700 rounded animate-pulse"></span>
                    </>
                  ) : (
                    <>
                      <AnimatedNumber value={stats?.monthlyCount || 0} /> of {stats?.monthlyLimit || 0} this month
                      <br />
                      <span className="text-xs text-slate-500 dark:text-gray-500">
                        Resets in {stats?.daysUntilReset || 0} days
                      </span>
                    </>
                  )}
                </p>

                <div className="flex flex-col sm:flex-row gap-2 md:gap-2.5">
                  <Button variant="outline" size="sm" className="flex-1 text-xs md:text-sm h-9 md:h-10">
                    Pricing plans
                  </Button>
                  <Button size="sm" className="flex-1 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-xs md:text-sm h-9 md:h-10">
                    Upgrade
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Quick Tip Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/60 dark:border-blue-800/60">
              <div className="p-4 md:p-5 lg:p-6">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-[10px] md:rounded-[12px] bg-blue-500 flex items-center justify-center mb-3 md:mb-4">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm md:text-base font-semibold text-slate-900 dark:text-gray-100 mb-2 md:mb-2.5">Pro tip</h3>
                <p className="text-xs md:text-sm lg:text-[15px] text-slate-700 dark:text-gray-300 leading-relaxed">
                  Upload your resume in{' '}
                  <Link href="/dashboard/settings" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                    Settings
                  </Link>{' '}
                  to generate more personalized content tailored to your experience.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
