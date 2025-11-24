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
import { Loader2, Copy, MessageSquare } from 'lucide-react';

interface Resume {
  id: string;
  title: string;
}

export default function LinkedInPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [llmModel, setLlmModel] = useState('gpt-4o-mini');
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
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-3">LinkedIn Messages</h1>
        <p className="text-lg text-slate-600">
          Create personalized LinkedIn outreach messages that get responses from hiring managers and recruiters.
        </p>
      </motion.div>

      <Tabs value={messageType} onValueChange={(v: any) => setMessageType(v)} className="mb-6">
        <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200 p-1 rounded-[20px]">
          <TabsTrigger
            value="NEW"
            className="rounded-[16px] data-[state=active]:bg-slate-900 data-[state=active]:text-white"
          >
            New Message
          </TabsTrigger>
          <TabsTrigger
            value="FOLLOW_UP"
            className="rounded-[16px] data-[state=active]:bg-slate-900 data-[state=active]:text-white"
          >
            Follow-up
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
            <div className="p-6 space-y-5">
              <div>
                <h2 className="text-xl font-display font-semibold text-slate-900 mb-1">Message Details</h2>
                <p className="text-sm text-slate-600">
                  {messageType === 'NEW' ? 'Enter recipient and job information' : 'Following up on a previous message'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Select Resume</Label>
                  <Select value={selectedResumeId} onValueChange={setSelectedResumeId} disabled={loadingResumes}>
                    <SelectTrigger className="h-11 bg-white border-slate-200 rounded-[16px]">
                      <SelectValue placeholder={loadingResumes ? "Loading..." : "Choose a resume"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-[16px]">
                      {resumes.map((resume) => (
                        <SelectItem key={resume.id} value={resume.id} className="rounded-[12px]">{resume.title}</SelectItem>
                      ))}
                      {resumes.length === 0 && (<SelectItem value="none" disabled>No resumes - Upload in Settings</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">AI Model</Label>
                  <Select value={llmModel} onValueChange={setLlmModel}>
                    <SelectTrigger className="h-11 bg-white border-slate-200 rounded-[16px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-[16px]">
                      {[
                        ['gpt-4o', 'GPT-4o'],
                        ['gpt-4o-mini', 'GPT-4o Mini'],
                        ['claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet'],
                        ['claude-3-5-haiku-20241022', 'Claude 3.5 Haiku'],
                        ['gemini-2.0-flash-exp', 'Gemini 2.0 Flash'],
                        ['gemini-exp-1206', 'Gemini Exp']
                      ].map(([v, l]) => (
                        <SelectItem key={v} value={v} className="rounded-[12px]">{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {messageType === 'NEW' && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">LinkedIn URL (Optional)</Label>
                      <Input
                        placeholder="https://linkedin.com/in/username"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        className="h-11 bg-white border-slate-200 rounded-[16px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Recipient Name (Optional)</Label>
                      <Input
                        placeholder="John Doe"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="h-11 bg-white border-slate-200 rounded-[16px]"
                      />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      Position <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Software Engineer"
                      value={positionTitle}
                      onChange={(e) => setPositionTitle(e.target.value)}
                      className="h-11 bg-white border-slate-200 rounded-[16px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      Company <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Tech Corp"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="h-11 bg-white border-slate-200 rounded-[16px]"
                    />
                  </div>
                </div>

                {messageType === 'NEW' && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Job Description (Optional)</Label>
                      <Textarea
                        placeholder="Brief job description..."
                        className="min-h-[90px] bg-white border-slate-200 rounded-[16px] resize-none"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Company Info (Optional)</Label>
                      <Textarea
                        placeholder="What interests you about this company?"
                        className="min-h-[70px] bg-white border-slate-200 rounded-[16px] resize-none"
                        value={companyDescription}
                        onChange={(e) => setCompanyDescription(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Message Length</Label>
                  <Select value={length} onValueChange={(value: any) => setLength(value)}>
                    <SelectTrigger className="h-11 bg-white border-slate-200 rounded-[16px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-[16px]">
                      {[
                        ['CONCISE', 'Concise (Recommended)'],
                        ['MEDIUM', 'Medium'],
                        ['LONG', 'Long']
                      ].map(([v, l]) => (
                        <SelectItem key={v} value={v} className="rounded-[12px]">{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={loading || !positionTitle || !companyName}
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-[20px] transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Message'
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm h-full">
            <div className="p-6">
              {generatedMessage ? (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-display font-semibold text-slate-900 mb-1">Generated Message</h2>
                    <p className="text-sm text-slate-600">Review and edit your message before sending</p>
                  </div>

                  <div className="space-y-4">
                    <Textarea
                      value={generatedMessage}
                      onChange={(e) => setGeneratedMessage(e.target.value)}
                      className="min-h-[560px] bg-white border-slate-200 rounded-[16px] resize-none leading-relaxed"
                    />

                    <div className="flex gap-3">
                      <Button
                        onClick={copyToClipboard}
                        variant="outline"
                        className="flex-1 h-11 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white font-medium rounded-[16px] transition-colors"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy to Clipboard
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[620px]">
                  <div className="w-20 h-20 rounded-[20px] bg-slate-100 flex items-center justify-center mb-4">
                    <MessageSquare className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-slate-900 mb-2">No Message Yet</h3>
                  <p className="text-sm text-slate-600 text-center max-w-sm">
                    Fill in the required fields and click Generate Message to create your personalized LinkedIn outreach.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
