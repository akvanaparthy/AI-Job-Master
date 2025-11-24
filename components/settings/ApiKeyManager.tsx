'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Key, Check, X } from 'lucide-react';

export default function ApiKeyManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');

  const [hasOpenaiKey, setHasOpenaiKey] = useState(false);
  const [hasAnthropicKey, setHasAnthropicKey] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);

  useEffect(() => {
    loadApiKeyStatus();
  }, []);

  const loadApiKeyStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/api-keys');
      if (response.ok) {
        const data = await response.json();
        setHasOpenaiKey(data.hasOpenaiKey);
        setHasAnthropicKey(data.hasAnthropicKey);
        setHasGeminiKey(data.hasGeminiKey);
      }
    } catch (error) {
      console.error('Failed to load API key status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!openaiKey && !anthropicKey && !geminiKey) {
      toast({
        title: 'Error',
        description: 'Please enter at least one API key',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openaiApiKey: openaiKey || null,
          anthropicApiKey: anthropicKey || null,
          geminiApiKey: geminiKey || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save API keys');
      }

      const data = await response.json();

      toast({
        title: 'Success',
        description: 'API keys saved successfully!',
      });

      // Update status
      if (openaiKey) setHasOpenaiKey(true);
      if (anthropicKey) setHasAnthropicKey(true);
      if (geminiKey) setHasGeminiKey(true);

      // Clear input fields
      setOpenaiKey('');
      setAnthropicKey('');
      setGeminiKey('');

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
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Add your AI provider API keys. Keys are encrypted before storage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OpenAI */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="openai">OpenAI API Key</Label>
              {hasOpenaiKey && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  Configured
                </div>
              )}
            </div>
            <Input
              id="openai"
              type="password"
              placeholder="sk-..."
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              Get your key from{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                OpenAI Dashboard
              </a>
            </p>
          </div>

          {/* Anthropic */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="anthropic">Anthropic (Claude) API Key</Label>
              {hasAnthropicKey && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  Configured
                </div>
              )}
            </div>
            <Input
              id="anthropic"
              type="password"
              placeholder="sk-ant-..."
              value={anthropicKey}
              onChange={(e) => setAnthropicKey(e.target.value)}
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              Get your key from{' '}
              <a
                href="https://console.anthropic.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Anthropic Console
              </a>
            </p>
          </div>

          {/* Gemini */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="gemini">Google Gemini API Key</Label>
              {hasGeminiKey && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  Configured
                </div>
              )}
            </div>
            <Input
              id="gemini"
              type="password"
              placeholder="AIza..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              Get your key from{' '}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                Save API Keys
              </>
            )}
          </Button>

          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              <strong>Security:</strong> Your API keys are encrypted using AES-256 before being stored in the database.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
