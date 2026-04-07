'use client';

import { useEffect, useRef, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { InteractiveDemo } from '@/components/landing/InteractiveDemo';
import { EcosystemSection } from '@/components/landing/EcosystemSection';
import { useTheme } from '@/lib/theme-context';
import {
  Users, DollarSign, Calendar, Plane, TrendingUp, Clock, FileText,
  Briefcase, Building2, CheckCircle2, ArrowRight, Sparkles, Shield, Zap,
  Lock, Globe, ChevronRight, Sun, Moon,
} from 'lucide-react';

/* ─────────────────────── DATA ─────────────────────── */
const features = [
  { title: 'Personnel Hub',       description: 'Rich employee profiles, org charts, and dynamic people data — all in one master database.',                    icon: Users,       color: 'from-blue-500/70 to-indigo-500/70',    glow: 'rgba(99,102,241,0.3)'  },
  { title: 'Intelligent Payroll', description: 'Automated salary processing with smart compliance algorithms and direct bank API integrations.',                 icon: DollarSign,  color: 'from-emerald-500/70 to-teal-500/70',   glow: 'rgba(20,184,166,0.3)'  },
  { title: 'Leave & Absence',     description: 'One-tap time-off requests with real-time balance tracking and intelligent rule-based routing.',                  icon: Calendar,    color: 'from-violet-500/70 to-purple-500/70',   glow: 'rgba(139,92,246,0.3)'  },
  { title: 'Travel & Expenses',   description: 'Frictionless claim submission, policy enforcement, and rapid reimbursement that closes in days, not weeks.',    icon: Plane,       color: 'from-amber-500/70 to-orange-500/70',   glow: 'rgba(245,158,11,0.3)'  },
  { title: 'Performance Goals',   description: 'Continuous feedback loops, 360° reviews, and OKR-driven performance scoring across every team.',               icon: TrendingUp,  color: 'from-rose-500/70 to-red-500/70',       glow: 'rgba(244,63,94,0.3)'   },
  { title: 'Time & Attendance',   description: 'Biometric + geolocation-based check-ins with pinpoint precision for timesheets and shift management.',          icon: Clock,       color: 'from-cyan-500/70 to-sky-500/70',       glow: 'rgba(6,182,212,0.3)'   },
  { title: 'Tax Compliance',      description: 'Automated TDS deductions, flexible investment declarations, and instant generation of Form 16.',                 icon: FileText,    color: 'from-fuchsia-500/70 to-pink-500/70',   glow: 'rgba(217,70,239,0.3)'  },
  { title: 'Talent Acquisition',  description: 'End-to-end recruitment pipelines with AI-assisted candidate scoring and seamless onboarding flows.',            icon: Briefcase,   color: 'from-pink-500/70 to-rose-500/70',      glow: 'rgba(236,72,153,0.3)'  },
];

const capabilities = [
  { icon: Shield,       text: 'Military-grade AES-256 Encryption' },
  { icon: Zap,          text: 'Sub-100ms Real-time Dashboards'     },
  { icon: Sparkles,     text: 'AI-powered Insights & Predictions'  },
  { icon: CheckCircle2, text: 'Automated Statutory Compliance'      },
  { icon: Globe,        text: 'Multi-region Cloud Architecture'     },
  { icon: Lock,         text: 'ISO 27001 & SOC 2 Certified'        },
];


/* ─────────────────────── HELPERS ─────────────────────── */
const easeOut = [0.16, 1, 0.3, 1];


/* ─────────────────────── PAGE ─────────────────────── */
export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const isDark = theme === 'dark';

  const horizontalSectionRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    // We use a small delay or window load wrapper to ensure SplitType correctly measures widths.
    const ctx = gsap.context(() => {
      
      // 1. Feature Cards Fade Up Stagger
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: '#features-grid',
          start: 'top 85%',
        },
        opacity: 0,
        y: 40,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
      });

      // 2. Horizontal Scroll Section
      if (sliderRef.current && horizontalSectionRef.current) {
        const panels = gsap.utils.toArray('.horizontal-panel');
        gsap.to(panels, {
          xPercent: -100 * (panels.length - 1),
          ease: 'none',
          scrollTrigger: {
            trigger: horizontalSectionRef.current,
            pin: true,
            scrub: 1,
            // scroll distance matches the width of the slider track
            end: () => `+=${sliderRef.current?.scrollWidth}`,
          }
        });
      }
    });

    return () => ctx.revert(); // clean up all GSAP animations
  }, []);

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard');
  }, [isAuthenticated, router]);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden font-sans text-foreground selection:bg-primary/30">

      {/* ── Scroll Progress Bar ── */}
      <motion.div
        style={{ scaleX: progressWidth, transformOrigin: 'left' }}
        className="fixed top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary via-accent to-primary z-[100]"
      />

      {/* ── Global Background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-15%] w-[55%] h-[55%] bg-primary/15 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] bg-accent/15 rounded-full blur-[140px]" />
        <div className="absolute top-[35%] right-[15%] w-[30%] h-[30%] bg-blue-600/[0.08] rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.04)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* ════════════════════════════════════════════
          HEADER
      ════════════════════════════════════════════ */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: easeOut }}
        className="fixed top-0 inset-x-0 z-50 h-[72px] flex items-center border-b border-white/[0.06] bg-background/60 backdrop-blur-2xl"
      >
        <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl p-[1.5px] bg-gradient-to-br from-primary to-accent shadow-[0_0_20px_-4px_hsl(var(--primary)/0.6)]">
              <div className="w-full h-full rounded-[13px] bg-background flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div>
              <div className="text-base font-black tracking-tight">Indian Bank HRMS</div>
              <div className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">Enterprise Platform</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground/70">
            <a href="#features"  className="hover:text-foreground transition-colors">Modules</a>
            <a href="#demo"      className="hover:text-foreground transition-colors">Demo</a>
            <a href="#ecosystem" className="hover:text-foreground transition-colors">Platform</a>
          </nav>

          {/* CTA + Theme Toggle */}
          <div className="flex items-center gap-3">

            {/* ── Premium Theme Toggle ── */}
            <button
              id="theme-toggle"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label="Toggle theme"
              className="relative w-[52px] h-7 rounded-full border border-foreground/10 bg-foreground/5 hover:bg-foreground/10 transition-all duration-300 flex items-center px-1 overflow-hidden"
            >
              {/* Sliding thumb */}
              <motion.div
                className="w-5 h-5 rounded-full shadow-md flex items-center justify-center z-10 relative"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : 'linear-gradient(135deg, #f59e0b, #f97316)',
                  boxShadow: isDark
                    ? '0 0 10px 2px rgba(99,102,241,0.5)'
                    : '0 0 10px 2px rgba(251,191,36,0.5)',
                }}
                animate={{ x: isDark ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isDark ? (
                    <motion.span
                      key="moon"
                      initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="w-3 h-3 text-white" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="sun"
                      initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="w-3 h-3 text-white" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Track labels */}
              <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
                <Sun className="w-2.5 h-2.5 text-amber-400/60" />
                <Moon className="w-2.5 h-2.5 text-indigo-400/60" />
              </div>
            </button>

            <Link href="/login" className="hidden sm:block text-sm font-semibold text-muted-foreground/70 hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/login">
              <button className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-[0_0_24px_-6px_hsl(var(--primary))] hover:shadow-[0_0_32px_-4px_hsl(var(--primary))] hover:brightness-110 transition-all active:scale-95">
                Get Started <span className="ml-1">→</span>
              </button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* ════════════════════════════════════════════
          HERO — PREMIUM
      ════════════════════════════════════════════ */}
      <main className="relative z-10">
        <section className="relative min-h-[100svh] flex flex-col items-center justify-center px-6 pt-28 pb-20 overflow-hidden text-center">

          {/* ── Floating orb particles ── */}
          {[
            { w: 600, h: 600, top: '-10%', left: '-5%',  color: 'bg-primary/20',  blur: 'blur-[140px]', delay: '0s'   },
            { w: 500, h: 500, top: '10%',  right: '-8%', color: 'bg-accent/20',   blur: 'blur-[120px]', delay: '1.5s' },
            { w: 350, h: 350, top: '55%',  left: '30%',  color: 'bg-violet-500/10',blur:'blur-[100px]', delay: '3s'   },
          ].map((orb, i) => (
            <div
              key={i}
              className={`absolute rounded-full ${orb.color} ${orb.blur} animate-pulse pointer-events-none`}
              style={{
                width: orb.w, height: orb.h,
                top: orb.top, left: (orb as any).left, right: (orb as any).right,
                animationDelay: orb.delay, animationDuration: `${6 + i * 2}s`,
              }}
            />
          ))}

          {/* ── Noise texture ── */}
          <div className="absolute inset-0 opacity-[0.025] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC45IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI24pIiBvcGFjaXR5PSIxIi8+PC9zdmc+')]" />

          {/* ── Content ── */}
          <div className="relative z-10 max-w-6xl mx-auto space-y-10">

            {/* Live badge */}
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: easeOut }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-xl shadow-[0_0_40px_-12px_hsl(var(--primary))]"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">Version 4.0 — Now Live</span>
              <ArrowRight className="w-3.5 h-3.5 text-primary" />
            </motion.div>

            {/* Headline — word-by-word reveal */}
            <div className="space-y-2">
              <div className="overflow-hidden">
                <motion.p
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, ease: easeOut, delay: 0.1 }}
                  className="text-2xl md:text-3xl font-semibold text-foreground/40 tracking-wide uppercase"
                >
                  Introducing
                </motion.p>
              </div>

              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="text-[clamp(52px,10vw,120px)] font-black tracking-tighter leading-[0.9]"
              >
                {['The', 'Future', 'of'].map((word, i) => (
                  <span key={word} className="inline-block overflow-hidden mr-[0.25em]">
                    <motion.span
                      className="inline-block text-foreground"
                      initial={{ y: '110%', opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.75, delay: 0.25 + i * 0.1, ease: easeOut }}
                    >
                      {word}
                    </motion.span>
                  </span>
                ))}
                <br />
                {/* Gradient word */}
                <span className="inline-block overflow-hidden">
                  <motion.span
                    className="inline-block relative pt-2"
                    initial={{ y: '110%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.85, delay: 0.6, ease: easeOut }}
                  >
                    <span className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/15 to-primary/20 blur-3xl rounded-3xl" />
                    <span className="relative bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
                      HR Management
                    </span>
                  </motion.span>
                </span>
              </motion.h1>
            </div>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.75, ease: easeOut }}
              className="text-xl md:text-2xl text-foreground/50 font-medium max-w-2xl mx-auto leading-relaxed"
            >
              One unified platform to automate payroll, streamline hiring, and{' '}
              <span className="text-foreground font-bold">empower 42,000+ employees</span>
              {' '}— without the complexity.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.9, ease: easeOut }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/login">
                <button className="group relative h-16 px-12 rounded-full bg-primary text-primary-foreground text-lg font-black overflow-hidden shadow-[0_0_60px_-10px_hsl(var(--primary))] hover:shadow-[0_0_90px_-8px_hsl(var(--primary))] transition-all duration-500 hover:-translate-y-1.5 active:translate-y-0">
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                  <span className="absolute inset-0 rounded-full ring-2 ring-primary/40 scale-100 group-hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <span className="relative flex items-center gap-3">
                    Explore Live Demo
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </span>
                </button>
              </Link>
              <Link href="/login">
                <button className="h-16 px-10 rounded-full border-2 border-foreground/10 text-lg font-semibold text-foreground/60 hover:text-foreground hover:border-foreground/25 hover:bg-foreground/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1">
                  Contact Sales
                </button>
              </Link>
            </motion.div>

            {/* Stat cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="flex flex-wrap items-stretch justify-center gap-3 pt-4"
            >
              {[
                { value: '42,000+', label: 'Employees Served',   icon: Users        },
                { value: '99.99%',  label: 'Uptime SLA',         icon: Zap           },
                { value: '12',      label: 'Integrated Modules',  icon: Sparkles      },
                { value: 'Zero',    label: 'Security Breaches',   icon: Shield        },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.15 + i * 0.07 }}
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-card/50 border border-foreground/[0.06] backdrop-blur-xl hover:border-primary/25 hover:bg-primary/5 transition-all duration-300 cursor-default"
                >
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <s.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="text-base font-black text-foreground leading-none">{s.value}</div>
                    <div className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mt-0.5">{s.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </section>

        {/* ── Interactive Demo & Ecosystem (already premium) ── */}
        <div id="demo"><InteractiveDemo /></div>
        <div id="ecosystem"><EcosystemSection /></div>

        {/* ════════════════════════════════════════════
            FEATURE MODULES GRID
        ════════════════════════════════════════════ */}
        <section id="features" className="relative z-10 py-32 px-6 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
          </div>
          <div className="max-w-7xl mx-auto relative">
            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: easeOut }}
              className="text-center mb-20 space-y-5"
            >
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary/60">Platform Modules</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight text-foreground">
                Everything you need.<br />
                <span className="text-foreground/30">Nothing you don't.</span>
              </h2>
              <p className="text-lg text-foreground/50 max-w-xl mx-auto font-medium">
                Eight deeply integrated modules — one subscription, zero complexity.
              </p>
            </motion.div>

            {/* Grid */}
            <div id="features-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={i}
                    className="group relative cursor-default feature-card hover:-translate-y-1.5 transition-transform duration-300"
                  >
                    {/* Card glow on hover */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                      style={{ background: f.glow }}
                    />
                    <div className="relative h-full bg-card/40 border border-foreground/[0.07] rounded-2xl p-6 overflow-hidden hover:border-foreground/15 transition-all duration-500">
                      {/* Shine sweep */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl mb-5 p-[1.5px] bg-gradient-to-br ${f.color} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                        <div className="w-full h-full rounded-[10px] bg-background flex items-center justify-center">
                          <Icon className="w-5 h-5 text-foreground" />
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-foreground mb-2 tracking-tight">{f.title}</h3>
                      <p className="text-sm text-foreground/60 leading-relaxed">{f.description}</p>

                      {/* Bottom arrow */}
                      <div className="mt-5 flex items-center gap-1 text-xs font-bold text-foreground/25 group-hover:text-primary/60 transition-colors">
                        Learn more <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            HORIZONTAL SCROLL SECTION (GSAP PIN)
        ════════════════════════════════════════════ */}
        <section ref={horizontalSectionRef} className="relative z-20 bg-background overflow-hidden h-[100vh]">
          <div className="absolute inset-0 bg-background/[0.02]" />
          
          <div className="h-full flex items-center">
            {/* The sliding track */}
            <div ref={sliderRef} className="flex flex-nowrap w-[400vw] h-full items-center">
              
              {/* Panel 1 */}
              <div className="horizontal-panel w-[100vw] h-screen flex-shrink-0 flex flex-col md:flex-row items-center justify-center p-12 md:p-24 gap-12 border-r border-foreground/[0.05]">
                <div className="flex-1 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4" /> Deep Dive: Insights
                  </div>
                  <h3 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                    Predictive<br />Intelligence
                  </h3>
                  <p className="text-xl text-foreground/50 font-medium max-w-md leading-relaxed">
                    Instantly identify flight-risk employees and forecast compensation impact with 98% accuracy. Our AI parses years of historical data so you don't have to.
                  </p>
                </div>
                <div className="flex-1 relative aspect-square md:aspect-video rounded-3xl overflow-hidden shadow-2xl border border-foreground/10 bg-card/50 flex items-center justify-center p-8">
                   {/* Placeholder illustration */}
                   <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/10 relative overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
                      <TrendingUp className="w-24 h-24 text-primary opacity-50" />
                   </div>
                </div>
              </div>

              {/* Panel 2 */}
              <div className="horizontal-panel w-[100vw] h-screen flex-shrink-0 flex flex-col md:flex-row items-center justify-center p-12 md:p-24 gap-12 border-r border-foreground/[0.05]">
                <div className="flex-1 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs font-bold uppercase tracking-wider">
                    <Shield className="w-4 h-4" /> Global Compliance
                  </div>
                  <h3 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                    Statutory<br />Autopilot
                  </h3>
                  <p className="text-xl text-foreground/50 font-medium max-w-md leading-relaxed">
                    Zero manual tax interventions required. PT, PF, ESIC, and TDS regulations are continuously updated and applied proactively.
                  </p>
                </div>
                <div className="flex-1 relative aspect-square md:aspect-video rounded-3xl overflow-hidden shadow-2xl border border-foreground/10 bg-card/50 flex items-center justify-center p-8">
                   <div className="w-full h-full rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/10 relative overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
                      <Shield className="w-24 h-24 text-violet-500 opacity-50" />
                   </div>
                </div>
              </div>

              {/* Panel 3 */}
              <div className="horizontal-panel w-[100vw] h-screen flex-shrink-0 flex flex-col md:flex-row items-center justify-center p-12 md:p-24 gap-12 border-r border-foreground/[0.05]">
                 <div className="flex-1 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <Globe className="w-4 h-4" /> Work Anywhere
                  </div>
                  <h3 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                    Limitless<br />Mobility
                  </h3>
                  <p className="text-xl text-foreground/50 font-medium max-w-md leading-relaxed">
                    Native mobile apps for iOS and Android ensure managers can approve expenses and review candidate profiles while miles away from a laptop.
                  </p>
                </div>
                <div className="flex-1 relative aspect-square md:aspect-video rounded-3xl overflow-hidden shadow-2xl border border-foreground/10 bg-card/50 flex items-center justify-center p-8">
                   <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/10 relative overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
                      <Globe className="w-24 h-24 text-emerald-500 opacity-50" />
                   </div>
                </div>
              </div>

              {/* Panel 4 */}
              <div className="horizontal-panel w-[100vw] h-screen flex-shrink-0 flex flex-col md:flex-row items-center justify-center p-12 md:p-24 gap-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5" />
                <div className="flex-1 space-y-6 relative z-10 text-center mx-auto max-w-2xl flex flex-col items-center">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent p-0.5 shadow-2xl shadow-primary/40 rotate-12 mb-6">
                    <div className="w-full h-full bg-background rounded-[22px] flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
                    Start <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Today.</span>
                  </h3>
                  <p className="text-xl text-foreground/50 font-medium max-w-lg leading-relaxed">
                    Deploy entirely automated HR infrastructure in hours, not months. Join the hundreds scaling smoothly.
                  </p>
                  <Link href="/login" className="pt-6">
                    <button className="h-16 px-10 rounded-full bg-primary text-primary-foreground text-lg font-black shadow-[0_0_40px_-5px_hsl(var(--primary))] hover:scale-105 transition-all">
                      Unlock Full Demo
                    </button>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            ENTERPRISE CAPABILITIES BAR
        ════════════════════════════════════════════ */}
        <section className="relative z-10 py-20 border-y border-foreground/[0.05] bg-foreground/[0.02] backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="flex flex-col lg:flex-row items-center gap-12"
            >
              {/* Left text */}
              <div className="flex-1 space-y-4">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary/60">Built to Scale</p>
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground leading-tight">
                  Engineered for<br />
                  <span className="italic text-primary">enterprise scale.</span>
                </h2>
                <p className="text-foreground/50 font-medium leading-relaxed max-w-sm">
                  Modern microservices architecture with 99.99% SLA uptime — trusted by government-grade institutions.
                </p>
              </div>

              {/* Right capability items */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {capabilities.map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07, duration: 0.5 }}
                      className="flex items-center gap-3 bg-card/40 border border-foreground/[0.06] rounded-xl px-4 py-3 hover:bg-card/60 hover:border-foreground/10 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-semibold text-foreground/70">{c.text}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      {/* ════════════════════════════════════════════
          FOOTER CTA + FOOTER
      ════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-foreground/[0.06]">
        {/* CTA Banner */}
        <div className="max-w-7xl mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: easeOut }}
            className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary/90 to-accent p-14 md:p-20 text-center shadow-[0_40px_120px_-20px_hsl(var(--primary)/0.5)]"
          >
            {/* Decor */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.2),transparent_55%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />

            {/* Content */}
            <div className="relative z-10 space-y-7 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-3 h-3" /> Start in under 5 minutes
              </div>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.95]">
                Ready to modernize<br />your workforce?
              </h2>
              <p className="text-xl text-white/70 font-medium">
                Join government organizations trusting Indian Bank HRMS for mission-critical HR operations.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                <Link href="/login">
                  <button className="group relative h-14 px-10 rounded-full bg-white text-primary text-lg font-black overflow-hidden shadow-2xl hover:shadow-[0_0_50px_-5px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-300">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="relative">Get Started Free</span>
                  </button>
                </Link>
                <Link href="/login">
                  <button className="h-14 px-8 rounded-full border border-white/30 text-white/90 text-base font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                    Talk to an Expert
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer bottom bar */}
        <div className="border-t border-foreground/[0.05] bg-foreground/[0.02]">
          <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-bold text-sm text-foreground/70">Indian Bank HRMS</span>
            </div>
            <p className="text-xs text-foreground/30 font-medium">
              © 2026 Indian Bank Enterprise Systems. All rights reserved.
            </p>
            <div className="flex items-center gap-5 text-xs text-foreground/30 font-medium">
              <a href="#" className="hover:text-foreground/60 transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground/60 transition-colors">Security</a>
              <a href="#" className="hover:text-foreground/60 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
