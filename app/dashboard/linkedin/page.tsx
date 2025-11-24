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

export default function LinkedInPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockMessage = messageType === 'NEW'
        ? `Hi ${recipientName || 'there'},

I hope this message finds you well! I came across the ${positionTitle} position at ${companyName} and was immediately drawn to it.

${companyDescription ? `What excites me most about ${companyName} is ${companyDescription.substring(0, 80)}...` : ''}

With my background in ${jobDescription.substring(0, 50) || 'the field'}..., I believe I could bring valuable expertise to your team.

Would you be open to a brief conversation about this opportunity?

Best regards,
[Your Name]`
        : `Hi ${recipientName || 'there'},

I wanted to follow up on my previous message about the ${positionTitle} role at ${companyName}.

I remain very interested in this opportunity and would love to discuss how my experience aligns with your needs.

Would you have time for a quick call this week?

Thanks for your consideration!
[Your Name]`;

      setGeneratedMessage(mockMessage);
      toast({
        title: 'Success',
        description: 'LinkedIn message generated successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate message',
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
