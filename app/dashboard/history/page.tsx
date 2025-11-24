'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download, Eye, Loader2, History, FileText, Mail, MessageSquare } from 'lucide-react';

interface HistoryItem {
  id: string;
  type: 'Cover Letter' | 'LinkedIn' | 'Email';
  company: string;
  position: string;
  status: string;
  createdAt: string;
}

const statusColors = {
  DRAFT: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  SENT: 'bg-blue-100 text-blue-700 border-blue-300',
  DONE: 'bg-green-100 text-green-700 border-green-300',
  GHOST: 'bg-gray-100 text-gray-700 border-gray-300',
};

const typeIcons = {
  'Cover Letter': FileText,
  'LinkedIn': MessageSquare,
  'Email': Mail,
};

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'ALL') params.append('type', filterType);
      if (filterStatus !== 'ALL') params.append('status', filterStatus);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/history?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadHistory();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filterType, filterStatus]);

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (filterType !== 'ALL') params.append('type', filterType);
    if (filterStatus !== 'ALL') params.append('status', filterStatus);
    if (searchQuery) params.append('search', searchQuery);
    window.open(`/api/history/export?${params.toString()}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-3">Application History</h1>
        <p className="text-lg text-slate-600">
          Track all your job applications and outreach in one centralized location.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
          <div className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search company or position..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-11 bg-white border-slate-200 rounded-[16px]"
                />
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-11 bg-white border-slate-200 rounded-[16px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="rounded-[16px]">
                  {[
                    ['ALL', 'All Types'],
                    ['Cover Letter', 'Cover Letters'],
                    ['LinkedIn', 'LinkedIn'],
                    ['Email', 'Emails']
                  ].map(([v, l]) => (
                    <SelectItem key={v} value={v} className="rounded-[12px]">{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-11 bg-white border-slate-200 rounded-[16px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="rounded-[16px]">
                  {[
                    ['ALL', 'All Statuses'],
                    ['DRAFT', 'Draft'],
                    ['SENT', 'Sent'],
                    ['DONE', 'Done'],
                    ['GHOST', 'Ghost']
                  ].map(([v, l]) => (
                    <SelectItem key={v} value={v} className="rounded-[12px]">{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handleExportCSV}
                className="h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-[16px] transition-colors"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-slate-400 mb-4" />
                <p className="text-slate-500 text-sm">Loading applications...</p>
              </div>
            ) : (
              <>
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-20 h-20 rounded-[20px] bg-slate-100 flex items-center justify-center mb-4">
                      <History className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-display font-semibold text-slate-900 mb-2">No Applications Yet</h3>
                    <p className="text-sm text-slate-600 text-center max-w-md">
                      Start creating cover letters, LinkedIn messages, or emails to see your history here.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-[16px] border border-slate-200 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 border-b border-slate-200">
                          <TableHead className="font-semibold text-slate-700">Type</TableHead>
                          <TableHead className="font-semibold text-slate-700">Company</TableHead>
                          <TableHead className="font-semibold text-slate-700">Position</TableHead>
                          <TableHead className="font-semibold text-slate-700">Status</TableHead>
                          <TableHead className="font-semibold text-slate-700">Date</TableHead>
                          <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {history.map((item) => {
                          const Icon = typeIcons[item.type];
                          return (
                            <TableRow key={item.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4 text-slate-600" />
                                  <span className="font-medium text-slate-900">{item.type}</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium text-slate-900">{item.company}</TableCell>
                              <TableCell className="text-slate-700">{item.position}</TableCell>
                              <TableCell>
                                <Badge className={`${statusColors[item.status as keyof typeof statusColors]} border font-medium px-2 py-0.5 rounded-[8px]`}>
                                  {item.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-slate-600">
                                {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-[12px] border-slate-200 hover:bg-slate-50 text-slate-700"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {history.length > 0 && (
                  <div className="mt-6 flex justify-between items-center text-sm text-slate-600">
                    <span>
                      Showing {history.length} {history.length === 1 ? 'application' : 'applications'}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
