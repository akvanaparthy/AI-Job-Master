'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, Send } from 'lucide-react';

export default function EmailPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState<'NEW' | 'FOLLOW_UP'>('NEW');

  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [length, setLength] = useState<'CONCISE' | 'MEDIUM' | 'LONG'>('MEDIUM');
  const [status, setStatus] = useState<'DRAFT' | 'SENT'>('SENT');
  const [generatedSubject, setGeneratedSubject] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');

  const handleGenerate = async () => {
    if (!recipientEmail || !positionTitle || !companyName) {
      toast({
        title: 'Error',
        description: 'Please fill in required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (messageType === 'NEW') {
        setGeneratedSubject(`Application for ${positionTitle} Position at ${companyName}`);
        setGeneratedBody(`Dear ${recipientName || 'Hiring Manager'},

I am writing to express my strong interest in the ${positionTitle} position at ${companyName}. With my background and skills, I am confident I would be a valuable addition to your team.

${companyDescription ? `I am particularly impressed by ${companyName}'s ${companyDescription.substring(0, 100)}...` : ''}

${jobDescription ? `The requirements outlined in the job description align well with my experience in ${jobDescription.substring(0, 100)}...` : ''}

I have attached my resume for your review. I would welcome the opportunity to discuss how my skills and experience can contribute to ${companyName}'s continued success.

Thank you for considering my application. I look forward to hearing from you.

Best regards,
[Your Name]
[Your Phone]
[Your LinkedIn]`);
      } else {
        setGeneratedSubject(`Following up: ${positionTitle} Application`);
        setGeneratedBody(`Dear ${recipientName || 'Hiring Manager'},

I wanted to follow up on my application for the ${positionTitle} position at ${companyName}, which I submitted on [date].

I remain very interested in this opportunity and believe my qualifications would make me a strong fit for your team.

If you need any additional information or would like to schedule a conversation, please don't hesitate to reach out.

Thank you for your time and consideration.

Best regards,
[Your Name]`);
      }

      toast({
        title: 'Success',
        description: 'Email generated successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate email',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const fullEmail = `Subject: ${generatedSubject}\n\n${generatedBody}`;
    navigator.clipboard.writeText(fullEmail);
    toast({
      title: 'Copied',
      description: 'Email copied to clipboard',
    });
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Email Generator</h1>
        <p className="text-muted-foreground mt-2">
          Generate professional job application emails
        </p>
      </div>

      <Tabs value={messageType} onValueChange={(v: any) => setMessageType(v)}>
        <TabsList className="mb-6">
          <TabsTrigger value="NEW">New Email</TabsTrigger>
          <TabsTrigger value="FOLLOW_UP">Follow-up</TabsTrigger>
        </TabsList>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Email Details</CardTitle>
              <CardDescription>
                Enter recipient and job information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipientEmail">Recipient Email *</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  placeholder="recruiter@company.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient Name</Label>
                <Input
                  id="recipientName"
                  placeholder="e.g., Jane Smith"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>

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
                      placeholder="Paste job description or key requirements..."
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
                <Label>Email Length</Label>
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
                disabled={loading || !recipientEmail || !positionTitle || !companyName}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Email'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Email</CardTitle>
              <CardDescription>
                Your email with subject and body
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedSubject && generatedBody ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Subject Line</Label>
                    <Input
                      value={generatedSubject}
                      onChange={(e) => setGeneratedSubject(e.target.value)}
                      className="font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Body</Label>
                    <Textarea
                      value={generatedBody}
                      onChange={(e) => setGeneratedBody(e.target.value)}
                      className="min-h-[400px] font-mono text-sm"
                    />
                  </div>
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
                </div>
              ) : (
                <div className="flex items-center justify-center h-[500px] text-muted-foreground">
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
