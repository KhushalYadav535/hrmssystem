'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
  ShieldCheck,
  Activity,
  Server,
  Workflow,
  Target,
  Zap,
  Globe,
  Lock,
  ArrowRight,
  Star,
} from 'lucide-react';

/* ─── Orbit Node definition ───────────────────────────────── */
const NODES = [
  { icon: ShieldCheck, label: 'ISO 27001',      angle: 0   },
  { icon: Activity,    label: 'Real-time Sync',  angle: 45  },
  { icon: Server,      label: 'Cloud Hosted',    angle: 90  },
  { icon: Lock,        label: 'AES-256',         angle: 135 },
  { icon: Target,      label: 'AI Analytics',    angle: 180 },
  { icon: Workflow,    label: 'Automations',     angle: 225 },
  { icon: Zap,         label: 'Fast Processing', angle: 270 },
  { icon: Globe,       label: 'Remote Access',   angle: 315 },
];

/* ─── Orbit ring component ────────────────────────────────── */
function OrbitNode({ icon: Icon, label, angle, radius }: { icon: any; label: string; angle: number; radius: number }) {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * radius;
  const y = Math.sin(rad) * radius;

  return (
    <motion.div
      className="absolute"
      style={{
        left: `calc(50% + ${x}px)`,
        top:  `calc(50% + ${y}px)`,
        translateX: '-50%',
        translateY: '-50%',
      }}
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: angle / 720, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.15 }}
    >
      <div className="group relative flex flex-col items-center gap-1.5 cursor-default">
        {/* Icon box */}
        <div className="w-11 h-11 rounded-2xl bg-card/80 border border-white/10 backdrop-blur-xl flex items-center justify-center shadow-xl group-hover:border-primary/40 group-hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)] transition-all duration-300">
          <Icon className="w-4.5 h-4.5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
        </div>
        {/* Label */}
        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50 group-hover:text-foreground/70 transition-colors whitespace-nowrap hidden lg:block">
          {label}
        </span>
      </div>
    </motion.div>
  );
}

/* ─── Trust Stats bar ─────────────────────────────────────── */
const TRUST_STATS = [
  { value: '99.99%', label: 'Uptime SLA' },
  { value: '40K+',   label: 'Employees Served' },
  { value: '0',      label: 'Data Breaches' },
  { value: '100%',   label: 'Compliance Rate' },
];

/* ─── Power Cards ─────────────────────────────────────────── */
const POWERS = [
  {
    icon: Zap,
    title: 'The Power of Automation',
    desc: 'Eliminate 90% of manual HR tasks. Intelligent workflows trigger payroll, notifications, and approvals automatically — no human bottleneck.',
    tag: 'Workflow Engine',
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/20',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/15',
  },
  {
    icon: Globe,
    title: 'A Unified Ecosystem',
    desc: 'From Day 1 onboarding to final exit. Every module — payroll, attendance, performance, loans — shares one master database updated in real-time.',
    tag: 'Integrated Platform',
    color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/20',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/15',
  },
  {
    icon: ShieldCheck,
    title: 'The Trustline',
    desc: 'Bank-grade AES-256 encryption, multifactor authentication, and ISO 27001 audited compliance guaranteeing your workforce data is impenetrable.',
    tag: 'Security First',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15',
  },
];

/* ─── Main Export ─────────────────────────────────────────── */
export function EcosystemSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-200, 200], [8, -8]), { stiffness: 100, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-200, 200], [-8, 8]), { stiffness: 100, damping: 20 });

  function onMouseMove(e: React.MouseEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top  - rect.height / 2);
  }

  return (
    <section className="relative z-10 overflow-hidden py-32">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,hsl(var(--primary)/0.08),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6">

        {/* ── Section heading ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20 space-y-5"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
            <Star className="w-3 h-3" /> Platform Architecture
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
            Why Indian Bank HRMS?<br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              Power. Ecosystem. Trust.
            </span>
          </h2>
          <p className="text-lg text-muted-foreground/70 max-w-2xl mx-auto font-medium">
            It's not a tool. It's a living, breathing ecosystem — 12 modules, one master database, zero siloes.
          </p>
        </motion.div>

        {/* ── Trust stats bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24"
        >
          {TRUST_STATS.map((s, i) => (
            <div
              key={i}
              className="bg-card/30 border border-white/[0.07] rounded-2xl p-6 text-center backdrop-blur-sm hover:bg-card/50 transition-colors"
            >
              <div className="text-3xl md:text-4xl font-black bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground font-semibold mt-2 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* ── Orbit + Power cards ── */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: Orbit canvas */}
          <motion.div
            ref={containerRef}
            onMouseMove={onMouseMove}
            onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
            style={{ rotateX, rotateY, transformPerspective: 1000 }}
            className="relative h-[480px] flex items-center justify-center cursor-default"
          >
            {/* Outer SVG dashes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 480 480">
              <motion.circle
                cx="240" cy="240" r="195"
                fill="none" stroke="hsl(var(--foreground)/0.05)" strokeWidth="1" strokeDasharray="3 8"
                animate={{ rotate: 360 }}
                transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: '240px 240px' }}
              />
              <motion.circle
                cx="240" cy="240" r="155"
                fill="none" stroke="hsl(var(--primary)/0.15)" strokeWidth="1" strokeDasharray="4 10"
                animate={{ rotate: -360 }}
                transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: '240px 240px' }}
              />
              {/* Glowing arc */}
              <motion.circle
                cx="240" cy="240" r="195"
                fill="none"
                stroke="url(#arcGrad)" strokeWidth="2"
                strokeDasharray="80 1164"
                animate={{ strokeDashoffset: [0, -1244] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              />
              <defs>
                <linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                  <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Orbit nodes */}
            {NODES.map(n => (
              <OrbitNode key={n.angle} {...n} radius={170} />
            ))}

            {/* Core node */}
            <div className="relative z-20 flex flex-col items-center">
              {/* Pulsing rings */}
              {[1,2,3].map(r => (
                <motion.div
                  key={r}
                  className="absolute rounded-full border border-primary/20"
                  style={{ width: 60 + r * 28, height: 60 + r * 28 }}
                  animate={{ scale: [1, 1.3 + r * 0.05, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 3, delay: r * 0.8, repeat: Infinity }}
                />
              ))}
              {/* Central disk */}
              <div className="relative w-[80px] h-[80px] rounded-full bg-background border border-primary/40 shadow-[0_0_60px_-10px_hsl(var(--primary))] flex flex-col items-center justify-center backdrop-blur-xl">
                <div className="absolute inset-0 rounded-full border-t-2 border-primary/60 animate-spin" style={{ animationDuration: '4s' }} />
                <Activity className="w-7 h-7 text-primary mb-0.5" />
                <span className="text-[9px] font-bold text-muted-foreground tracking-wider uppercase">Core</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Power cards */}
          <div className="space-y-5">
            {POWERS.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -3 }}
                className={`relative overflow-hidden bg-gradient-to-br ${p.color} border rounded-2xl p-6 backdrop-blur-sm cursor-default group transition-all`}
              >
                {/* Subtle shine on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                <div className="relative z-10">
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-xl ${p.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <p.icon className={`w-5 h-5 ${p.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-base">{p.title}</h3>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${p.iconColor} bg-white/5 px-2 py-0.5 rounded-full border border-white/10`}>
                          {p.tag}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground/80 leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* CTA link */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="pt-2"
            >
              <a href="/login" className="group inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                Explore the full platform
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
