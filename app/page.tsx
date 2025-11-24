'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  CheckCircle,
  Shield,
  Sparkles,
  FileText,
  MessageSquare,
  Mail,
  Target,
  TrendingUp,
  Users,
  Zap,
  Clock,
  Brain,
  Smile
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e5d9f2] via-[#f0eaf9] to-[#cfe2f3] relative overflow-hidden">
      {/* Subtle gradient orbs - very soft */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-200 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-200 rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 pt-6 pb-4 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-sm rounded-[32px] px-8 py-4 shadow-lg"
          >
            <div className="flex items-center justify-between">
              {/* Logo - Left side */}
              <div className="flex items-center gap-2">
                <div className="bg-slate-900 rounded-xl px-3 py-1.5">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[17px] font-bold text-slate-900 leading-tight">AI Job</span>
                  <span className="text-[17px] font-bold text-slate-900 leading-tight">Master</span>
                </div>
              </div>

              {/* Nav Links - Center */}
              <div className="hidden md:flex items-center gap-12">
                <Link href="#features" className="text-[15px] font-medium text-slate-800 hover:text-slate-900 transition-colors">
                  Features
                </Link>
                <Link href="#how-it-works" className="text-[15px] font-medium text-slate-800 hover:text-slate-900 transition-colors">
                  How It Works
                </Link>
                <Link href="#about" className="text-[15px] font-medium text-slate-800 hover:text-slate-900 transition-colors">
                  About
                </Link>
                <Link href="#pricing" className="text-[15px] font-medium text-slate-800 hover:text-slate-900 transition-colors">
                  Pricing
                </Link>
              </div>

              {/* CTA Button - Right side */}
              <Link
                href="/auth/signup"
                className="inline-block bg-slate-900 hover:bg-slate-800 text-white text-[15px] font-semibold px-8 py-3.5 rounded-[20px] shadow-lg transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[calc(100vh-100px)] flex items-center px-6 pb-32">
        <div className="max-w-5xl mx-auto text-center w-full">
          {/* Social Proof with Avatars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 mb-8"
          >
            {/* Avatar circles */}
            <div className="flex -space-x-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-300 to-orange-400 border-[3px] border-white shadow-md" />
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-300 to-pink-400 border-[3px] border-white shadow-md" />
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-300 to-green-400 border-[3px] border-white shadow-md" />
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-300 to-purple-400 border-[3px] border-white shadow-md" />
            </div>
            <p className="text-[15px] text-slate-700 font-medium">
              <span className="text-teal-600 font-bold">10,000+</span> job seekers trust us
            </p>
          </motion.div>

          {/* Main Headline with Icon */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h1 className="text-[64px] md:text-[80px] lg:text-[88px] font-bold text-slate-900 leading-[1.1] mb-0">
              Land{' '}
              <span className="inline-flex items-center justify-center align-middle">
                <span className="inline-block bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-[28px] shadow-2xl mx-3 mb-2">
                  <Briefcase className="w-[52px] h-[52px] text-white" strokeWidth={2.5} />
                </span>
              </span>
              Your Dream Job
            </h1>
            <h2 className="text-[64px] md:text-[80px] lg:text-[88px] font-bold text-slate-900 leading-[1.1]">
              With AI-Powered Apps
            </h2>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-[17px] text-slate-700 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Generate personalized cover letters, emails, and LinkedIn messages in seconds.
            <br />
            Track every application and never miss a follow-up. AI does the heavy lifting.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-20"
          >
            <Link
              href="/auth/signup"
              className="inline-block bg-slate-900 hover:bg-slate-800 text-white text-[16px] font-semibold px-10 py-4 rounded-[22px] shadow-2xl transition-all duration-200"
            >
              Start For Free
            </Link>
          </motion.div>

          {/* Stats Cards - Tilted like in reference */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-8 max-w-3xl mx-auto relative"
          >
            {/* Left Card - Application Success */}
            <div
              className="bg-white/80 backdrop-blur-sm rounded-[32px] p-8 shadow-2xl border border-white/60 w-[340px]"
              style={{ transform: 'rotate(-4deg)' }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-gradient-to-br from-orange-300 to-orange-400 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <TrendingUp className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <div className="text-left">
                  <h3 className="text-[19px] font-bold text-slate-900 leading-tight">Application</h3>
                  <h3 className="text-[19px] font-bold text-slate-900 leading-tight">Success Rate</h3>
                </div>
              </div>
              <div className="text-left space-y-2">
                <p className="text-[32px] font-bold text-slate-900 leading-none">3x</p>
                <p className="text-[15px] font-semibold text-slate-700">More Interview Callbacks</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">Users applying with AI-generated content</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">get 3x more responses from recruiters</p>
              </div>
            </div>

            {/* Arrow decoration */}
            <div className="text-purple-300 opacity-50">
              <svg width="100" height="60" viewBox="0 0 100 60" fill="none" className="rotate-12">
                <path
                  d="M 10 30 Q 50 10, 85 25"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  fill="none"
                />
                <path
                  d="M 85 25 L 80 20 M 85 25 L 80 30"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>

            {/* Right Card - Time Saved */}
            <div
              className="bg-white/80 backdrop-blur-sm rounded-[32px] p-8 shadow-2xl border border-white/60 w-[340px]"
              style={{ transform: 'rotate(3deg)' }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-gradient-to-br from-emerald-400 to-green-500 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Clock className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <h3 className="text-[19px] font-bold text-slate-900 leading-tight">Time Saved</h3>
                </div>
              </div>
              <div className="text-left space-y-2">
                <p className="text-[32px] font-bold text-slate-900 leading-none">85%</p>
                <p className="text-[15px] font-semibold text-slate-700">Faster Application Process</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">What used to take hours now takes</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">minutes. Apply to more jobs effortlessly</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="relative z-10 py-24 px-6 bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              We Understand Your <span className="text-red-400">Challenges</span>
            </h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              The job search journey can be overwhelming. You're qualified and talented, yet...
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                emoji: "😓",
                title: "Endless Applications",
                description: "Spending countless hours writing the same cover letter repeatedly, making small tweaks for each company. Your time deserves better."
              },
              {
                emoji: "😰",
                title: "Lost in the Crowd",
                description: "Applications disappearing into the void. Does your message stand out among hundreds? The uncertainty is exhausting."
              },
              {
                emoji: "😤",
                title: "Tracking Nightmare",
                description: "Which companies did you contact? What message did you send? When to follow up? Managing everything manually is chaos."
              }
            ].map((problem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="bg-white/10 backdrop-blur-lg rounded-[28px] p-8 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="text-6xl mb-5">{problem.emoji}</div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {problem.title}
                </h3>
                <p className="text-purple-200 leading-relaxed">
                  {problem.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="relative z-10 py-24 px-6 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Your Personal AI <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Career Assistant</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Imagine having an assistant who crafts perfect messages, knows what to say, and keeps everything organized. That's us.
            </p>
          </motion.div>

          <div className="space-y-24">
            {/* Step 1 */}
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-100 text-purple-700 font-bold mb-6 shadow-lg">
                  <span className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">1</span>
                  Upload Resume
                </div>
                <h3 className="text-4xl font-bold text-slate-900 mb-5">
                  Start With Your Experience
                </h3>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                  Upload your resume (PDF or DOCX). Our AI analyzes your skills, experience, and achievements instantly. Manage up to 3 versions for different roles.
                </p>
                <ul className="space-y-3">
                  {["Fast upload process", "Bank-level encryption", "Multiple resume versions"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-purple-200 to-blue-200 rounded-[32px] p-12 shadow-2xl">
                  <div className="bg-white rounded-[24px] p-10 shadow-xl">
                    <FileText className="w-28 h-28 text-purple-600 mx-auto mb-6" strokeWidth={1.5} />
                    <div className="space-y-3">
                      <div className="h-3 bg-purple-200 rounded-full w-3/4 mx-auto" />
                      <div className="h-3 bg-blue-200 rounded-full w-full mx-auto" />
                      <div className="h-3 bg-purple-200 rounded-full w-2/3 mx-auto" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Step 2 */}
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="md:order-2"
              >
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-100 text-blue-700 font-bold mb-6 shadow-lg">
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">2</span>
                  AI Generation
                </div>
                <h3 className="text-4xl font-bold text-slate-900 mb-5">
                  Let AI Work Its Magic
                </h3>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                  Paste the job description. Select your AI (OpenAI, Claude, Gemini). Get perfectly tailored content in seconds that highlights your fit.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: FileText, label: "Cover Letters", color: "from-blue-500 to-cyan-500" },
                    { icon: Mail, label: "Emails", color: "from-orange-500 to-red-500" },
                    { icon: MessageSquare, label: "LinkedIn", color: "from-purple-500 to-pink-500" }
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} p-2.5 mx-auto mb-3 shadow-md`}>
                        <item.icon className="w-full h-full text-white" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700 text-center">{item.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="md:order-1"
              >
                <div className="bg-gradient-to-br from-blue-200 to-purple-200 rounded-[32px] p-12 shadow-2xl">
                  <div className="bg-white rounded-[24px] p-10 shadow-xl relative overflow-hidden">
                    <Sparkles className="w-28 h-28 text-blue-600 mx-auto mb-6 animate-pulse" strokeWidth={1.5} />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 animate-pulse" />
                    <div className="relative space-y-3">
                      <div className="h-2.5 bg-blue-200 rounded-full w-full" />
                      <div className="h-2.5 bg-purple-200 rounded-full w-5/6" />
                      <div className="h-2.5 bg-blue-200 rounded-full w-4/6" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Step 3 */}
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-100 text-green-700 font-bold mb-6 shadow-lg">
                  <span className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">3</span>
                  Track Progress
                </div>
                <h3 className="text-4xl font-bold text-slate-900 mb-5">
                  Stay Organized & Follow Up
                </h3>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                  All applications in one dashboard. Track statuses, schedule follow-ups, and watch your progress. Never miss an opportunity.
                </p>
                <ul className="space-y-3">
                  {["Complete history", "Status tracking (Sent, Draft, Done, Ghost)", "Export anytime"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="bg-gradient-to-br from-green-200 to-emerald-200 rounded-[32px] p-12 shadow-2xl">
                  <div className="bg-white rounded-[24px] p-10 shadow-xl">
                    <TrendingUp className="w-28 h-28 text-green-600 mx-auto mb-6" strokeWidth={1.5} />
                    <div className="space-y-4">
                      {[
                        { color: 'bg-green-500', width: 'w-full' },
                        { color: 'bg-blue-500', width: 'w-4/5' },
                        { color: 'bg-orange-500', width: 'w-3/5' }
                      ].map((bar, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${bar.color}`} />
                          <div className={`h-2.5 ${bar.color} bg-opacity-20 rounded-full ${bar.width}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="relative z-10 py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Why Choose AI Job Master
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              More than software—your competitive advantage
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "85% Time Saved",
                description: "What took hours now takes seconds. Apply to more opportunities without exhaustion.",
                color: "from-yellow-400 to-orange-500"
              },
              {
                icon: Brain,
                title: "Best AI Models",
                description: "OpenAI, Claude, or Gemini. Your API keys, your control, complete privacy.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Shield,
                title: "Military-Grade Security",
                description: "AES-256 encryption. Your data stays encrypted. We never see your keys.",
                color: "from-blue-500 to-indigo-600"
              },
              {
                icon: Target,
                title: "100% Personalized",
                description: "Every message tailored to the role and company. Zero generic templates.",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: Users,
                title: "10,000+ Community",
                description: "Join thousands of successful job seekers achieving their goals.",
                color: "from-red-500 to-rose-500"
              },
              {
                icon: Clock,
                title: "3x Faster Applications",
                description: "Quality applications at speed. More applications equal more chances.",
                color: "from-cyan-500 to-blue-500"
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-gradient-to-br from-slate-50 to-purple-50/50 rounded-[28px] p-8 border border-slate-200 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.color} p-3.5 mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <benefit.icon className="w-full h-full text-white" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-28 px-6 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-white rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-white rounded-full blur-[150px] translate-x-1/2 translate-y-1/2" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Your Dream Job Awaits
          </h2>
          <p className="text-xl text-purple-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Stop wasting hours on repetitive work. Let AI handle the writing while you focus on what matters—landing interviews and getting hired.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-12">
            <Link
              href="/auth/signup"
              className="inline-block bg-white text-purple-600 hover:bg-slate-50 text-lg font-bold px-12 py-4 rounded-[22px] shadow-2xl transition-all"
            >
              Start Free Today
            </Link>
            <p className="text-purple-100 text-sm font-medium">
              No credit card • Free forever • 2-minute setup
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-10 opacity-90">
            <div className="flex items-center gap-2.5 text-white">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Secure & Encrypted</span>
            </div>
            <div className="flex items-center gap-2.5 text-white">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">10,000+ Users</span>
            </div>
            <div className="flex items-center gap-2.5 text-white">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-medium">Instant Results</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-2.5 shadow-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">AI Job Master</span>
                <p className="text-xs text-slate-400">AI-powered career success</p>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              © 2025 AI Job Master. Empowering careers worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
