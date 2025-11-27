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
  followupReminderDays: number;
}

interface ModelOption {
  value: string;
  label: string;
  provider: string;
}

export default function UserPreferencesManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableModels, setAvailableModels] = useState<ModelOption[]>([]);
  const [preferences, setPreferences] = useState<Preferences>({
    defaultLlmModel: '',
    defaultLength: 'MEDIUM',
    autoSave: true,
    defaultStatus: 'SENT',
    followupReminderDays: 7,
  });

  useEffect(() => {
    loadPreferences();
    loadAvailableModels();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/preferences');
      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setPreferences({
            ...data.preferences,
            defaultLlmModel: data.preferences.defaultLlmModel || '',
          });
        }
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableModels = async () => {
    try {
      const response = await fetch('/api/settings/available-models');
      if (response.ok) {
        const data = await response.json();
        setAvailableModels(data.models || []);
      }
    } catch (error) {
      console.error('Failed to load available models:', error);
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
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg">Default Settings</CardTitle>
          <CardDescription className="text-sm">
            Set your default preferences for content generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          <div className="space-y-2">
            <Label className="text-sm sm:text-base">Default AI Model</Label>
            <Select
              value={preferences.defaultLlmModel}
              onValueChange={(value) =>
                setPreferences((prev) => ({ ...prev, defaultLlmModel: value }))
              }
              disabled={availableModels.length === 0}
            >
              <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
                <SelectValue placeholder={availableModels.length === 0 ? "No models available - Add API keys first" : "Select a model"} />
              </SelectTrigger>
              <SelectContent>
                {availableModels.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No models available - Add API keys in the API Keys tab
                  </SelectItem>
                ) : (
                  availableModels.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {availableModels.length === 0
                ? "Add API keys in the API Keys tab to see available models"
                : "This model will be selected by default in all generators"}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm sm:text-base">Default Content Length</Label>
            <Select
              value={preferences.defaultLength}
              onValueChange={(value) =>
                setPreferences((prev) => ({ ...prev, defaultLength: value }))
              }
            >
              <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
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
            <Label className="text-sm sm:text-base">Default Status</Label>
            <Select
              value={preferences.defaultStatus}
              onValueChange={(value) =>
                setPreferences((prev) => ({ ...prev, defaultStatus: value }))
              }
            >
              <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
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
        <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg">Behavior Settings</CardTitle>
          <CardDescription className="text-sm">
            Configure how the application behaves
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label className="text-sm sm:text-base">Auto-save Generated Content</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
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

          <div className="space-y-2">
            <Label className="text-sm sm:text-base">Follow-up Reminder Days</Label>
            <Select
              value={preferences.followupReminderDays.toString()}
              onValueChange={(value) =>
                setPreferences((prev) => ({ ...prev, followupReminderDays: parseInt(value) }))
              }
            >
              <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="5">5 days</SelectItem>
                <SelectItem value="7">7 days (recommended)</SelectItem>
                <SelectItem value="10">10 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              You&apos;ll be reminded to follow up on LinkedIn/Email messages after this many days
            </p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full h-10 sm:h-11 text-sm sm:text-base">
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

      <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
          <strong>Note:</strong> These preferences will be applied as defaults across all generators.
          You can still override them for individual generations.
        </p>
      </div>
    </div>
  );
}
