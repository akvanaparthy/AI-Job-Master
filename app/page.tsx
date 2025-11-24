'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, MessageSquare, Mail, Sparkles, Zap, Shield } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Cover Letters',
    description: 'Generate tailored cover letters based on job descriptions',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: MessageSquare,
    title: 'LinkedIn Outreach',
    description: 'Craft personalized LinkedIn messages with follow-up tracking',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Mail,
    title: 'Email Generator',
    description: 'Generate complete job application emails',
    color: 'from-orange-500 to-red-500',
  },
];

const benefits = [
  { icon: Sparkles, text: 'Support for OpenAI, Anthropic, and Gemini' },
  { icon: Zap, text: 'Track application status (sent, draft, done, ghost)' },
  { icon: Shield, text: 'Encrypted API key storage' },
  { icon: FileText, text: 'Manage up to 3 resumes' },
  { icon: MessageSquare, text: 'Custom AI prompts for each content type' },
  { icon: Mail, text: 'Export outreach history' },
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Animated background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-cyan-500/20 to-pink-500/20 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
          <div className="max-w-7xl w-full space-y-16">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                <h1 className="text-6xl md:text-8xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-2xl">
                  AI Job Master
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
              >
                Generate personalized cover letters, LinkedIn messages, and emails using AI.
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  Track your job applications all in one place.
                </span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex gap-4 justify-center pt-6"
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                >
                  <Link href="/auth/signup">
                    Get Started
                    <Sparkles className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-slate-700 bg-slate-900/50 backdrop-blur-sm text-slate-200 hover:bg-slate-800/50 hover:text-white transition-all duration-300 hover:scale-105"
                >
                  <Link href="/auth/login">Login</Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="grid md:grid-cols-3 gap-6"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.2, duration: 0.6 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group"
                >
                  <Card className="relative overflow-hidden border-slate-800 bg-slate-900/40 backdrop-blur-xl hover:bg-slate-900/60 transition-all duration-300">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} p-2.5 mb-4 shadow-lg`}>
                        <feature.icon className="w-full h-full text-white" />
                      </div>
                      <CardTitle className="text-slate-100">{feature.title}</CardTitle>
                      <CardDescription className="text-slate-400">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-500">
                        AI-powered generation with customizable prompts and multiple model support.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Benefits Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Why Choose AI Job Master?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {benefits.map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.7 + index * 0.1, duration: 0.5 }}
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors duration-200"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                          <benefit.icon className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-slate-300">{benefit.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
