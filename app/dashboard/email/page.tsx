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
import { Loader2, Copy, Mail } from 'lucide-react';

interface Resume {
  id: string;
  title: string;
}

export default function EmailPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [llmModel, setLlmModel] = useState('gpt-4o');
  const [messageType, setMessageType] = useState<'NEW' | 'FOLLOW_UP'>('NEW');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [length, setLength] = useState<'CONCISE' | 'MEDIUM' | 'LONG'>('MEDIUM');
  const [generatedSubject, setGeneratedSubject] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');

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
    if (!recipientEmail || !positionTitle || !companyName) {
      toast({ title: 'Error', description: 'Please fill in required fields', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/generate/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: selectedResumeId || undefined,
          messageType,
          recipientEmail,
          recipientName: recipientName || undefined,
          positionTitle,
          companyName,
          jobDescription: jobDescription || undefined,
          companyDescription: companyDescription || undefined,
          length,
          llmModel,
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

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-3">Professional Email Generator</h1>
        <p className="text-lg text-slate-600">
          Create compelling job application emails that get responses from recruiters and hiring managers.
        </p>
      </motion.div>

      <Tabs value={messageType} onValueChange={(v: any) => setMessageType(v)} className="mb-6">
        <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200 p-1 rounded-[20px]">
          <TabsTrigger
            value="NEW"
            className="rounded-[16px] data-[state=active]:bg-slate-900 data-[state=active]:text-white"
          >
            New Email
          </TabsTrigger>
          <TabsTrigger
            value="FOLLOW_UP"
            className="rounded-[16px] data-[state=active]:bg-slate-900 data-[state=active]:text-white"
          >
            Follow-up Email
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
                <h2 className="text-xl font-display font-semibold text-slate-900 mb-1">Email Details</h2>
                <p className="text-sm text-slate-600">
                  {messageType === 'NEW' ? 'Enter recipient and position information' : 'Following up on your previous email'}
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
                        <SelectItem key={resume.id} value={resume.id} className="rounded-[12px]">
                          {resume.title}
                        </SelectItem>
                      ))}
                      {resumes.length === 0 && (
                        <SelectItem value="none" disabled>No resumes - Upload in Settings</SelectItem>
                      )}
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

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Recipient Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="hiring@company.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="h-11 bg-white border-slate-200 rounded-[16px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Recipient Name (Optional)</Label>
                  <Input
                    placeholder="Jane Smith"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="h-11 bg-white border-slate-200 rounded-[16px]"
                  />
                </div>

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
                        placeholder="Paste the job description here..."
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
                  <Label className="text-sm font-medium text-slate-700">Email Length</Label>
                  <Select value={length} onValueChange={(value: any) => setLength(value)}>
                    <SelectTrigger className="h-11 bg-white border-slate-200 rounded-[16px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-[16px]">
                      {[
                        ['CONCISE', 'Concise'],
                        ['MEDIUM', 'Medium'],
                        ['LONG', 'Detailed']
                      ].map(([v, l]) => (
                        <SelectItem key={v} value={v} className="rounded-[12px]">{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={loading || !recipientEmail || !positionTitle || !companyName}
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-[20px] transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Email'
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
              {generatedSubject && generatedBody ? (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-display font-semibold text-slate-900 mb-1">Generated Email</h2>
                    <p className="text-sm text-slate-600">Review and edit your email before sending</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Subject Line</Label>
                      <Input
                        value={generatedSubject}
                        onChange={(e) => setGeneratedSubject(e.target.value)}
                        className="h-11 bg-white border-slate-200 rounded-[16px] font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Email Body</Label>
                      <Textarea
                        value={generatedBody}
                        onChange={(e) => setGeneratedBody(e.target.value)}
                        className="min-h-[440px] bg-white border-slate-200 rounded-[16px] resize-none leading-relaxed"
                      />
                    </div>

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
                <div className="flex flex-col items-center justify-center h-full min-h-[600px]">
                  <div className="w-20 h-20 rounded-[20px] bg-slate-100 flex items-center justify-center mb-4">
                    <Mail className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-slate-900 mb-2">No Email Yet</h3>
                  <p className="text-sm text-slate-600 text-center max-w-sm">
                    Fill in the required fields and click Generate Email to create your professional job application email.
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
