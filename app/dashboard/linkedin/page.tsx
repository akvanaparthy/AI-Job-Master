'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, MessageSquare, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';

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
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [length, setLength] = useState<'CONCISE' | 'MEDIUM' | 'LONG'>('CONCISE');
  const [generatedMessage, setGeneratedMessage] = useState('');

  useEffect(() => {
    loadResumes();
    loadAvailableModels();
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

  const handleGenerate = async () => {
    if (!positionTitle || !companyName) {
      toast({ title: 'Error', description: 'Please fill in position and company name', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/generate/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: selectedResumeId || undefined,
          messageType,
          linkedinUrl: linkedinUrl || undefined,
          recipientName: recipientName || undefined,
          positionTitle,
          companyName,
          jobDescription: jobDescription || undefined,
          companyDescription: companyDescription || undefined,
          length,
          llmModel,
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
              className="rounded-lg px-6 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              New Message
            </TabsTrigger>
            <TabsTrigger
              value="FOLLOW_UP"
              className="rounded-lg px-6 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
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
                    {resumes.length === 0 && (<SelectItem value="none" disabled>No resumes - Upload in Settings</SelectItem>)}
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
                      availableModels.map((model) => (
                        <SelectItem key={model.value} value={model.value} className="rounded-md">
                          {model.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No models available</SelectItem>
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

          {/* Message Details Card */}
          <Card className="bg-white border-slate-200/60 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/80 border-b border-blue-100/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Message Details</h2>
              <p className="text-sm text-slate-600 mt-0.5">
                {messageType === 'NEW' ? 'Enter recipient and job information' : 'Following up on a previous message'}
              </p>
            </div>
            <div className="p-6 space-y-5">
              {messageType === 'NEW' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-900">LinkedIn URL (Optional)</Label>
                    <Input
                      placeholder="https://linkedin.com/in/username"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="h-11 bg-white border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-900">Recipient Name (Optional)</Label>
                    <Input
                      placeholder="John Doe"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="h-11 bg-white border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-900">
                    Position <span className="text-blue-600">*</span>
                  </Label>
                  <Input
                    placeholder="Software Engineer"
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

              {messageType === 'NEW' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-900">Job Description (Optional)</Label>
                    <Textarea
                      placeholder="Brief job description..."
                      className="min-h-[100px] bg-white border-slate-200 rounded-lg resize-none hover:border-slate-300 transition-colors"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-900">Company Info (Optional)</Label>
                    <Textarea
                      placeholder="What interests you about this company?"
                      className="min-h-[80px] bg-white border-slate-200 rounded-lg resize-none hover:border-slate-300 transition-colors"
                      value={companyDescription}
                      onChange={(e) => setCompanyDescription(e.target.value)}
                    />
                  </div>
                </>
              )}

              <Button
                onClick={handleGenerate}
                disabled={loading || !positionTitle || !companyName || !hasAnyApiKey || !llmModel}
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
                      <p className="text-sm text-slate-600 mt-0.5">Review and edit before sending</p>
                    </div>
                    <Button
                      onClick={copyToClipboard}
                      size="sm"
                      variant="outline"
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
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
              <div className="flex flex-col items-center justify-center h-full min-h-[780px] p-12">
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
                </motion.div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
