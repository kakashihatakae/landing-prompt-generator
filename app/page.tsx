"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Layers, 
  Save, 
  Zap, 
  ArrowRight,
  Github,
  Twitter,
  Instagram,
  Menu,
  X
} from "lucide-react";

// Animation hook for scroll reveal
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// Feature Card Component
function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  delay 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  delay: number;
}) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`group relative p-8 rounded-3xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm transition-all duration-700 ease-out hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow duration-500">
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    setHeroLoaded(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-x-hidden">
      {/* Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900 dark:text-white">
              LumeosAI
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              Features
            </a>
            <Link 
              href="/auth/login"
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Button 
              asChild
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-full px-6 h-10 text-sm font-medium transition-all duration-300 hover:scale-105"
            >
              <Link href="/auth/sign-up">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-600 dark:text-slate-400"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4">
            <a 
              href="#features" 
              className="text-slate-600 dark:text-slate-400 py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </a>
            <Link 
              href="/auth/login"
              className="text-slate-600 dark:text-slate-400 py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </Link>
            <Button asChild className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        {/* Background gradient effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-purple-400/10 dark:bg-purple-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm mb-8 transition-all duration-1000 ${
              heroLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Now powered by GPT-4o
            </span>
          </div>

          {/* Headline */}
          <h1
            className={`text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-6 transition-all duration-1000 delay-100 ${
              heroLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Create beautiful
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              landing pages
            </span>
            <br />
            in just a couple of clicks
          </h1>

          {/* Subheading */}
          <p
            className={`text-lg md:text-xl text-slate-600/80 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed transition-all duration-1000 delay-200 ${
              heroLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Generate high-quality prompts to power AI-driven code generators.
            Let LumeosAI handle the complexity while you focus on creativity.
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 delay-300 ${
              heroLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Button
              asChild
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-14 text-base font-medium shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
            >
              <Link href="/auth/sign-up">
                Start Creating Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full px-8 h-14 text-base"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>

          {/* Preview Image / Illustration */}
          <div className="mt-16 md:mt-24 relative">
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
              
              {/* Dashboard Mockup */}
              <div className="relative bg-slate-950 rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
                {/* App Header */}
                <div className="flex items-center justify-between px-4 h-12 border-b border-slate-800 bg-slate-950">
                  <span className="text-sm font-medium text-white">Landing Page Generator</span>
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white font-medium">SH</div>
                </div>
                
                {/* Main Content Area */}
                <div className="flex h-[420px]">
                  {/* Left Sidebar */}
                  <div className="w-48 border-r border-slate-800 bg-slate-950/50 p-4 hidden sm:block">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold text-slate-400 tracking-wider">PROJECTS</span>
                      <div className="flex items-center gap-2 text-slate-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30">
                      <div className="w-4 h-4 rounded bg-blue-500/50" />
                      <span className="text-xs text-white truncate">landing generator</span>
                    </div>
                  </div>

                  {/* Center Editor */}
                  <div className="flex-1 bg-slate-950 p-4 overflow-hidden">
                    {/* Editor Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-white">landing generator</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-400 border border-slate-700">Draft</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Last saved: Just now
                        </span>
                        <div className="px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-xs text-blue-400 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                          Save
                        </div>
                      </div>
                    </div>

                    {/* Global Prompt Section */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                          <span className="text-xs font-semibold text-white tracking-wider">GLOBAL PROMPT</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            Copy
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Clear
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">High-level instructions for the landing page generator</p>
                      <div className="relative">
                        <div className="w-full h-24 rounded-lg bg-slate-900/50 border border-slate-800 p-3">
                          <p className="text-xs text-slate-400 leading-relaxed">Create a modern saas landing page with clean design, clear CTAs, and modern aesthetics...</p>
                        </div>
                        <span className="absolute bottom-2 right-3 text-xs text-slate-600">623 chars</span>
                      </div>
                    </div>

                    {/* Template Buttons */}
                    <div className="flex items-center gap-2 mb-4 overflow-hidden">
                      <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-1 whitespace-nowrap">
                        <span className="text-slate-500">+</span> Modern SaaS
                      </span>
                      <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-1 whitespace-nowrap">
                        <span className="text-slate-500">+</span> E-commerce
                      </span>
                      <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-1 whitespace-nowrap">
                        <span className="text-slate-500">+</span> Portfolio
                      </span>
                    </div>

                    {/* Sections Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        <span className="text-xs font-semibold text-white tracking-wider">SECTIONS</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-xs text-slate-400">6</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-blue-600 text-xs text-white flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Section
                      </div>
                    </div>

                    {/* Section Cards */}
                    <div className="space-y-2">
                      {["Hero", "Features", "Testimonials", "Pricing", "CTA"].map((section, i) => (
                        <div key={section} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-900/50 border border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-0.5">
                              <div className="w-1 h-1 rounded-full bg-slate-600" />
                              <div className="w-1 h-1 rounded-full bg-slate-600" />
                              <div className="w-1 h-1 rounded-full bg-slate-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-white">{section}</span>
                                <span className="text-xs text-slate-500">{section}</span>
                                {i < 2 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                              </div>
                              <p className="text-xs text-slate-500 truncate max-w-[200px]">
                                {section === "Hero" ? "Hero section has a line that describes this portal..." : 
                                 section === "Features" ? "Highlight the below features 1. Organize thoughts..." :
                                 `Define your ${section.toLowerCase()} section content`}
                              </p>
                            </div>
                          </div>
                          <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Preview Panel */}
                  <div className="w-56 border-l border-slate-800 bg-slate-950/30 p-4 hidden md:block">
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <span className="text-xs font-semibold text-white tracking-wider">PREVIEW</span>
                    </div>
                    <div className="mb-3">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        Copy
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono leading-relaxed">
                      <p className="text-slate-500 mb-2"># Global Instructions</p>
                      <p className="mb-2">Create a modern saas landing page with...</p>
                      <p className="text-slate-500 mb-2">---</p>
                      <p className="text-slate-500 mb-2"># Landing Page Sections</p>
                      <p className="text-slate-500 mb-1">## 1. Hero</p>
                    </div>
                    <div className="mt-4 px-4 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-xs text-blue-400 flex items-center justify-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      Generate with AI
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Streamlined tools designed to help you build faster and better
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Layers}
              title="Organize Your Thoughts"
              description="Structure your landing page into distinct sections. Plan your hero, features, testimonials, and more with an intuitive interface."
              delay={0}
            />
            <FeatureCard
              icon={Save}
              title="Save Your Progress"
              description="Never lose your work. Auto-save functionality ensures your ideas are preserved as you build your perfect landing page."
              delay={150}
            />
            <FeatureCard
              icon={Zap}
              title="Generate Instantly"
              description="Transform your structured input into high-quality AI prompts with a single click. Ready for Claude, GPT-4, or Kimi."
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 px-6 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to build something amazing?
          </h2>
          <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
            Join thousands of developers using LumeosAI to create stunning landing pages in minutes, not hours.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-slate-900 hover:bg-slate-100 rounded-full px-10 h-14 text-base font-semibold shadow-2xl shadow-white/25 hover:shadow-white/40 transition-all duration-300 hover:scale-105 relative overflow-hidden group"
          >
            <Link href="/auth/sign-up">
              <span className="relative z-10 flex items-center">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </Button>
          <p className="mt-6 text-sm text-slate-400">
            No credit card required. Start building in seconds.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-slate-900 dark:text-white">
                LumeosAI
              </span>
            </Link>

            {/* Links */}
            <div className="flex items-center gap-6">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>

            {/* Copyright */}
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} LumeosAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
