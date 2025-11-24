'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, Send } from 'lucide-react';

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

  // Form fields
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [length, setLength] = useState<'CONCISE' | 'MEDIUM' | 'LONG'>('CONCISE');
  const [status, setStatus] = useState<'DRAFT' | 'SENT'>('SENT');
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

  const handleGenerate = async () => {
    if (!positionTitle || !companyName) {
      toast({
        title: 'Error',
        description: 'Please fill in position and company name',
        variant: 'destructive',
      });
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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate message');
      }

      const data = await response.json();
      setGeneratedMessage(data.content);

      toast({
        title: 'Success',
        description: 'LinkedIn message generated successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate message',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedMessage);
    toast({
      title: 'Copied',
      description: 'Message copied to clipboard',
    });
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">LinkedIn Message Generator</h1>
        <p className="text-muted-foreground mt-2">
          Craft personalized LinkedIn outreach messages
        </p>
      </div>

      <Tabs value={messageType} onValueChange={(v: any) => setMessageType(v)}>
        <TabsList className="mb-6">
          <TabsTrigger value="NEW">New Message</TabsTrigger>
          <TabsTrigger value="FOLLOW_UP">Follow-up</TabsTrigger>
        </TabsList>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Message Details</CardTitle>
              <CardDescription>
                {messageType === 'NEW'
                  ? 'Enter recipient and job information'
                  : 'Follow up on a previous message'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Resume</Label>
                <Select
                  value={selectedResumeId}
                  onValueChange={setSelectedResumeId}
                  disabled={loadingResumes}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingResumes ? "Loading..." : "Select a resume"} />
                  </SelectTrigger>
                  <SelectContent>
                    {resumes.map((resume) => (
                      <SelectItem key={resume.id} value={resume.id}>
                        {resume.title}
                      </SelectItem>
                    ))}
                    {resumes.length === 0 && (
                      <SelectItem value="none" disabled>No resumes uploaded</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>AI Model</Label>
                <Select value={llmModel} onValueChange={setLlmModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">GPT-4o (OpenAI)</SelectItem>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini (OpenAI)</SelectItem>
                    <SelectItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Anthropic)</SelectItem>
                    <SelectItem value="claude-3-5-haiku-20241022">Claude 3.5 Haiku (Anthropic)</SelectItem>
                    <SelectItem value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Google)</SelectItem>
                    <SelectItem value="gemini-exp-1206">Gemini Exp (Google)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {messageType === 'NEW' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                    <Input
                      id="linkedinUrl"
                      placeholder="https://linkedin.com/in/username"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipientName">Recipient Name</Label>
                    <Input
                      id="recipientName"
                      placeholder="e.g., John Doe"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="position">Position Title *</Label>
                <Input
                  id="position"
                  placeholder="e.g., Senior Software Engineer"
                  value={positionTitle}
                  onChange={(e) => setPositionTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company Name *</Label>
                <Input
                  id="company"
                  placeholder="e.g., Tech Corp"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              {messageType === 'NEW' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="jobDescription">Job Description (Optional)</Label>
                    <Textarea
                      id="jobDescription"
                      placeholder="Brief job description..."
                      className="min-h-[100px]"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyDescription">Company Info (Optional)</Label>
                    <Textarea
                      id="companyDescription"
                      placeholder="What interests you about this company?"
                      className="min-h-[80px]"
                      value={companyDescription}
                      onChange={(e) => setCompanyDescription(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Message Length</Label>
                <Select value={length} onValueChange={(value: any) => setLength(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONCISE">Concise</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LONG">Long</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading || !positionTitle || !companyName}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Message'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Message</CardTitle>
              <CardDescription>
                Your LinkedIn message will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedMessage ? (
                <div className="space-y-4">
                  <Textarea
                    value={generatedMessage}
                    onChange={(e) => setGeneratedMessage(e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Send className="mr-2 h-4 w-4" />
                      Save to History
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Max 2 messages per recipient (1 new + 1 follow-up)
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  Fill in the details and click generate
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}
