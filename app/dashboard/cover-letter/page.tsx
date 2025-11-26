'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, FileText, Sparkles, CheckCircle2, Save, Trash2 } from 'lucide-react';

interface Resume {
  id: string;
  title: string;
}

interface ModelOption {
  value: string;
  label: string;
  provider: string;
}

export default function CoverLetterPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [loadingModels, setLoadingModels] = useState(true);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [availableModels, setAvailableModels] = useState<ModelOption[]>([]);
  const [hasAnyApiKey, setHasAnyApiKey] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [llmModel, setLlmModel] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [length, setLength] = useState<'CONCISE' | 'MEDIUM' | 'LONG'>('MEDIUM');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadResumes();
    loadAvailableModels();
    loadUserPreferences();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadResumes = async () => {
    try {
      const response = await fetch('/api/settings/resumes');
      if (response.ok) {
        const data = await response.json();
        setResumes(data.resumes);
        const defaultResume = data.resumes.find((r: any) => r.isDefault);
        if (defaultResume) {
          setSelectedResumeId(defaultResume.id);
        }
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
      }
    } catch (error) {
      console.error('Failed to load available models:', error);
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
        }
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  };

  const handleGenerate = async () => {
    if (!jobDescription) {
      toast({
        title: 'Error',
        description: 'Please enter a job description',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setSavedId(null); // Reset saved state
    try {
      const response = await fetch('/api/generate/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: selectedResumeId || undefined,
          jobDescription,
          companyDescription: companyDescription || undefined,
          positionTitle: positionTitle || undefined,
          companyName: companyName || undefined,
          length,
          llmModel,
          saveToHistory: false, // Don't auto-save
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate cover letter');
      }

      const data = await response.json();
      setGeneratedLetter(data.content);

      toast({
        title: 'Success',
        description: 'Cover letter generated successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate cover letter',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedLetter) return;

    setSaving(true);
    try {
      const response = await fetch('/api/generate/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: selectedResumeId || undefined,
          jobDescription,
          companyDescription: companyDescription || undefined,
          positionTitle: positionTitle || undefined,
          companyName: companyName || undefined,
          length,
          llmModel,
          saveToHistory: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save cover letter');
      }

      const data = await response.json();
      setSavedId(data.id);

      toast({
        title: 'Saved',
        description: 'Cover letter saved to history!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save cover letter',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUnsave = async () => {
    if (!savedId) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/history/cover-letter/${savedId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove from history');
      }

      setSavedId(null);

      toast({
        title: 'Removed',
        description: 'Cover letter removed from history',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove from history',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLetter);
      toast({
        title: 'Copied',
        description: 'Cover letter copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard. Please try again.',
        variant: 'destructive',
      });
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
          <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-[42px] font-bold text-slate-900 leading-tight">Cover Letters</h1>
            <p className="text-lg text-slate-500">
              Craft compelling, personalized cover letters that showcase your perfect fit
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Configuration Card */}
          <Card className="bg-white border-slate-200/60 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/80 border-b border-amber-100/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
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
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Add your API keys in Settings to enable AI generation
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">Length</Label>
                <Select value={length} onValueChange={(value: any) => setLength(value)}>
                  <SelectTrigger className="h-11 bg-white border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    {[
                      ['CONCISE', 'Concise (~250 words)'],
                      ['MEDIUM', 'Medium (~400 words)'],
                      ['LONG', 'Detailed (~600 words)']
                    ].map(([v, l]) => (
                      <SelectItem key={v} value={v} className="rounded-md">{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Job Details Card */}
          <Card className="bg-white border-slate-200/60 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/80 border-b border-amber-100/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Job Details</h2>
              <p className="text-sm text-slate-600 mt-0.5">Tell us about the position</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-900">Position</Label>
                  <Input
                    placeholder="Software Engineer"
                    value={positionTitle}
                    onChange={(e) => setPositionTitle(e.target.value)}
                    className="h-11 bg-white border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-900">Company</Label>
                  <Input
                    placeholder="Tech Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="h-11 bg-white border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">
                  Job Description <span className="text-amber-600">*</span>
                </Label>
                <Textarea
                  placeholder="Paste the full job description here..."
                  className="min-h-[180px] bg-white border-slate-200 rounded-lg resize-none leading-relaxed hover:border-slate-300 transition-colors"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">Company Info (Optional)</Label>
                <Textarea
                  placeholder="What interests you about this company?"
                  className="min-h-[100px] bg-white border-slate-200 rounded-lg resize-none hover:border-slate-300 transition-colors"
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading || !jobDescription || !hasAnyApiKey || !llmModel}
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating your cover letter...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Cover Letter
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
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white border-slate-200/60 shadow-sm h-full overflow-hidden">
            {generatedLetter ? (
              <>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 border-b border-emerald-100/50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        Your Cover Letter
                      </h2>
                      <p className="text-sm text-slate-600 mt-0.5">
                        {savedId ? 'Saved to history' : 'Review and save to history if needed'}
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
                          size="sm"
                          variant="outline"
                          disabled={saving}
                          className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 transition-colors"
                        >
                          {saving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Remove
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSave}
                          size="sm"
                          disabled={saving}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                        >
                          {saving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="mr-2 h-4 w-4" />
                          )}
                          Save to History
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <Textarea
                    value={generatedLetter}
                    onChange={(e) => setGeneratedLetter(e.target.value)}
                    className="min-h-[680px] bg-white border-slate-200 rounded-lg resize-none leading-relaxed font-serif text-[15px]"
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[780px] p-12">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <div className="w-24 h-24 rounded-[20px] bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <FileText className="w-12 h-12 text-amber-600" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Ready to Create</h3>
                  <p className="text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Fill in the job details and click Generate to craft your personalized cover letter
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
