'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Sparkles,
  FileText,
  MessageSquare,
  Mail,
  Target,
  Zap,
  Shield,
  TrendingUp,
  CheckCircle2,
  Users,
  Brain,
  Rocket
} from 'lucide-react';
import { useRef } from 'react';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div ref={containerRef} className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/3 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-purple-400/15 to-pink-400/15 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="relative z-50 border-b border-slate-200/60 bg-white/60 backdrop-blur-xl sticky top-0"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Job Master
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-slate-700 hover:text-blue-600">
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30"
            >
              <Link href="/auth/signup">
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 min-h-[90vh] flex items-center justify-center px-6 py-20"
      >
        <div className="max-w-7xl mx-auto text-center">
          {/* Social Proof Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-blue-200/60 shadow-lg mb-8"
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-slate-700">
              Trusted by <span className="text-blue-600 font-bold">10,000+</span> job seekers
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-6xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-6"
          >
            <span className="block text-slate-900">Land Your</span>
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
              Dream Job
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Transform your job search with AI-powered applications.
            <span className="block mt-2 font-medium text-slate-700">
              Craft personalized cover letters, emails, and LinkedIn messages in seconds.
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              asChild
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-2xl shadow-blue-500/40 transition-all duration-300 hover:scale-105"
            >
              <Link href="/auth/signup">
                Start Free Now
                <Rocket className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 border-2 border-slate-300 hover:border-blue-600 hover:bg-blue-50 transition-all duration-300"
            >
              <Link href="#how-it-works">
                See How It Works
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            {[
              { value: "3x", label: "Faster Applications" },
              { value: "85%", label: "Time Saved" },
              { value: "10k+", label: "Happy Users" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Story Section: The Problem */}
      <section className="relative z-10 py-32 px-6 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-display font-bold text-white mb-6">
              The Job Hunt Struggle Is <span className="text-red-400">Real</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              You're talented. You're qualified. But you're stuck in an endless cycle of...
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "😓",
                title: "Repetitive Writing",
                description: "Spending hours crafting the same cover letter for different companies, changing just a few words each time."
              },
              {
                icon: "😰",
                title: "Application Anxiety",
                description: "Worrying if your message stands out or if it's just another generic application in the pile."
              },
              {
                icon: "😤",
                title: "Tracking Chaos",
                description: "Losing track of who you've contacted, what you sent them, and when to follow up."
              }
            ].map((problem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300"
              >
                <div className="text-5xl mb-4">{problem.icon}</div>
                <h3 className="text-2xl font-display font-bold text-white mb-3">
                  {problem.title}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {problem.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section: The Solution */}
      <section id="how-it-works" className="relative z-10 py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-display font-bold text-slate-900 mb-6">
              Meet Your <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI Assistant</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Imagine having a personal assistant who knows exactly what to say, how to say it, and keeps everything organized.
            </p>
          </motion.div>

          {/* Feature Timeline */}
          <div className="space-y-24">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium mb-6">
                  <FileText className="w-4 h-4" />
                  Step 1
                </div>
                <h3 className="text-4xl font-display font-bold text-slate-900 mb-4">
                  Upload Your Resume
                </h3>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                  Drop in your resume (or up to 3 versions). Our AI analyzes your experience, skills, and achievements to create personalized content.
                </p>
                <ul className="space-y-3">
                  {["PDF, DOCX support", "Manage multiple versions", "Secure encrypted storage"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 p-8 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-xl shadow-lg flex items-center justify-center">
                    <FileText className="w-24 h-24 text-blue-600 animate-float" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div className="md:order-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-medium mb-6">
                  <Brain className="w-4 h-4" />
                  Step 2
                </div>
                <h3 className="text-4xl font-display font-bold text-slate-900 mb-4">
                  Generate Tailored Content
                </h3>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                  Paste the job description. Choose your AI model (OpenAI, Claude, or Gemini). Get a perfectly crafted cover letter, email, or LinkedIn message in seconds.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: FileText, label: "Cover Letters" },
                    { icon: Mail, label: "Emails" },
                    { icon: MessageSquare, label: "LinkedIn" }
                  ].map((item, i) => (
                    <div key={i} className="text-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <item.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-xs font-medium text-slate-700">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:order-1 relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 p-8 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-xl shadow-lg flex items-center justify-center">
                    <Sparkles className="w-24 h-24 text-purple-600 animate-pulse-glow" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 font-medium mb-6">
                  <Target className="w-4 h-4" />
                  Step 3
                </div>
                <h3 className="text-4xl font-display font-bold text-slate-900 mb-4">
                  Track & Follow Up
                </h3>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                  Never lose track again. See all your applications in one place. Mark statuses (Sent, Draft, Done, Ghost). Know exactly when to follow up.
                </p>
                <ul className="space-y-3">
                  {["Centralized history", "Status tracking", "Export your data"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 p-8 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-xl shadow-lg flex items-center justify-center">
                    <TrendingUp className="w-24 h-24 text-green-600 animate-float" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="relative z-10 py-32 px-6 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-display font-bold text-slate-900 mb-6">
              Why Job Seekers Love Us
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Generate professional content in seconds, not hours. Apply to more jobs with less effort.",
                color: "from-yellow-500 to-orange-500"
              },
              {
                icon: Brain,
                title: "AI-Powered",
                description: "Choose from OpenAI, Anthropic Claude, or Google Gemini. Use your own API keys for full control.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description: "Your data is encrypted and secure. We never store your API keys in plain text.",
                color: "from-blue-500 to-indigo-500"
              },
              {
                icon: Target,
                title: "Highly Personalized",
                description: "Every application is tailored to the specific job and company. No more generic templates.",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: FileText,
                title: "Custom Prompts",
                description: "Create your own AI prompts for each content type. Make it sound exactly like you.",
                color: "from-red-500 to-rose-500"
              },
              {
                icon: TrendingUp,
                title: "Track Progress",
                description: "See all your applications in one dashboard. Export your history anytime.",
                color: "from-cyan-500 to-blue-500"
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 hover:border-blue-300 hover:-translate-y-2"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${benefit.color} p-3 mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="w-full h-full text-white" />
                </div>
                <h3 className="text-xl font-display font-bold text-slate-900 mb-3">
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

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-white rounded-full blur-3xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          <h2 className="text-5xl md:text-6xl font-display font-bold text-white mb-6">
            Ready to Transform Your Job Search?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join thousands of job seekers who are landing more interviews with AI-powered applications.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="text-lg px-10 py-7 bg-white text-blue-600 hover:bg-slate-50 shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <Link href="/auth/signup">
                Start Free Today
                <Rocket className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <p className="text-blue-100 text-sm">
              No credit card required • Free forever
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-80">
            <div className="flex items-center gap-2 text-white">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Secure & Encrypted</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Users className="w-5 h-5" />
              <span className="text-sm">10,000+ Users</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Zap className="w-5 h-5" />
              <span className="text-sm">Instant Setup</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 bg-slate-900 text-slate-400">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-display font-bold text-white">AI Job Master</span>
          </div>
          <p className="text-sm">
            &copy; 2025 AI Job Master. Empowering job seekers with AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
