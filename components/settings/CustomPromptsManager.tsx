'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CustomPrompt {
  coverLetter?: string;
  linkedIn?: string;
  email?: string;
}

const PLACEHOLDER_TEXT = 'Default prompt is being used';

const DEFAULT_PROMPTS = {
  coverLetter: `You are an expert cover letter writer. Create a professional, compelling cover letter that:
- Highlights relevant experience and skills from the resume
- Shows genuine enthusiasm for the role and company
- Demonstrates understanding of the job requirements
- Uses a professional yet personable tone
- Includes specific examples where possible`,

  linkedIn: `You are an expert at writing LinkedIn outreach messages. Create a concise, professional message that:
- Is friendly and personable
- Shows genuine interest in the opportunity
- Highlights relevant qualifications briefly
- Includes a clear call to action
- Respects LinkedIn's character limits`,

  email: `You are an expert at writing professional job application emails. Create an email that:
- Has a clear, professional subject line
- Uses appropriate formal business email structure
- Highlights key qualifications concisely
- Shows enthusiasm for the opportunity
- Includes a professional closing`,
};

export default function CustomPromptsManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prompts, setPrompts] = useState<CustomPrompt>({});

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/prompts');
      if (response.ok) {
        const data = await response.json();
        setPrompts({
          coverLetter: data.coverLetter || '',
          linkedIn: data.linkedIn || '',
          email: data.email || '',
        });
      }
    } catch (error) {
      console.error('Failed to load prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompts),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save prompts');
      }

      toast({
        title: 'Success',
        description: 'Custom prompts saved successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = (tab: keyof typeof DEFAULT_PROMPTS) => {
    setPrompts((prev) => ({
      ...prev,
      [tab]: DEFAULT_PROMPTS[tab],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Custom Prompts</CardTitle>
          <CardDescription>
            Customize the AI prompts for each type of content generation. Leave blank to use default prompts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="coverLetter">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="coverLetter">Cover Letter</TabsTrigger>
              <TabsTrigger value="linkedIn">LinkedIn</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>

            <TabsContent value="coverLetter" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Cover Letter System Prompt</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReset('coverLetter')}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Default
                  </Button>
                </div>
                <Textarea
                  value={prompts.coverLetter || ''}
                  onChange={(e) =>
                    setPrompts((prev) => ({ ...prev, coverLetter: e.target.value }))
                  }
                  placeholder={PLACEHOLDER_TEXT}
                  className="min-h-[200px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  This prompt guides how the AI generates cover letters. It will be used as the system prompt.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="linkedIn" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>LinkedIn System Prompt</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReset('linkedIn')}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Default
                  </Button>
                </div>
                <Textarea
                  value={prompts.linkedIn || ''}
                  onChange={(e) =>
                    setPrompts((prev) => ({ ...prev, linkedIn: e.target.value }))
                  }
                  placeholder={PLACEHOLDER_TEXT}
                  className="min-h-[200px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  This prompt guides how the AI generates LinkedIn messages. Keep it concise for shorter outputs.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Email System Prompt</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReset('email')}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Default
                  </Button>
                </div>
                <Textarea
                  value={prompts.email || ''}
                  onChange={(e) =>
                    setPrompts((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder={PLACEHOLDER_TEXT}
                  className="min-h-[200px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  This prompt guides how the AI generates email messages including subject lines.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Custom Prompts
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
        <p className="text-sm text-blue-600 dark:text-blue-400">
          <strong>Tip:</strong> Custom prompts override the default behavior. You can use placeholders like
          {' '}<code className="bg-blue-500/20 px-1 rounded">{'{{resume}}'}</code>,{' '}
          <code className="bg-blue-500/20 px-1 rounded">{'{{jobDescription}}'}</code>, and{' '}
          <code className="bg-blue-500/20 px-1 rounded">{'{{companyName}}'}</code> in your prompts.
        </p>
      </div>
    </div>
  );
}
