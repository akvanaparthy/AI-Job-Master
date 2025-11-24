'use client';

import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Key, FileText, MessageSquare, Settings as SettingsIcon } from 'lucide-react';
import ApiKeyManager from '@/components/settings/ApiKeyManager';
import ResumeManager from '@/components/settings/ResumeManager';
import CustomPromptsManager from '@/components/settings/CustomPromptsManager';
import UserPreferencesManager from '@/components/settings/UserPreferencesManager';

export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-3">Settings</h1>
        <p className="text-lg text-slate-600">
          Manage your API keys, resumes, custom prompts, and preferences.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="api-keys" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200 p-1 rounded-[20px] grid grid-cols-4 gap-1">
            <TabsTrigger
              value="api-keys"
              className="rounded-[16px] data-[state=active]:bg-slate-900 data-[state=active]:text-white flex items-center gap-2"
            >
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">API Keys</span>
            </TabsTrigger>
            <TabsTrigger
              value="resumes"
              className="rounded-[16px] data-[state=active]:bg-slate-900 data-[state=active]:text-white flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Resumes</span>
            </TabsTrigger>
            <TabsTrigger
              value="prompts"
              className="rounded-[16px] data-[state=active]:bg-slate-900 data-[state=active]:text-white flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Prompts</span>
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="rounded-[16px] data-[state=active]:bg-slate-900 data-[state=active]:text-white flex items-center gap-2"
            >
              <SettingsIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="api-keys" className="space-y-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ApiKeyManager />
            </motion.div>
          </TabsContent>

          <TabsContent value="resumes" className="space-y-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ResumeManager />
            </motion.div>
          </TabsContent>

          <TabsContent value="prompts" className="space-y-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <CustomPromptsManager />
            </motion.div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <UserPreferencesManager />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
