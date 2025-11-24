'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

interface Preferences {
  defaultLlmModel: string;
  defaultLength: string;
  autoSave: boolean;
  defaultStatus: string;
}

export default function UserPreferencesManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({
    defaultLlmModel: 'gpt-4o',
    defaultLength: 'MEDIUM',
    autoSave: true,
    defaultStatus: 'SENT',
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/preferences');
      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save preferences');
      }

      toast({
        title: 'Success',
        description: 'Preferences saved successfully!',
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
          <CardTitle>Default Settings</CardTitle>
          <CardDescription>
            Set your default preferences for content generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Default AI Model</Label>
            <Select
              value={preferences.defaultLlmModel}
              onValueChange={(value) =>
                setPreferences((prev) => ({ ...prev, defaultLlmModel: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o (OpenAI)</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini (OpenAI)</SelectItem>
                <SelectItem value="claude-3-5-sonnet-20241022">
                  Claude 3.5 Sonnet (Anthropic)
                </SelectItem>
                <SelectItem value="claude-3-5-haiku-20241022">
                  Claude 3.5 Haiku (Anthropic)
                </SelectItem>
                <SelectItem value="gemini-2.0-flash-exp">
                  Gemini 2.0 Flash (Google)
                </SelectItem>
                <SelectItem value="gemini-exp-1206">Gemini Exp (Google)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This model will be selected by default in all generators
            </p>
          </div>

          <div className="space-y-2">
            <Label>Default Content Length</Label>
            <Select
              value={preferences.defaultLength}
              onValueChange={(value) =>
                setPreferences((prev) => ({ ...prev, defaultLength: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONCISE">Concise</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LONG">Long</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Default length for generated content
            </p>
          </div>

          <div className="space-y-2">
            <Label>Default Status</Label>
            <Select
              value={preferences.defaultStatus}
              onValueChange={(value) =>
                setPreferences((prev) => ({ ...prev, defaultStatus: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Default status when saving generated content
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Behavior Settings</CardTitle>
          <CardDescription>
            Configure how the application behaves
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-save Generated Content</Label>
              <p className="text-sm text-muted-foreground">
                Automatically save generated content to history
              </p>
            </div>
            <Switch
              checked={preferences.autoSave}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({ ...prev, autoSave: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Preferences
          </>
        )}
      </Button>

      <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
        <p className="text-sm text-blue-600 dark:text-blue-400">
          <strong>Note:</strong> These preferences will be applied as defaults across all generators.
          You can still override them for individual generations.
        </p>
      </div>
    </div>
  );
}
