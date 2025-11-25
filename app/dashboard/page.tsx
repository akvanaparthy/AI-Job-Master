'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, MessageSquare, Mail, ArrowRight, TrendingUp, Clock, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DashboardStats {
  totalCoverLetters: number;
  totalLinkedInMessages: number;
  totalEmails: number;
  hoursSaved: number;
  usagePercentage: number;
  recentActivity: Array<{
    id: string;
    type: 'Cover Letter' | 'LinkedIn' | 'Email';
    company: string;
    position: string;
    createdAt: string;
    reduction?: number;
    wordsBefore?: number;
    wordsAfter?: number;
  }>;
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
  const [stats, setStats] = useState<DashboardStats>({
    totalCoverLetters: 55,
    totalLinkedInMessages: 12,
    totalEmails: 24,
    hoursSaved: 16,
    usagePercentage: 68,
    recentActivity: [
      {
        id: '1',
        type: 'Cover Letter',
        company: 'TechCorp Inc.',
        position: 'Senior Software Engineer',
        createdAt: new Date().toISOString(),
        reduction: 56,
        wordsBefore: 637,
        wordsAfter: 280,
      },
      {
        id: '2',
        type: 'LinkedIn',
        company: 'StartupXYZ',
        position: 'Product Manager',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        reduction: 50,
        wordsBefore: 102,
        wordsAfter: 51,
      },
    ],
  });

  const totalGenerated = stats.totalCoverLetters + stats.totalLinkedInMessages + stats.totalEmails;

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-[42px] font-bold text-slate-900 mb-2 leading-tight">
          Hello there,
        </h1>
        <p className="text-lg text-slate-500">
          Accelerate your job search with AI-powered content generation.
        </p>
      </motion.div>

      {/* Stats & Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Quick Action Cards */}
        {QUICK_ACTIONS.map((action, index) => {
          const Icon = action.icon;
          let count = 0;
          if (action.title === 'Cover Letters') count = stats.totalCoverLetters;
          else if (action.title === 'LinkedIn') count = stats.totalLinkedInMessages;
          else if (action.title === 'Emails') count = stats.totalEmails;

          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Link href={action.href}>
                <Card className={`relative overflow-hidden border border-slate-200/60 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group ${action.bgColor}`}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 mb-0.5">
                          {action.title}
                        </h3>
                        <p className="text-sm text-slate-600">{action.description}</p>
                      </div>
                      <div className={`w-11 h-11 rounded-[14px] ${action.iconBg} flex items-center justify-center shadow-md opacity-90 group-hover:opacity-100 transition-opacity`}>
                        <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className={`text-[56px] font-bold leading-none ${action.textColor}`}>
                        {count}
                      </span>
                      <div className="w-10 h-10 rounded-full bg-slate-900/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                        <ArrowUpRight className="w-5 h-5 text-white" strokeWidth={2.5} />
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
            <div className="p-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-11 h-11 rounded-[14px] bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[32px] font-bold leading-none">{totalGenerated}+</p>
                    <p className="text-sm text-slate-300">generated</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-[14px] bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[32px] font-bold leading-none">{stats.hoursSaved}</p>
                  <p className="text-sm text-slate-300">hours saved</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Left Side (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  Latest activity
                </h2>
                <p className="text-sm text-slate-500">Track your recent generations</p>
              </div>
              <Link href="/dashboard/history">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                  View all
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>

            {stats.recentActivity.length === 0 ? (
              <Card className="bg-white border-slate-200">
                <div className="p-16 text-center">
                  <div className="w-20 h-20 rounded-[20px] bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No activity yet</h3>
                  <p className="text-sm text-slate-600 mb-6 max-w-sm mx-auto">
                    Start by creating your first cover letter, email, or LinkedIn message
                  </p>
                  <Link href="/dashboard/cover-letter">
                    <Button className="bg-slate-900 hover:bg-slate-800">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card className="bg-white border-slate-200/60 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left text-sm font-semibold text-slate-700 py-4 px-6">
                            Resource
                          </th>
                          <th className="text-center text-sm font-semibold text-slate-700 py-4 px-4">
                            Optimized
                          </th>
                          <th className="text-center text-sm font-semibold text-slate-700 py-4 px-4">
                            Before
                          </th>
                          <th className="text-center text-sm font-semibold text-slate-700 py-4 px-4"></th>
                          <th className="text-center text-sm font-semibold text-slate-700 py-4 px-4">
                            After
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentActivity.map((activity, index) => {
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
                              className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                            >
                              <td className="py-5 px-6">
                                <div className="flex items-center gap-3.5">
                                  <div className={`w-14 h-14 rounded-[14px] ${iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                    <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-900 text-[15px] mb-0.5">
                                      {activity.position}
                                    </p>
                                    <p className="text-sm text-slate-600">
                                      {activity.company} •{' '}
                                      {new Date(activity.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="text-center py-5 px-4">
                                {activity.reduction && (
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="relative w-14 h-14">
                                      <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                          cx="28"
                                          cy="28"
                                          r="24"
                                          fill="none"
                                          stroke="#e2e8f0"
                                          strokeWidth="4"
                                        />
                                        <circle
                                          cx="28"
                                          cy="28"
                                          r="24"
                                          fill="none"
                                          stroke="#3b82f6"
                                          strokeWidth="4"
                                          strokeDasharray={`${2 * Math.PI * 24}`}
                                          strokeDashoffset={`${2 * Math.PI * 24 * (1 - activity.reduction / 100)}`}
                                          strokeLinecap="round"
                                        />
                                      </svg>
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-sm font-bold text-blue-600">
                                          {activity.reduction}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="text-center py-5 px-4">
                                <div>
                                  <p className="text-[26px] font-bold text-slate-900 leading-none mb-0.5">
                                    {activity.wordsBefore}
                                  </p>
                                  <p className="text-xs text-slate-500">Words</p>
                                </div>
                              </td>
                              <td className="text-center py-5 px-4">
                                <ArrowRight className="w-5 h-5 text-slate-400 mx-auto" />
                              </td>
                              <td className="text-center py-5 px-4">
                                <div>
                                  <p className="text-[26px] font-bold text-slate-900 leading-none mb-0.5">
                                    {activity.wordsAfter}
                                  </p>
                                  <p className="text-xs text-slate-500">Words</p>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Sidebar - Stats */}
        <div className="space-y-6">
          {/* Usage Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="bg-white border-slate-200/60">
              <div className="p-7">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Your usage</h3>
                <p className="text-sm text-slate-500 mb-7">Current plan: Personal</p>

                {/* Gauge Chart */}
                <div className="flex items-center justify-center mb-7">
                  <div className="relative w-56 h-28">
                    {/* Background arc */}
                    <svg className="w-full h-full" viewBox="0 0 200 100">
                      <path
                        d="M 15 90 A 85 85 0 0 1 185 90"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="18"
                        strokeLinecap="round"
                      />
                      {/* Filled arc */}
                      <path
                        d="M 15 90 A 85 85 0 0 1 185 90"
                        fill="none"
                        stroke="url(#gaugeGradient)"
                        strokeWidth="18"
                        strokeLinecap="round"
                        strokeDasharray={`${(stats.usagePercentage / 100) * 267} 267`}
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="50%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-end justify-center pb-1">
                      <span className="text-[56px] font-bold text-slate-900 leading-none">
                        {stats.usagePercentage}
                        <span className="text-3xl text-slate-600">%</span>
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-center text-sm text-slate-600 mb-6">
                  {totalGenerated} items used of 30
                </p>

                <div className="flex gap-2.5">
                  <Button variant="outline" size="sm" className="flex-1 text-sm h-10">
                    Pricing plans
                  </Button>
                  <Button size="sm" className="flex-1 bg-slate-900 hover:bg-slate-800 text-sm h-10">
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
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50/80 border-blue-200/60">
              <div className="p-6">
                <div className="w-10 h-10 rounded-[12px] bg-blue-500 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2.5">Pro tip</h3>
                <p className="text-[15px] text-slate-700 leading-relaxed">
                  Upload your resume in{' '}
                  <Link href="/settings" className="text-blue-600 font-medium hover:underline">
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
