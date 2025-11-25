'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { History as HistoryIcon, Search, Download, Filter, FileText, MessageSquare, Mail, Loader2 } from 'lucide-react';

interface HistoryItem {
  id: string;
  type: 'Cover Letter' | 'LinkedIn' | 'Email';
  company: string;
  position: string;
  status: string;
  createdAt: string;
  content?: string;
  subject?: string;
  body?: string;
}

const TYPE_CONFIG = {
  'Cover Letter': {
    icon: FileText,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
  },
  'LinkedIn': {
    icon: MessageSquare,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  'Email': {
    icon: Mail,
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-200',
  },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  SENT: { label: 'Sent', color: 'bg-blue-100 text-blue-700' },
  DONE: { label: 'Done', color: 'bg-emerald-100 text-emerald-700' },
  GHOST: { label: 'No Response', color: 'bg-slate-100 text-slate-700' },
};

export default function HistoryPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterHistory();
  }, [searchQuery, typeFilter, statusFilter, history]);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      toast({ title: 'Error', description: 'Failed to load history', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filterHistory = () => {
    let filtered = history;

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.company.toLowerCase().includes(query) ||
        item.position.toLowerCase().includes(query)
      );
    }

    setFilteredHistory(filtered);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'ALL') params.append('type', typeFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/history/export?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to export');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `job-applications-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ title: 'Success', description: 'History exported successfully!' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to export history', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg">
              <HistoryIcon className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-[42px] font-bold text-slate-900 leading-tight">History</h1>
              <p className="text-lg text-slate-500">
                View and manage all your generated applications
              </p>
            </div>
          </div>
          <Button
            onClick={handleExport}
            disabled={exporting || filteredHistory.length === 0}
            variant="outline"
            className="h-11 border-slate-200 hover:bg-slate-50 transition-colors"
          >
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export CSV
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card className="bg-white border-slate-200/60 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-violet-50 to-purple-50/80 border-b border-violet-100/50 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Filter className="w-5 h-5 text-violet-600" />
              Filters
            </h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by company or position..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 pl-10 bg-white border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-11 bg-white border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="ALL" className="rounded-md">All Types</SelectItem>
                  <SelectItem value="Cover Letter" className="rounded-md">Cover Letters</SelectItem>
                  <SelectItem value="LinkedIn" className="rounded-md">LinkedIn Messages</SelectItem>
                  <SelectItem value="Email" className="rounded-md">Emails</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 bg-white border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="ALL" className="rounded-md">All Statuses</SelectItem>
                  <SelectItem value="DRAFT" className="rounded-md">Draft</SelectItem>
                  <SelectItem value="SENT" className="rounded-md">Sent</SelectItem>
                  <SelectItem value="DONE" className="rounded-md">Done</SelectItem>
                  <SelectItem value="GHOST" className="rounded-md">No Response</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* History List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white border-slate-200/60 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                All Applications
              </h2>
              <Badge variant="secondary" className="bg-violet-100 text-violet-700 hover:bg-violet-100">
                {filteredHistory.length} {filteredHistory.length === 1 ? 'item' : 'items'}
              </Badge>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12">
                <div className="w-20 h-20 rounded-[16px] bg-slate-100 flex items-center justify-center mb-4">
                  <HistoryIcon className="w-10 h-10 text-slate-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No History Found</h3>
                <p className="text-slate-600 text-center max-w-sm">
                  {searchQuery || typeFilter !== 'ALL' || statusFilter !== 'ALL'
                    ? 'Try adjusting your filters to see more results'
                    : 'Start generating cover letters, LinkedIn messages, or emails to build your history'}
                </p>
              </div>
            ) : (
              filteredHistory.map((item, index) => {
                const config = TYPE_CONFIG[item.type];
                const Icon = config.icon;
                const statusConfig = STATUS_CONFIG[item.status];

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg ${config.bgColor} border ${config.borderColor} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${config.textColor}`} strokeWidth={2} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-slate-900 truncate">
                              {item.position}
                            </h3>
                            <p className="text-sm text-slate-600 truncate">
                              {item.company}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0">
                            <Badge variant="secondary" className={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                            <Badge variant="outline" className={`${config.textColor} ${config.borderColor}`}>
                              {item.type}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500">
                          {new Date(item.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
