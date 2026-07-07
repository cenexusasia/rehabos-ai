'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import {
  Brain,
  Stethoscope,
  FileText,
  Calendar,
  Dumbbell,
  ClipboardList,
  MessageSquare,
  Video,
  DollarSign,
  BarChart3,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Menu,
  X,
  Star,
  Moon,
  Sun,
} from 'lucide-react';

const features = [
  { icon: FileText, title: 'AI-Powered SOAP Notes', description: 'Generate clinical documentation from natural language. Voice-to-text, auto-structuring, and smart templates.' },
  { icon: Dumbbell, title: 'Exercise Library & HEP', description: '2,000+ exercises with video demonstrations. Build custom home exercise programs in seconds.' },
  { icon: ClipboardList, title: 'Outcome Assessments', description: 'Built-in outcome measures with auto-scoring, normative comparisons, and AI interpretation.' },
  { icon: Calendar, title: 'Smart Scheduling', description: 'Calendar management with provider availability, appointment reminders, and telehealth integration.' },
  { icon: Brain, title: 'Clinical Decision Support', description: 'AI-driven risk stratification, adherence prediction, and evidence-based treatment recommendations.' },
  { icon: Video, title: 'Telehealth Platform', description: 'Built-in video consultations with shared whiteboard, exercise demo, and SOAP note collaboration.' },
  { icon: MessageSquare, title: 'Secure Messaging', description: 'HIPAA-compliant messaging between clinicians, patients, and referral partners.' },
  { icon: DollarSign, title: 'Billing & Claims', description: 'Automated invoice generation, insurance claim submission, payment tracking, and revenue analytics.' },
  { icon: BarChart3, title: 'Practice Analytics', description: 'Real-time dashboards for outcomes, revenue, patient volume, and clinical performance metrics.' },
  { icon: Shield, title: 'HIPAA Compliant', description: 'Enterprise-grade security with RLS, audit logging, encryption at rest and in transit, and access controls.' },
  { icon: Stethoscope, title: 'Protocol Builder', description: 'Create evidence-based clinical protocols with phased progression criteria and auto-discharge planning.' },
  { icon: Sparkles, title: 'AI Treatment Plans', description: 'Generate personalized treatment plans based on diagnosis, patient profile, and clinical best practices.' },
];

const testimonials = [
  { quote: 'RehabOS cut my documentation time by 60%. The AI SOAP notes are scarily accurate — I just review and sign.', name: 'Dr. Sarah Chen, PT, DPT', role: 'Owner, Chen Physical Therapy' },
  { quote: 'The exercise library and HEP builder saved us thousands in subscription fees. Patients love the mobile app.', name: 'Marcus Johnson, PT', role: 'Clinical Director, Rebound Sports Medicine' },
  { quote: 'Finally, an EMR that thinks like a clinician. The CDS alerts caught three at-risk patients in our first week.', name: 'Dr. Elena Rodriguez', role: 'Orthopedic Surgeon, Texas Ortho Associates' },
];

const plans = [
  { name: 'Solo', price: 'Free', period: 'forever', features: ['Up to 30 patients', 'AI SOAP notes (50/mo)', 'Exercise library access', 'Basic analytics', 'Community support'], cta: 'Get Started', popular: false },
  { name: 'Professional', price: '$79', period: '/month', features: ['Unlimited patients', 'Unlimited AI SOAP notes', 'HEP builder + mobile app', 'Telehealth (60 min/session)', 'Outcome measures + charts', 'Priority support'], cta: 'Start Free Trial', popular: true },
  { name: 'Enterprise', price: '$199', period: '/month', features: ['Everything in Professional', 'White-label mobile app', 'Custom protocols library', 'API access + integrations', 'Dedicated account manager', 'Custom AI model training'], cta: 'Contact Sales', popular: false },
];

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* ── Navbar ─────────────────────────────────────── */}
      <nav className="border-border/50 fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Brain className="text-primary h-6 w-6" />
            <span className="text-lg font-bold">RehabOS</span>
            <span className="bg-primary/10 text-primary ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">AI</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Features</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Pricing</a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Testimonials</a>
            <div className="flex items-center gap-3">
              {mounted && (
                <button onClick={toggleTheme} className="text-muted-foreground hover:text-foreground rounded-lg p-2 transition-colors">
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
              )}
              <Link href="/login" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">Sign in</Link>
              <Link href="/signup" className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-foreground md:hidden">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-border/50 bg-background border-t px-4 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground text-sm">Features</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground text-sm">Pricing</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground text-sm">Testimonials</a>
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <Link href="/login" className="text-muted-foreground hover:text-foreground text-sm font-medium">Sign in</Link>
                <Link href="/signup" className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium">Get Started</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 pt-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,124,255,0.08),transparent_50%)]" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Native Operating System for Rehabilitation
          </div>
          <h1 className="text-foreground mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            The Operating System{' '}
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              for Modern Rehab
            </span>
          </h1>
          <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg leading-relaxed sm:text-xl">
            AI-powered clinical documentation, smart exercise prescriptions, telehealth, billing, and analytics — all in one HIPAA-compliant platform purpose-built for physical therapists and rehabilitation professionals.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-12 items-center gap-2 rounded-xl px-8 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              Start Free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="border-border text-foreground hover:bg-accent inline-flex h-12 items-center gap-2 rounded-xl border px-8 text-base font-medium transition-colors"
            >
              See Features
            </a>
          </div>
          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><CheckCircle className="text-emerald-500 h-4 w-4" /> HIPAA Compliant</span>
            <span className="flex items-center gap-2"><CheckCircle className="text-emerald-500 h-4 w-4" /> SOC 2 Type II</span>
            <span className="flex items-center gap-2"><CheckCircle className="text-emerald-500 h-4 w-4" /> 99.9% Uptime</span>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────── */}
      <section id="features" className="border-border/50 border-t px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-foreground mb-4 text-3xl font-bold sm:text-4xl">Everything you need to run your practice</h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              From first contact to final billing — RehabOS streamlines every step of the clinical workflow.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="border-border hover:border-primary/30 bg-card group rounded-xl border p-6 transition-all hover:shadow-lg hover:shadow-primary/5">
                <div className="bg-primary/10 text-primary mb-4 inline-flex rounded-lg p-2.5">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-foreground mb-2 text-base font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────── */}
      <section className="border-border/50 bg-card/50 border-t border-b px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {[
              { value: '2,000+', label: 'Exercises' },
              { value: '50+', label: 'Outcome Measures' },
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '60%', label: 'Faster Documentation' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-primary text-3xl font-bold sm:text-4xl">{stat.value}</div>
                <div className="text-muted-foreground mt-1 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────── */}
      <section id="testimonials" className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <h2 className="text-foreground mb-4 text-3xl font-bold sm:text-4xl">Trusted by rehabilitation professionals</h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">Join hundreds of clinics already transforming their practice with RehabOS.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="border-border bg-card flex flex-col rounded-xl border p-6">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />)}
                </div>
                <p className="text-foreground/80 mb-6 flex-1 text-sm leading-relaxed italic">"{t.quote}"</p>
                <div>
                  <p className="text-foreground text-sm font-semibold">{t.name}</p>
                  <p className="text-muted-foreground text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-muted-foreground mt-3 text-center text-xs">Note: Testimonials are illustrative examples of platform capabilities.</div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────── */}
      <section id="pricing" className="border-border/50 border-t px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <h2 className="text-foreground mb-4 text-3xl font-bold sm:text-4xl">Simple, transparent pricing</h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">Start free. Upgrade when you grow. No hidden fees.</p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.name} className={`relative rounded-2xl border p-6 ${plan.popular ? 'border-primary bg-card shadow-lg shadow-primary/10' : 'border-border bg-card'}`}>
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold">Most Popular</div>
                )}
                <h3 className="text-foreground mb-1 text-lg font-semibold">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-foreground text-4xl font-bold">{plan.price}</span>
                  {plan.period !== 'forever' && <span className="text-muted-foreground ml-1 text-sm">{plan.period}</span>}
                  {plan.period === 'forever' && <span className="text-muted-foreground ml-1 text-sm">forever</span>}
                </div>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="text-emerald-500 mt-0.5 h-4 w-4 shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    plan.popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20'
                      : 'border-border text-foreground hover:bg-accent border'
                  }`}
                >
                  {plan.cta} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section className="bg-primary/5 border-border/50 border-t px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold sm:text-4xl">Ready to transform your practice?</h2>
          <p className="text-muted-foreground mb-10 text-lg">Join thousands of rehabilitation professionals using RehabOS AI. Free forever — no credit card required.</p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-12 items-center gap-2 rounded-xl px-8 text-base font-semibold shadow-lg shadow-primary/20 transition-all"
            >
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#features" className="border-border text-foreground hover:bg-accent inline-flex h-12 items-center gap-2 rounded-xl border px-8 text-base font-medium transition-colors">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="border-border/50 border-t px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Brain className="text-primary h-5 w-5" />
                <span className="font-bold">RehabOS</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                AI-Native Operating System for Rehabilitation Professionals.
              </p>
            </div>
            <div>
              <h4 className="text-foreground mb-3 text-sm font-semibold">Product</h4>
              <div className="flex flex-col gap-2">
                <a href="#features" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Features</a>
                <a href="#pricing" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Pricing</a>
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Changelog</a>
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">API Docs</a>
              </div>
            </div>
            <div>
              <h4 className="text-foreground mb-3 text-sm font-semibold">Company</h4>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">About</a>
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Blog</a>
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Careers</a>
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Contact</a>
              </div>
            </div>
            <div>
              <h4 className="text-foreground mb-3 text-sm font-semibold">Legal</h4>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Privacy Policy</a>
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Terms of Service</a>
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">HIPAA Compliance</a>
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Security</a>
              </div>
            </div>
          </div>
          <div className="border-border/50 mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} RehabOS AI. All rights reserved. Not for clinical use without proper validation.
          </div>
        </div>
      </footer>
    </div>
  );
}
