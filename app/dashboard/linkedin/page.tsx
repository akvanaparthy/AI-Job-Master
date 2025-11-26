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
import { Loader2, Copy, MessageSquare, Sparkles, CheckCircle2, RefreshCw, Save, Trash2, Search } from 'lucide-react';

interface Resume {
  id: string;
  title: string;
}

interface ModelOption {
  value: string;
  label: string;
  provider: string;
}

export default function LinkedInPage() {
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
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [areasOfInterest, setAreasOfInterest] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [length, setLength] = useState<'CONCISE' | 'MEDIUM' | 'LONG'>('CONCISE');
  const [status, setStatus] = useState<'DRAFT' | 'SENT' | 'DONE' | 'GHOST'>('SENT');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [savedId, setSavedId] = useState<string | null>(null);
  const [savedMessageId, setSavedMessageId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [parentMessageId, setParentMessageId] = useState<string | null>(null);
  const [previousMessageContent, setPreviousMessageContent] = useState('');
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

    if (isFollowup && messageId) {
      setMessageType('FOLLOW_UP');
      setParentMessageId(messageId);

      // Pre-fill form fields from URL params
      const positionTitleParam = params.get('positionTitle');
      const companyNameParam = params.get('companyName');
      const linkedinUrlParam = params.get('linkedinUrl');
      const recipientNameParam = params.get('recipientName');
      const jobDescriptionParam = params.get('jobDescription');
      const companyDescriptionParam = params.get('companyDescription');
      const resumeIdParam = params.get('resumeId');
      const lengthParam = params.get('length');
      const llmModelParam = params.get('llmModel');

      if (positionTitleParam) setPositionTitle(positionTitleParam);
      if (companyNameParam) setCompanyName(companyNameParam);
      if (linkedinUrlParam) setLinkedinUrl(linkedinUrlParam);
      if (recipientNameParam) setRecipientName(recipientNameParam);
      if (jobDescriptionParam) setJobDescription(jobDescriptionParam);
      if (companyDescriptionParam) setCompanyDescription(companyDescriptionParam);
      if (resumeIdParam) setSelectedResumeId(resumeIdParam);
      if (lengthParam) setLength(lengthParam as 'CONCISE' | 'MEDIUM' | 'LONG');
      if (llmModelParam) setLlmModel(llmModelParam);

      // Fetch the previous message content
      fetch(`/api/history/linkedin/${messageId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.message?.content) {
            setPreviousMessageContent(data.message.content);
          }
        })
        .catch((error) => console.error('Failed to load previous message:', error));

      toast({
        title: 'Follow-up mode',
        description: 'Form pre-filled with previous message details',
      });
    }
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
      console.error('Failed to load resumes:', error);
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
        if (data.models.length > 0 && !llmModel) {
          setLlmModel(data.models[0].value);
        }
      }
    } catch (error) {
      console.error('Failed to load available models:', error);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const response = await fetch(`/api/messages/search/linkedin?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.messages || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const loadMessageDetails = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/search/linkedin?messageId=${encodeURIComponent(messageId)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.message) {
          const msg = data.message;
          setCompanyName(msg.companyName);
          setPositionTitle(msg.positionTitle || '');
          setRecipientName(msg.recipientName || '');
          setLinkedinUrl(msg.linkedinUrl || '');
          setJobDescription(msg.jobDescription || '');
          setCompanyDescription(msg.companyDescription || '');
          setAreasOfInterest(msg.areasOfInterest || '');
          if (msg.resumeId) setSelectedResumeId(msg.resumeId);
          if (msg.length) setLength(msg.length);
          if (msg.llmModel) setLlmModel(msg.llmModel);
          setParentMessageId(msg.id);
          setPreviousMessageContent(msg.content);
          setSearchQuery('');
          setSearchResults([]);
          toast({
            title: 'Message Loaded',
            description: 'Previous message details loaded successfully',
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
    if (!companyName) {
      toast({ title: 'Error', description: 'Please fill in company name', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setSavedId(null); // Reset saved state
    setSavedMessageId(null);
    try {
      const response = await fetch('/api/generate/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: selectedResumeId || undefined,
          messageType,
          linkedinUrl: linkedinUrl || undefined,
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
      if (!response.ok) throw new Error((await response.json()).error || 'Failed to generate message');
      const data = await response.json();
      setGeneratedMessage(data.content);
      toast({ title: 'Success', description: 'LinkedIn message generated successfully!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to generate message', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedMessage);
      toast({ title: 'Copied', description: 'Message copied to clipboard' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to copy to clipboard. Please try again.', variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    if (!generatedMessage) return;
    setSaving(true);
    try {
      const response = await fetch('/api/generate/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: selectedResumeId || undefined,
          messageType,
          linkedinUrl: linkedinUrl || undefined,
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
      if (!response.ok) throw new Error('Failed to save message');
      const data = await response.json();
      setSavedId(data.id);
      setSavedMessageId(data.messageId);
      toast({
        title: 'Saved',
        description: data.messageId ? `LinkedIn message saved! Message ID: ${data.messageId}` : 'LinkedIn message saved to history!'
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save message', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleUnsave = async () => {
    if (!savedId) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/history/linkedin/${savedId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove message');
      setSavedId(null);
      toast({ title: 'Removed', description: 'LinkedIn message removed from history' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to remove message', variant: 'destructive' });
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
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
            <MessageSquare className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-[42px] font-bold text-slate-900 leading-tight">LinkedIn Messages</h1>
            <p className="text-lg text-slate-500">
              Create personalized outreach that gets responses from hiring managers and recruiters
            </p>
          </div>
        </div>
      </motion.div>

      {/* Message Type Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Tabs value={messageType} onValueChange={(v: any) => setMessageType(v)}>
          <TabsList className="bg-white border border-slate-200 p-1.5 rounded-xl shadow-sm">
            <TabsTrigger
              value="NEW"
              className="rounded-lg px-6 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 ease-in-out"
            >
              New Message
            </TabsTrigger>
            <TabsTrigger
              value="FOLLOW_UP"
              className="rounded-lg px-6 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 ease-in-out"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Follow-up
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-6"
        >
          {/* Configuration Card */}
          <Card className="bg-white border-slate-200/60 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/80 border-b border-blue-100/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Configuration
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">Set your preferences</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">Resume</Label>
                <Select value={selectedResumeId} onValueChange={setSelectedResumeId} disabled={loadingResumes}>
                  <SelectTrigger className="h-11 bg-white border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                    <SelectValue placeholder={loadingResumes ? "Loading..." : "Choose a resume"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    {resumes.map((resume) => (
                      <SelectItem key={resume.id} value={resume.id} className="rounded-md">{resume.title}</SelectItem>
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
                  <SelectTrigger className="h-11 bg-white border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
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
                  <p className="text-xs text-blue-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Add your API keys in Settings to enable AI generation
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">Message Length</Label>
                <Select value={length} onValueChange={(value: any) => setLength(value)}>
                  <SelectTrigger className="h-11 bg-white border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    {[
                      ['CONCISE', 'Concise (Recommended)'],
                      ['MEDIUM', 'Medium'],
                      ['LONG', 'Long']
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
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50/80 border-b border-purple-100/50 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Search className="w-5 h-5 text-purple-600" />
                  Search Previous Messages
                </h2>
                <p className="text-sm text-slate-600 mt-0.5">Find and load a previous message to follow up on</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by company, position, message ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="h-11 bg-white border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={searching || !searchQuery.trim()}
                    className="h-11 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                  >
                    {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
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
                  <p className="text-sm text-slate-500 text-center py-4">No messages found</p>
                )}
              </div>
            </Card>
          )}


          {/* Message Details Card */}
          <Card className="bg-white border-slate-200/60 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/80 border-b border-blue-100/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Message Details</h2>
              <p className="text-sm text-slate-600 mt-0.5">
                {messageType === 'NEW' ? 'Enter recipient and job information' : 'Following up on a previous message'}
              </p>
            </div>
            <div className="p-6 space-y-5">
              <AnimatePresence mode="wait">
                {messageType === 'NEW' && (
                  <motion.div
                    key="new-linkedin-recipient-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-900">LinkedIn URL</Label>
                        <Input
                          placeholder="https://linkedin.com/in/username"
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          className="h-11 bg-white border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-900">Recipient Name</Label>
                        <Input
                          placeholder="John Doe"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          className="h-11 bg-white border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-900">
                    Position
                  </Label>
                  <Input
                    placeholder="e.g., Senior Software Engineer (or leave blank for general inquiry)"
                    value={positionTitle}
                    onChange={(e) => setPositionTitle(e.target.value)}
                    className="h-11 bg-white border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-900">
                    Company <span className="text-blue-600">*</span>
                  </Label>
                  <Input
                    placeholder="Tech Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="h-11 bg-white border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                  />
                </div>
              </div>

              {!positionTitle && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-900">Areas of Interest</Label>
                  <Input
                    placeholder="e.g., Backend Development, Cloud Infrastructure, AI/ML"
                    value={areasOfInterest}
                    onChange={(e) => setAreasOfInterest(e.target.value)}
                    className="h-11 bg-white border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                  />
                  <p className="text-xs text-slate-500">Specify areas you&apos;re interested in to help tailor the message</p>
                </div>
              )}

              <AnimatePresence mode="wait">
                {messageType === 'NEW' && (
                  <motion.div
                    key="new-linkedin-job-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-900">Job Description</Label>
                        <Textarea
                          placeholder="Brief job description..."
                          className="min-h-[100px] bg-white border-slate-200 rounded-lg resize-none hover:border-slate-300 transition-colors"
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-900">Company Info</Label>
                        <Textarea
                          placeholder="What interests you about this company?"
                          className="min-h-[80px] bg-white border-slate-200 rounded-lg resize-none hover:border-slate-300 transition-colors"
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
                    <Label className="text-sm font-medium text-slate-900">Extra Content</Label>
                    <Textarea
                      placeholder="Add any additional context or information to include in this follow-up message..."
                      className="min-h-[100px] bg-white border-slate-200 rounded-lg resize-none hover:border-slate-300 transition-colors"
                      value={extraContent}
                      onChange={(e) => setExtraContent(e.target.value)}
                    />
                    <p className="text-xs text-slate-500">
                      This extra context will be used by the AI to enhance your follow-up message with new angles or information
                    </p>
                  </div>
                </motion.div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={loading || !companyName || !hasAnyApiKey || !llmModel}
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating message...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Message
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
            {generatedMessage ? (
              <>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 border-b border-emerald-100/50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        Your LinkedIn Message
                      </h2>
                      <p className="text-sm text-slate-600 mt-0.5">
                        {savedId ? 'Saved to history' : 'Review and save if needed'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={copyToClipboard}
                        size="sm"
                        variant="outline"
                        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                      {savedId ? (
                        <Button
                          onClick={handleUnsave}
                          disabled={saving}
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 transition-colors"
                        >
                          {saving ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Trash2 className="mr-2 h-3 w-3" />}
                          Remove
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                            <SelectTrigger className="h-8 w-[100px] border-emerald-200">
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
                            className="bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                          >
                            {saving ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Save className="mr-2 h-3 w-3" />}
                            Save to History
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <Textarea
                    value={generatedMessage}
                    onChange={(e) => setGeneratedMessage(e.target.value)}
                    className="min-h-[680px] bg-white border-slate-200 rounded-lg resize-none leading-relaxed"
                  />
                </div>
              </>
            ) : (
              <div className="h-full min-h-[780px]">
                {/* Previous Message Card - Only shown in follow-up mode when message is loaded */}
                {previousMessageContent && messageType === 'FOLLOW_UP' ? (
                  <div className="h-full flex flex-col">
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50/80 border-b border-amber-100/50 px-6 py-4">
                      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-amber-600" />
                        Previous Message
                      </h2>
                      <p className="text-sm text-slate-600 mt-0.5">This is the message you sent previously</p>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{previousMessageContent}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-12">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.35 }}
                      className="text-center"
                    >
                      <div className="w-24 h-24 rounded-[20px] bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <MessageSquare className="w-12 h-12 text-blue-600" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">Ready to Connect</h3>
                      <p className="text-slate-600 max-w-sm mx-auto leading-relaxed">
                        Fill in the required fields and click Generate Message to create your personalized LinkedIn outreach
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
