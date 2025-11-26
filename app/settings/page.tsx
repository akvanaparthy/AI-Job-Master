'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Key, FileText, MessageSquare, Settings as SettingsIcon } from 'lucide-react';
import ApiKeyManager from '@/components/settings/ApiKeyManager';
import ResumeManager from '@/components/settings/ResumeManager';
import CustomPromptsManager from '@/components/settings/CustomPromptsManager';
import UserPreferencesManager from '@/components/settings/UserPreferencesManager';

function SettingsContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('api-keys');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['api-keys', 'resumes', 'prompts', 'preferences'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className="max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg">
            <SettingsIcon className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-[42px] font-bold text-slate-900 leading-tight">Settings</h1>
            <p className="text-lg text-slate-500">
              Manage your API keys, resumes, custom prompts, and preferences
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1 rounded-lg grid grid-cols-4 gap-1">
            <TabsTrigger
              value="api-keys"
              className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white flex items-center gap-2"
            >
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">API Keys</span>
            </TabsTrigger>
            <TabsTrigger
              value="resumes"
              className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Resumes</span>
            </TabsTrigger>
            <TabsTrigger
              value="prompts"
              className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Prompts</span>
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white flex items-center gap-2"
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

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">Loading...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
