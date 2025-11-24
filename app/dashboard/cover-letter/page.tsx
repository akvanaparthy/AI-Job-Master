'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, Download, Sparkles, FileText, Briefcase } from 'lucide-react';

interface Resume {
  id: string;
  title: string;
}

export default function CoverLetterPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [llmModel, setLlmModel] = useState('gpt-4o');
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [length, setLength] = useState<'CONCISE' | 'MEDIUM' | 'LONG'>('MEDIUM');
  const [generatedLetter, setGeneratedLetter] = useState('');

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
    if (!jobDescription) {
      toast({
        title: 'Error',
        description: 'Please enter a job description',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
    toast({
      title: 'Copied',
      description: 'Cover letter copied to clipboard',
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-display font-bold text-slate-900">Cover Letter Generator</h1>
            <p className="text-slate-600 mt-1">
              Generate personalized cover letters powered by AI
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-blue-50/30">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Job Details
              </CardTitle>
              <CardDescription>
                Fill in the information below to generate your cover letter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              {/* Resume Selection */}
              <div className="space-y-2">
                <Label htmlFor="resume" className="text-sm font-medium text-slate-700">
                  Resume
                </Label>
                <Select
                  value={selectedResumeId}
                  onValueChange={setSelectedResumeId}
                  disabled={loadingResumes}
                >
                  <SelectTrigger id="resume" className="bg-white">
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
                <p className="text-xs text-slate-500">
                  Upload resumes in Settings
                </p>
              </div>

              {/* AI Model */}
              <div className="space-y-2">
                <Label htmlFor="model" className="text-sm font-medium text-slate-700">
                  AI Model
                </Label>
                <Select value={llmModel} onValueChange={setLlmModel}>
                  <SelectTrigger id="model" className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">GPT-4o (OpenAI)</SelectItem>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini (OpenAI)</SelectItem>
                    <SelectItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</SelectItem>
                    <SelectItem value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</SelectItem>
                    <SelectItem value="gemini-2.0-flash-exp">Gemini 2.0 Flash</SelectItem>
                    <SelectItem value="gemini-exp-1206">Gemini Exp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Position & Company */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position" className="text-sm font-medium text-slate-700">
                    Position Title
                  </Label>
                  <Input
                    id="position"
                    placeholder="Senior Engineer"
                    value={positionTitle}
                    onChange={(e) => setPositionTitle(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium text-slate-700">
                    Company Name
                  </Label>
                  <Input
                    id="company"
                    placeholder="Tech Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="bg-white"
                  />
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-2">
                <Label htmlFor="jobDescription" className="text-sm font-medium text-slate-700">
                  Job Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Paste the full job description here..."
                  className="min-h-[160px] bg-white resize-none"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              {/* Company Description */}
              <div className="space-y-2">
                <Label htmlFor="companyDescription" className="text-sm font-medium text-slate-700">
                  Company Description
                </Label>
                <Textarea
                  id="companyDescription"
                  placeholder="What do you know about the company? (Optional)"
                  className="min-h-[80px] bg-white resize-none"
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                />
              </div>

              {/* Length */}
              <div className="space-y-2">
                <Label htmlFor="length" className="text-sm font-medium text-slate-700">
                  Length
                </Label>
                <Select value={length} onValueChange={(value: any) => setLength(value)}>
                  <SelectTrigger id="length" className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONCISE">Concise (~250 words)</SelectItem>
                    <SelectItem value="MEDIUM">Medium (~400 words)</SelectItem>
                    <SelectItem value="LONG">Long (~600 words)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={loading || !jobDescription}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/30 h-12"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Cover Letter
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Output */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-blue-50/30">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Generated Cover Letter
              </CardTitle>
              <CardDescription>
                Your AI-generated cover letter will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {generatedLetter ? (
                <div className="space-y-4">
                  <Textarea
                    value={generatedLetter}
                    onChange={(e) => setGeneratedLetter(e.target.value)}
                    className="min-h-[580px] bg-white font-sans text-sm leading-relaxed resize-none"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      className="border-green-200 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[580px] text-slate-400">
                  <FileText className="w-20 h-20 mb-4 opacity-20" />
                  <p className="text-center">
                    Fill in the job details and click generate<br />
                    <span className="text-sm">Your cover letter will appear here</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
