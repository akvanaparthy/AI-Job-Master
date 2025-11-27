'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { Loader2, Copy, Mail, Sparkles, CheckCircle2, RefreshCw, Save, Trash2, Search } from 'lucide-react';

interface Resume {
  id: string;
  title: string;
}

interface ModelOption {
  value: string;
  label: string;
  provider: string;
}

export default function EmailPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [loadingModels, setLoadingModels] = useState(true);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [availableModels, setAvailableModels] = useState<ModelOption[]>([]);
  const [hasAnyApiKey, setHasAnyApiKey] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [llmModel, setLlmModel] = useState('');
  const [messageType, setMessageType] = useState<'NEW' | 'FOLLOW_UP'>('NEW');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [areasOfInterest, setAreasOfInterest] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [length, setLength] = useState<'CONCISE' | 'MEDIUM' | 'LONG'>('MEDIUM');
  const [status, setStatus] = useState<'DRAFT' | 'SENT' | 'DONE' | 'GHOST'>('SENT');
  const [generatedSubject, setGeneratedSubject] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');
  const [savedId, setSavedId] = useState<string | null>(null);
  const [savedMessageId, setSavedMessageId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [parentMessageId, setParentMessageId] = useState<string | null>(null);
  const [previousMessageSubject, setPreviousMessageSubject] = useState('');
  const [previousMessageBody, setPreviousMessageBody] = useState('');
  const [extraContent, setExtraContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadResumes();
    loadAvailableModels();

    // Check for followup parameters in URL
    const params = new URLSearchParams(window.location.search);
    const isFollowup = params.get('followup') === 'true';
    const messageId = params.get('id');

    // Load user preferences (will be overridden by URL params if in follow-up mode)
    if (!isFollowup) {
      loadUserPreferences();
    }

    if (isFollowup && messageId) {
      setMessageType('FOLLOW_UP');
      setParentMessageId(messageId);

      // Pre-fill form fields from URL params
      const positionTitleParam = params.get('positionTitle');
      const companyNameParam = params.get('companyName');
      const recipientEmailParam = params.get('recipientEmail');
      const recipientNameParam = params.get('recipientName');
      const jobDescriptionParam = params.get('jobDescription');
      const companyDescriptionParam = params.get('companyDescription');
      const resumeIdParam = params.get('resumeId');
      const lengthParam = params.get('length');
      const llmModelParam = params.get('llmModel');

      if (positionTitleParam) setPositionTitle(positionTitleParam);
      if (companyNameParam) setCompanyName(companyNameParam);
      if (recipientEmailParam) setRecipientEmail(recipientEmailParam);
      if (recipientNameParam) setRecipientName(recipientNameParam);
      if (jobDescriptionParam) setJobDescription(jobDescriptionParam);
      if (companyDescriptionParam) setCompanyDescription(companyDescriptionParam);
      if (resumeIdParam) setSelectedResumeId(resumeIdParam);
      if (lengthParam) setLength(lengthParam as 'CONCISE' | 'MEDIUM' | 'LONG');
      if (llmModelParam) setLlmModel(llmModelParam);

      // Fetch the previous email content
      fetch(`/api/history/email/${messageId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.message) {
            setPreviousMessageSubject(data.message.subject || '');
            setPreviousMessageBody(data.message.body || '');
          }
        })
        .catch((error) => logger.error('Failed to load previous email', error));

      toast({
        title: 'Follow-up mode',
        description: 'Form pre-filled with previous email details',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadResumes = async () => {
    try {
      const response = await fetch('/api/settings/resumes');
      if (response.ok) {
        const data = await response.json();
        setResumes(data.resumes);
        const defaultResume = data.resumes.find((r: any) => r.isDefault);
        if (defaultResume) setSelectedResumeId(defaultResume.id);
      }
    } catch (error) {
      logger.error('Failed to load resumes', error);
    } finally {
      setLoadingResumes(false);
    }
  };

  const loadAvailableModels = async () => {
    try {
      const response = await fetch('/api/settings/available-models');
      if (response.ok) {
        const data = await response.json();
        setHasAnyApiKey(data.hasAnyKey);
        setAvailableModels(data.models);
      }
    } catch (error) {
      logger.error('Failed to load available models', error);
    } finally {
      setLoadingModels(false);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const response = await fetch('/api/settings/preferences');
      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          // Set defaults from user preferences
          if (data.preferences.defaultLlmModel) {
            setLlmModel(data.preferences.defaultLlmModel);
          }
          if (data.preferences.defaultLength) {
            setLength(data.preferences.defaultLength);
          }
          if (data.preferences.defaultStatus) {
            setStatus(data.preferences.defaultStatus);
          }
        }
      }
    } catch (error) {
      logger.error('Failed to load user preferences', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const response = await fetch(`/api/messages/search/email?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.messages || []);
      }
    } catch (error) {
      logger.error('Search failed', error);
    } finally {
      setSearching(false);
    }
  };

  const loadMessageDetails = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/search/email?messageId=${encodeURIComponent(messageId)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.message) {
          const msg = data.message;
          setCompanyName(msg.companyName);
          setPositionTitle(msg.positionTitle || '');
          setRecipientName(msg.recipientName || '');
          setRecipientEmail(msg.recipientEmail || '');
          setJobDescription(msg.jobDescription || '');
          setCompanyDescription(msg.companyDescription || '');
          setAreasOfInterest(msg.areasOfInterest || '');
          if (msg.resumeId) setSelectedResumeId(msg.resumeId);
          if (msg.length) setLength(msg.length);
          if (msg.llmModel) setLlmModel(msg.llmModel);
          setParentMessageId(msg.id);
          setPreviousMessageSubject(msg.subject || '');
          setPreviousMessageBody(msg.body || '');
          setSearchQuery('');
          setSearchResults([]);
          toast({
            title: 'Message Loaded',
            description: 'Previous email details loaded successfully',
          });
        }
      }
    } catch (error) {
      console.error('Failed to load message details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load message details',
        variant: 'destructive',
      });
    }
  };

  const handleGenerate = async () => {
    if (!recipientEmail || !companyName) {
      toast({ title: 'Error', description: 'Please fill in recipient email and company name', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setSavedId(null); // Reset saved state
    setSavedMessageId(null);
    try {
      const response = await fetch('/api/generate/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: selectedResumeId || undefined,
          messageType,
          recipientEmail,
          recipientName: recipientName || undefined,
          positionTitle: positionTitle || undefined,
          areasOfInterest: areasOfInterest || undefined,
          companyName,
          jobDescription: jobDescription || undefined,
          companyDescription: companyDescription || undefined,
          parentMessageId: parentMessageId || undefined,
          extraContent: extraContent || undefined,
          length,
          llmModel,
          saveToHistory: false, // Don't auto-save
        }),
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Failed to generate email');
      const data = await response.json();
      setGeneratedSubject(data.subject);
      setGeneratedBody(data.body);
      toast({ title: 'Success', description: 'Email generated successfully!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to generate email', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${generatedSubject}\n\n${generatedBody}`);
      toast({ title: 'Copied', description: 'Email copied to clipboard' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to copy to clipboard. Please try again.', variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    if (!generatedSubject || !generatedBody) return;
    setSaving(true);
    try {
      const response = await fetch('/api/generate/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: selectedResumeId || undefined,
          messageType,
          recipientEmail,
          recipientName: recipientName || undefined,
          positionTitle: positionTitle || undefined,
          areasOfInterest: areasOfInterest || undefined,
          companyName,
          jobDescription: jobDescription || undefined,
          companyDescription: companyDescription || undefined,
          parentMessageId: parentMessageId || undefined,
          extraContent: extraContent || undefined,
          length,
          llmModel,
          status,
          saveToHistory: true, // Save to history
        }),
      });
      if (!response.ok) throw new Error('Failed to save email');
      const data = await response.json();
      setSavedId(data.id);
      setSavedMessageId(data.messageId);
      toast({
        title: 'Saved',
        description: data.messageId ? `Email saved to history! Message ID: ${data.messageId}` : 'Email saved to history!'
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save email', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleUnsave = async () => {
    if (!savedId) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/history/email/${savedId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove email');
      setSavedId(null);
      toast({ title: 'Removed', description: 'Email removed from history' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to remove email', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] bg-gradient-to-br from-slate-400 to-gray-500 flex items-center justify-center shadow-lg">
            <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-[42px] font-bold text-slate-900 leading-tight">Professional Emails</h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-500">
              Craft compelling job application emails that get responses from recruiters
            </p>
          </div>
        </div>
      </motion.div>

      {/* Message Type Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4 sm:mb-6"
      >
        <Tabs value={messageType} onValueChange={(v: any) => setMessageType(v)}>
          <TabsList className="bg-white border border-slate-200 p-1 sm:p-1.5 rounded-xl shadow-sm w-full sm:w-auto">
            <TabsTrigger
              value="NEW"
              className="rounded-lg px-4 sm:px-6 text-xs sm:text-sm data-[state=active]:bg-gradient-to-br data-[state=active]:from-slate-700 data-[state=active]:to-gray-800 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 ease-in-out flex-1 sm:flex-none"
            >
              New Email
            </TabsTrigger>
            <TabsTrigger
              value="FOLLOW_UP"
              className="rounded-lg px-4 sm:px-6 text-xs sm:text-sm data-[state=active]:bg-gradient-to-br data-[state=active]:from-slate-700 data-[state=active]:to-gray-800 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 ease-in-out flex-1 sm:flex-none"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Follow-up
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4 sm:space-y-6"
        >
          {/* Configuration Card */}
          <Card className="bg-white border-slate-200/60 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-slate-50 to-gray-100/80 border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                Configuration
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">Set your preferences</p>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">Resume</Label>
                <Select value={selectedResumeId} onValueChange={setSelectedResumeId} disabled={loadingResumes}>
                  <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base bg-white border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                    <SelectValue placeholder={loadingResumes ? "Loading..." : "Choose a resume"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    {resumes.map((resume) => (
                      <SelectItem key={resume.id} value={resume.id} className="rounded-md">
                        {resume.title}
                      </SelectItem>
                    ))}
                    {resumes.length === 0 && (
                      <div className="px-2 py-6 text-center">
                        <p className="text-sm text-slate-600 mb-3">No resumes uploaded yet</p>
                        <Link href="/settings?tab=resumes">
                          <button className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                            Upload Resume in Settings
                          </button>
                        </Link>
                      </div>
                    )}
                    {resumes.length > 0 && resumes.length < 3 && (
                      <Link href="/settings?tab=resumes" className="block">
                        <div className="px-2 py-2 text-sm text-blue-600 hover:bg-blue-50 cursor-pointer rounded-md border-t border-slate-100 mt-1">
                          + Add Another Resume ({resumes.length}/3)
                        </div>
                      </Link>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">AI Model</Label>
                <Select value={llmModel} onValueChange={setLlmModel} disabled={loadingModels || !hasAnyApiKey}>
                  <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base bg-white border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                    <SelectValue placeholder={
                      loadingModels
                        ? "Loading models..."
                        : !hasAnyApiKey
                          ? "Please add API key first"
                          : "Select a model"
                    } />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    {availableModels.length > 0 ? (
                      <>
                        {availableModels.map((model) => (
                          <SelectItem key={model.value} value={model.value} className="rounded-md">
                            {model.label}
                          </SelectItem>
                        ))}
                        <Link href="/settings?tab=api-keys" className="block">
                          <div className="px-2 py-2 text-sm text-blue-600 hover:bg-blue-50 cursor-pointer rounded-md border-t border-slate-100 mt-1">
                            + Manage API Keys
                          </div>
                        </Link>
                      </>
                    ) : (
                      <div className="px-2 py-6 text-center">
                        <p className="text-sm text-slate-600 mb-3">No API keys configured</p>
                        <Link href="/settings?tab=api-keys">
                          <button className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                            Add API Key in Settings
                          </button>
                        </Link>
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {!hasAnyApiKey && !loadingModels && (
                  <p className="text-xs text-purple-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Add your API keys in Settings to enable AI generation
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">Email Length</Label>
                <Select value={length} onValueChange={(value: any) => setLength(value)}>
                  <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base bg-white border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    {[
                      ['CONCISE', 'Concise'],
                      ['MEDIUM', 'Medium'],
                      ['LONG', 'Detailed']
                    ].map(([v, l]) => (
                      <SelectItem key={v} value={v} className="rounded-md">{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Search for Previous Messages - Only shown in follow-up mode */}
          {messageType === 'FOLLOW_UP' && (
            <Card className="bg-white border-slate-200/60 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50/80 border-b border-purple-100/50 px-4 sm:px-6 py-3 sm:py-4">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  Search Previous Emails
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">Find and load a previous email to follow up on</p>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by company, position, message ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="h-10 sm:h-11 text-sm sm:text-base bg-white border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={searching || !searchQuery.trim()}
                    className="h-10 sm:h-11 px-4 sm:px-6 text-sm sm:text-base bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                  >
                    {searching ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> : <Search className="h-3 w-3 sm:h-4 sm:w-4" />}
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {searchResults.map((msg) => (
                      <div
                        key={msg.id}
                        onClick={() => loadMessageDetails(msg.id)}
                        className="p-3 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-lg cursor-pointer transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {msg.companyName} {msg.positionTitle && `- ${msg.positionTitle}`}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {msg.recipientName && `To: ${msg.recipientName} • `}
                              {new Date(msg.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="text-xs px-2 py-1 bg-slate-200 text-slate-700 rounded">
                              {msg.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery && searchResults.length === 0 && !searching && (
                  <p className="text-sm text-slate-500 text-center py-4">No emails found</p>
                )}
              </div>
            </Card>
          )}


          {/* Email Details Card */}
          <Card className="bg-white border-slate-200/60 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-slate-50 to-gray-100/80 border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Email Details</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                {messageType === 'NEW' ? 'Enter recipient and position information' : 'Following up on your previous email'}
              </p>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-slate-900">
                  Recipient Email <span className="text-slate-600">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="hiring@company.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="h-10 sm:h-11 text-sm sm:text-base bg-white border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-slate-900">Recipient Name</Label>
                <Input
                  placeholder="Jane Smith"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="h-10 sm:h-11 text-sm sm:text-base bg-white border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium text-slate-900">
                    Position
                  </Label>
                  <Input
                    placeholder="e.g., Senior Software Engineer (or leave blank for general inquiry)"
                    value={positionTitle}
                    onChange={(e) => setPositionTitle(e.target.value)}
                    className="h-10 sm:h-11 text-sm sm:text-base bg-white border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium text-slate-900">
                    Company <span className="text-slate-600">*</span>
                  </Label>
                  <Input
                    placeholder="Tech Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="h-10 sm:h-11 text-sm sm:text-base bg-white border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                  />
                </div>
              </div>

              {!positionTitle && (
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium text-slate-900">Areas of Interest</Label>
                  <Input
                    placeholder="e.g., Backend Development, Cloud Infrastructure, AI/ML"
                    value={areasOfInterest}
                    onChange={(e) => setAreasOfInterest(e.target.value)}
                    className="h-10 sm:h-11 text-sm sm:text-base bg-white border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                  />
                  <p className="text-xs text-slate-500">Specify areas you&apos;re interested in to help tailor the message</p>
                </div>
              )}

              <AnimatePresence mode="wait">
                {messageType === 'NEW' && (
                  <motion.div
                    key="new-email-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="space-y-4 sm:space-y-5">
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium text-slate-900">Job Description</Label>
                        <Textarea
                          placeholder="Paste the job description here..."
                          className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base bg-white border-slate-200 rounded-lg resize-none hover:border-slate-300 transition-colors"
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium text-slate-900">Company Info</Label>
                        <Textarea
                          placeholder="What interests you about this company?"
                          className="min-h-[60px] sm:min-h-[80px] text-sm sm:text-base bg-white border-slate-200 rounded-lg resize-none hover:border-slate-300 transition-colors"
                          value={companyDescription}
                          onChange={(e) => setCompanyDescription(e.target.value)}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Extra Content Field - Only shown in follow-up mode */}
              {messageType === 'FOLLOW_UP' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium text-slate-900">Extra Content</Label>
                    <Textarea
                      placeholder="Add any additional context or information to include in this follow-up email..."
                      className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base bg-white border-slate-200 rounded-lg resize-none hover:border-slate-300 transition-colors"
                      value={extraContent}
                      onChange={(e) => setExtraContent(e.target.value)}
                    />
                    <p className="text-xs text-slate-500">
                      This extra context will be used by the AI to enhance your follow-up email with new angles or information
                    </p>
                  </div>
                </motion.div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={loading || !recipientEmail || !companyName || !hasAnyApiKey || !llmModel}
                className="w-full h-11 sm:h-12 text-sm sm:text-base bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    <span className="hidden sm:inline">Generating email...</span>
                    <span className="sm:hidden">Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Generate Email
                  </>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Output Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="bg-white border-slate-200/60 shadow-sm h-full overflow-hidden">
            {generatedSubject && generatedBody ? (
              <>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 border-b border-emerald-100/50 px-4 sm:px-6 py-3 sm:py-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                        Your Email
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                        {savedId ? 'Saved to history' : 'Review and save if needed'}
                      </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        onClick={copyToClipboard}
                        size="sm"
                        variant="outline"
                        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors h-8 sm:h-9 text-xs sm:text-sm flex-1 sm:flex-none"
                      >
                        <Copy className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Copy
                      </Button>
                      {savedId ? (
                        <Button
                          onClick={handleUnsave}
                          disabled={saving}
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 transition-colors h-8 sm:h-9 text-xs sm:text-sm flex-1 sm:flex-none"
                        >
                          {saving ? <Loader2 className="mr-1 sm:mr-2 h-3 w-3 animate-spin" /> : <Trash2 className="mr-1 sm:mr-2 h-3 w-3" />}
                          Remove
                        </Button>
                      ) : (
                        <div className="flex gap-2 flex-1 sm:flex-none">
                          <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                            <SelectTrigger className="h-8 sm:h-9 w-[80px] sm:w-[100px] text-xs sm:text-sm border-emerald-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SENT">Sent</SelectItem>
                              <SelectItem value="DRAFT">Draft</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            onClick={handleSave}
                            disabled={saving}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white transition-colors h-8 sm:h-9 text-xs sm:text-sm"
                          >
                            {saving ? <Loader2 className="mr-1 sm:mr-2 h-3 w-3 animate-spin" /> : <Save className="mr-1 sm:mr-2 h-3 w-3" />}
                            <span className="hidden sm:inline">Save to History</span>
                            <span className="sm:hidden">Save</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium text-slate-900">Subject Line</Label>
                    <Input
                      value={generatedSubject}
                      onChange={(e) => setGeneratedSubject(e.target.value)}
                      className="h-10 sm:h-11 text-sm sm:text-base bg-white border-slate-200 rounded-lg font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium text-slate-900">Email Body</Label>
                    <Textarea
                      value={generatedBody}
                      onChange={(e) => setGeneratedBody(e.target.value)}
                      className="min-h-[400px] sm:min-h-[500px] lg:min-h-[580px] text-sm sm:text-base bg-white border-slate-200 rounded-lg resize-none leading-relaxed"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full min-h-[500px] sm:min-h-[650px] lg:min-h-[780px]">
                {/* Previous Email Card - Only shown in follow-up mode when email is loaded */}
                {previousMessageBody && messageType === 'FOLLOW_UP' ? (
                  <div className="h-full flex flex-col">
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50/80 border-b border-amber-100/50 px-4 sm:px-6 py-3 sm:py-4">
                      <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                        Previous Email
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5">This is the email you sent previously</p>
                    </div>
                    <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium text-slate-900">Subject</Label>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 sm:p-3">
                          <p className="text-xs sm:text-sm text-slate-700">{previousMessageSubject}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium text-slate-900">Body</Label>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4">
                          <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{previousMessageBody}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-6 sm:p-12">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.35 }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-[20px] bg-gradient-to-br from-slate-100 to-gray-200 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-inner">
                        <Mail className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-slate-600" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">Ready to Send</h3>
                      <p className="text-sm sm:text-base text-slate-600 max-w-sm mx-auto leading-relaxed">
                        Fill in the required fields and click Generate Email to create your professional job application email
                      </p>
                      {savedMessageId && (
                        <p className="text-xs text-slate-500 mt-4 font-mono">
                          Last saved: {savedMessageId}
                        </p>
                      )}
                    </motion.div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
