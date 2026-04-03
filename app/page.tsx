'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  DollarSign,
  Calendar,
  Plane,
  TrendingUp,
  Clock,
  FileText,
  Briefcase,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';

const features = [
  {
    title: 'Personnel Information',
    description: 'Comprehensive employee database with rich profiles and dynamic organization charts',
    icon: Users,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    title: 'Intelligent Payroll',
    description: 'Automated salary processing with smart compliance algorithms and direct bank integrations',
    icon: DollarSign,
    color: 'from-emerald-400 to-teal-600',
  },
  {
    title: 'Leave & Absence',
    description: 'Intuitive time-off requests with real-time balance tracking and intelligent approval routing',
    icon: Calendar,
    color: 'from-purple-500 to-violet-600',
  },
  {
    title: 'Travel & Expenses',
    description: 'Frictionless expense capturing, policy enforcement, and rapid reimbursement cycles',
    icon: Plane,
    color: 'from-amber-400 to-orange-600',
  },
  {
    title: 'Performance & Goals',
    description: 'Continuous feedback, 360-degree reviews, and objective-driven performance tracking',
    icon: TrendingUp,
    color: 'from-rose-400 to-red-600',
  },
  {
    title: 'Time Tracking',
    description: 'Biometric integration and geolocation-based attendance with precise timesheets',
    icon: Clock,
    color: 'from-cyan-400 to-blue-600',
  },
  {
    title: 'Tax Compliance',
    description: 'Automated tax deductions, flexible declarations, and instant generation of Form 16',
    icon: FileText,
    color: 'from-fuchsia-400 to-purple-600',
  },
  {
    title: 'Talent Acquisition',
    description: 'End-to-end recruitment pipelines, AI-driven sorting, and seamless onboarding',
    icon: Briefcase,
    color: 'from-pink-400 to-rose-600',
  },
];

const capabilities = [
  { icon: Shield, text: 'Enterprise-grade Security & Encryption' },
  { icon: Zap, text: 'Lightning-fast Real-time Dashboards' },
  { icon: Sparkles, text: 'AI-powered Insights & Analytics' },
  { icon: CheckCircle2, text: 'Automated Statutory Compliance' },
  { icon: Users, text: 'Multi-tenant Architecture' },
  { icon: Building2, text: 'Supports 100,000+ Employees' },
];

const userRoles = [
  {
    role: 'Employee',
    email: 'rajesh.kumar@indianbank.com',
    password: 'password123',
    description: 'Self-service portal access',
  },
  {
    role: 'Manager',
    email: 'priya.sharma@indianbank.com',
    password: 'password123',
    description: 'Team approvals and reviews',
  },
  {
    role: 'HR Administrator',
    email: 'admin.hr@indianbank.com',
    password: 'password123',
    description: 'Full system configuration',
  },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 50, damping: 15 }
  },
};

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden font-sans text-foreground selection:bg-primary/30">
      {/* Premium Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse duration-10000" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse duration-7000 delay-1000" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen opacity-40 animate-pulse duration-8000" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Glassmorphism Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 inset-x-0 z-50 border-b border-white/10 dark:border-white/5 bg-background/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/40"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-accent p-[1px] shadow-lg shadow-primary/20 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-full h-full bg-background/90 rounded-[15px] flex items-center justify-center backdrop-blur-md">
                <Building2 className="w-5 h-5 md:w-6 md:h-6 text-foreground group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Indian Bank HRMS</h1>
              <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-widest hidden sm:block">Enterprise Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Documentation
            </Link>
            <div className="h-4 w-px bg-border/50 hidden sm:block" />
            <Link href="/login">
              <Button className="h-10 md:h-11 px-6 md:px-8 bg-foreground text-background hover:bg-foreground/90 rounded-full shadow-[0_4px_14px_0_hsl(var(--foreground)/20%)] transition-all hover:scale-105 active:scale-95 font-medium">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 pb-16 md:pt-48 md:pb-32">
        <motion.div 
          style={{ y }}
          className="max-w-6xl mx-auto px-6 text-center space-y-10"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4 shadow-xl"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium tracking-wide">Version 4.0 is now live</span>
          </motion.div>

          <div className="space-y-6 max-w-4xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1]"
            >
              The Future of <br className="hidden md:block" />
              <span className="relative whitespace-nowrap">
                <span className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-xl opacity-50" />
                <span className="relative bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">HR Management</span>
              </span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-lg md:text-2xl text-muted-foreground/80 leading-relaxed font-medium mx-auto max-w-2xl balance-text"
            >
              A unified, intelligent platform designed to automate payroll, streamline hiring, and empower 40,000+ employees globally.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
          >
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold shadow-[0_0_40px_-10px_hsl(var(--primary))] hover:shadow-[0_0_60px_-15px_hsl(var(--primary))] transition-all duration-300 hover:-translate-y-1">
                Explore Demo <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-full border-foreground/10 hover:bg-foreground/5 text-lg font-semibold backdrop-blur-md transition-all duration-300">
                Contact Sales
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* Feature Showcase Grid */}
      <section className="relative z-10 py-24 md:py-32 md:-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20 space-y-4"
          >
            <h3 className="text-3xl md:text-5xl font-bold tracking-tight">Everything you need. <span className="text-muted-foreground">Nothing you don't.</span></h3>
            <p className="text-lg text-muted-foreground font-medium">Eight powerful modules integrated into one seamless experience.</p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div key={idx} variants={fadeInUp} className="group h-full">
                  <div className="relative h-full bg-card/40 backdrop-blur-xl border border-white/10 dark:border-white/5 p-8 rounded-[2rem] hover:bg-card/60 transition-all duration-500 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} p-[1px] mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-500`}>
                      <div className="w-full h-full bg-background/80 rounded-[15px] flex items-center justify-center backdrop-blur-sm">
                        <Icon className="w-6 h-6 text-foreground" />
                      </div>
                    </div>
                    <h4 className="text-xl font-bold mb-3 tracking-tight">{feature.title}</h4>
                    <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Enterprise Capabilities */}
      <section className="relative z-10 py-24 bg-foreground/5 border-y border-foreground/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row items-center justify-between gap-16"
          >
            <div className="flex-1 space-y-8">
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                Engineered for <br/>
                <span className="text-primary italic pr-2">enterprise scale</span>
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Built on a modern microservices architecture, Indian Bank HRMS delivers unparalleled performance, military-grade security, and 99.99% uptime for your critical operations.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {capabilities.map((cap, idx) => {
                  const Icon = cap.icon;
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-sm text-foreground/90">{cap.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Glass Box Visual */}
            <div className="flex-1 w-full max-w-lg relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent opacity-20 blur-3xl rounded-full" />
              <div className="relative aspect-square rounded-[2.5rem] bg-card/40 border border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col p-8">
               <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                 <div className="space-y-1">
                   <h5 className="font-bold text-xl">System Status</h5>
                   <p className="text-sm text-emerald-500 font-medium flex items-center gap-2">
                     <span className="relative flex h-2 w-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                     </span>
                     All Systems Operational
                   </p>
                 </div>
                 <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-xl">
                   <Zap className="w-5 h-5 text-primary" />
                 </div>
               </div>
               
               <div className="space-y-4 flex-1">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="h-12 w-full bg-white/5 rounded-xl animate-pulse" style={{ animationDelay: `${i * 150}ms`}} />
                 ))}
               </div>
               
               <div className="mt-auto h-24 bg-gradient-to-t from-primary/10 to-transparent rounded-xl border-b-2 border-primary/50" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Demo Access */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 space-y-4"
          >
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight">Experience it yourself</h3>
            <p className="text-lg text-muted-foreground font-medium">Use our pre-configured demo credentials.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userRoles.map((user, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Card className="relative h-full border-white/10 dark:border-white/5 bg-card/40 backdrop-blur-xl rounded-[2rem] overflow-hidden hover:border-primary/30 transition-all duration-300">
                  <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="pt-8 px-8 pb-4">
                    <CardTitle className="text-2xl font-bold">{user.role}</CardTitle>
                    <CardDescription className="text-sm">{user.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="px-8 pb-8 space-y-6">
                    <div className="px-4 py-3 rounded-xl bg-background/50 border border-white/5 font-mono text-xs space-y-3 backdrop-blur-md">
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground/70 uppercase font-sans font-bold text-[10px] tracking-wider">Email</span>
                        <span className="text-foreground tracking-tight">{user.email}</span>
                      </div>
                      <div className="h-px w-full bg-white/5" />
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground/70 uppercase font-sans font-bold text-[10px] tracking-wider">Password</span>
                        <span className="text-foreground tracking-tight">{user.password}</span>
                      </div>
                    </div>
                    <Link href="/login" className="block">
                      <Button className="w-full rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-foreground transition-all h-12 shadow-none font-medium">
                        Login as {user.role}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <footer className="relative z-10 border-t border-white/10 dark:border-white/5 bg-background/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-primary to-accent p-12 md:p-20 text-center shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_50%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.2))]" />
            <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">Ready to modernize your workforce?</h2>
              <p className="text-xl text-white/80 font-medium">Join leading organizations trusting Indian Bank HRMS for their daily operations.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Link href="/login">
                  <Button size="lg" className="h-14 px-10 rounded-full bg-white text-primary hover:bg-white/90 text-lg font-bold shadow-xl transition-transform hover:scale-105 active:scale-95">
                    Start Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-20 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-foreground" />
              <span className="font-bold text-foreground">Indian Bank HRMS</span>
            </div>
            <p className="text-sm font-medium">© 2026 Indian Bank Enterprise Systems. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
