'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { History as HistoryIcon, Search, Download, Filter, FileText, MessageSquare, Mail, Loader2, Eye, Trash2, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getModelDisplayName } from '@/lib/utils/modelNames';

interface HistoryItem {
  id: string;
  type: 'Cover Letter' | 'LinkedIn' | 'Email';
  company: string;
  position: string;
  status?: string;
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
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loadingItem, setLoadingItem] = useState(false);

  useEffect(() => {
    loadHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleViewItem = async (item: HistoryItem) => {
    setLoadingItem(true);
    setViewDialogOpen(true);
    try {
      const endpoint =
        item.type === 'Cover Letter'
          ? `/api/history/cover-letter/${item.id}`
          : item.type === 'LinkedIn'
          ? `/api/history/linkedin/${item.id}`
          : `/api/history/email/${item.id}`;

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch item');

      const data = await response.json();
      setSelectedItem(data.coverLetter || data.message);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load content', variant: 'destructive' });
      setViewDialogOpen(false);
    } finally {
      setLoadingItem(false);
    }
  };

  const handleDeleteItem = async (item: HistoryItem) => {
    if (!confirm(`Are you sure you want to delete this ${item.type.toLowerCase()}?`)) {
      return;
    }

    try {
      const endpoint =
        item.type === 'Cover Letter'
          ? `/api/history/cover-letter/${item.id}`
          : item.type === 'LinkedIn'
          ? `/api/history/linkedin/${item.id}`
          : `/api/history/email/${item.id}`;

      const response = await fetch(endpoint, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete item');

      toast({ title: 'Success', description: `${item.type} deleted successfully` });
      await loadHistory();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete item', variant: 'destructive' });
    }
  };

  const handleFollowUp = async (item: HistoryItem) => {
    // First fetch the full item details to get all fields
    try {
      const endpoint =
        item.type === 'LinkedIn'
          ? `/api/history/linkedin/${item.id}`
          : `/api/history/email/${item.id}`;

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch item');

      const data = await response.json();
      const message = data.message;

      // Build URL parameters
      const params = new URLSearchParams({
        followup: 'true',
        id: item.id,
        positionTitle: message.positionTitle || '',
        companyName: message.companyName || '',
      });

      // Add optional parameters
      if (message.linkedinUrl) params.append('linkedinUrl', message.linkedinUrl);
      if (message.recipientEmail) params.append('recipientEmail', message.recipientEmail);
      if (message.recipientName) params.append('recipientName', message.recipientName);
      if (message.jobDescription) params.append('jobDescription', message.jobDescription);
      if (message.companyDescription) params.append('companyDescription', message.companyDescription);
      if (message.resumeId) params.append('resumeId', message.resumeId);
      if (message.length) params.append('length', message.length);
      if (message.llmModel) params.append('llmModel', message.llmModel);

      // Navigate to the appropriate page
      const targetPage = item.type === 'LinkedIn' ? '/dashboard/linkedin' : '/dashboard/email';
      window.location.href = `${targetPage}?${params.toString()}`;
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load message details', variant: 'destructive' });
    }
  };

  const handleStatusChange = async (item: HistoryItem, newStatus: string) => {
    try {
      const endpoint =
        item.type === 'Cover Letter'
          ? `/api/history/cover-letter/${item.id}`
          : item.type === 'LinkedIn'
          ? `/api/history/linkedin/${item.id}`
          : `/api/history/email/${item.id}`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast({ title: 'Success', description: 'Status updated successfully' });
      await loadHistory(); // Refresh the list
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
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
                Generated Content
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
                            {item.status && STATUS_CONFIG[item.status] && (
                              <Select
                                value={item.status}
                                onValueChange={(newStatus) => handleStatusChange(item, newStatus)}
                              >
                                <SelectTrigger className={`h-7 w-[130px] border-0 ${STATUS_CONFIG[item.status].color} hover:opacity-80 transition-opacity`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg">
                                  <SelectItem value="DRAFT" className="rounded-md">Draft</SelectItem>
                                  <SelectItem value="SENT" className="rounded-md">Sent</SelectItem>
                                  <SelectItem value="DONE" className="rounded-md">Done</SelectItem>
                                  <SelectItem value="GHOST" className="rounded-md">No Response</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            <Badge variant="outline" className={`${config.textColor} ${config.borderColor}`}>
                              {item.type}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-500">
                            {new Date(item.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewItem(item)}
                              className="h-8 px-3"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1.5" />
                              View
                            </Button>
                            {(item.type === 'LinkedIn' || item.type === 'Email') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFollowUp(item)}
                                className="h-8 px-3 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                              >
                                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                Follow-up
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteItem(item)}
                              className="h-8 px-3 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </Card>
      </motion.div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.position || 'Loading...'}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.company}
            </DialogDescription>
          </DialogHeader>

          {loadingItem ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : selectedItem ? (
            <div className="space-y-4">
              {/* Status Update Section */}
              {selectedItem.status && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <Label className="text-sm font-medium text-slate-900">Status:</Label>
                  <Select
                    value={selectedItem.status}
                    onValueChange={(newStatus) => {
                      const itemType = selectedItem.content ? 'Cover Letter' : selectedItem.subject ? 'Email' : 'LinkedIn';
                      handleStatusChange({
                        id: selectedItem.id,
                        type: itemType as any,
                        company: selectedItem.company,
                        position: selectedItem.position,
                        status: selectedItem.status,
                        createdAt: selectedItem.createdAt
                      }, newStatus);
                      setSelectedItem({ ...selectedItem, status: newStatus });
                    }}
                  >
                    <SelectTrigger className={`h-9 w-[150px] ${STATUS_CONFIG[selectedItem.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value="DRAFT" className="rounded-md">Draft</SelectItem>
                      <SelectItem value="SENT" className="rounded-md">Sent</SelectItem>
                      <SelectItem value="DONE" className="rounded-md">Done</SelectItem>
                      <SelectItem value="GHOST" className="rounded-md">No Response</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}


              {selectedItem.content && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Content</h3>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {selectedItem.content}
                    </p>
                  </div>
                </div>
              )}

              {selectedItem.subject && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Subject</h3>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-sm text-slate-700">
                      {selectedItem.subject}
                    </p>
                  </div>
                </div>
              )}

              {selectedItem.body && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Body</h3>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {selectedItem.body}
                    </p>
                  </div>
                </div>
              )}

              {selectedItem.message && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Message</h3>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {selectedItem.message}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div className="text-xs text-slate-500">
                  <span className="font-semibold">Created:</span> {selectedItem.createdAt && new Date(selectedItem.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                {selectedItem.llmModel && (
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold">AI Model:</span> {getModelDisplayName(selectedItem.llmModel)}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const content = selectedItem.content || selectedItem.message || selectedItem.body || '';
                    navigator.clipboard.writeText(content);
                    toast({ title: 'Success', description: 'Content copied to clipboard!' });
                  }}
                >
                  Copy to Clipboard
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
