'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Download, Eye, Loader2 } from 'lucide-react';

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
  messageType?: string;
}

const statusColors = {
  DRAFT: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  SENT: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  DONE: 'bg-green-500/10 text-green-500 border-green-500/20',
  GHOST: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    loadHistory();
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

  // Reload when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      loadHistory();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [searchQuery, filterType, filterStatus]);

  const filteredHistory = history;

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (filterType !== 'ALL') params.append('type', filterType);
    if (filterStatus !== 'ALL') params.append('status', filterStatus);
    if (searchQuery) params.append('search', searchQuery);

    // Open in new tab to trigger download
    window.open(`/api/history/export?${params.toString()}`, '_blank');
  };

  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Outreach History</h1>
        <p className="text-muted-foreground mt-2">
          Track all your job applications and outreach
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search company or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="Cover Letter">Cover Letter</SelectItem>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
                <SelectItem value="GHOST">Ghost</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Application History</CardTitle>
              <CardDescription>
                {filteredHistory.length} {filteredHistory.length === 1 ? 'result' : 'results'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No applications found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredHistory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.type}</TableCell>
                          <TableCell>{item.company}</TableCell>
                          <TableCell>{item.position}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColors[item.status as keyof typeof statusColors]}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {filteredHistory.length > 0 && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Showing {filteredHistory.length} total applications
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
