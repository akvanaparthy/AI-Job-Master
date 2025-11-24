import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Key, FileText, MessageSquare, Settings as SettingsIcon } from 'lucide-react';
import ApiKeyManager from '@/components/settings/ApiKeyManager';
import ResumeManager from '@/components/settings/ResumeManager';
import CustomPromptsManager from '@/components/settings/CustomPromptsManager';
import UserPreferencesManager from '@/components/settings/UserPreferencesManager';

export default function SettingsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your API keys, resumes, prompts, and preferences
        </p>
      </div>

      <Tabs defaultValue="api-keys" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="resumes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Resumes
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Prompts
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys">
          <ApiKeyManager />
        </TabsContent>

        <TabsContent value="resumes">
          <ResumeManager />
        </TabsContent>

        <TabsContent value="prompts">
          <CustomPromptsManager />
        </TabsContent>

        <TabsContent value="preferences">
          <UserPreferencesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
