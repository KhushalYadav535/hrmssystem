'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  LayoutDashboard,
  CreditCard,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Briefcase,
  ChevronRight,
} from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'payroll',   label: 'Payroll',   icon: CreditCard },
  { id: 'attendance',label: 'Attendance',icon: Clock },
];

/* ─── tiny helpers ─────────────────────────────────────────── */
const Pill = ({ children, color = 'emerald' }: { children: React.ReactNode; color?: string }) => {
  const map: Record<string, string> = {
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    amber:   'bg-amber-500/15   text-amber-400   border-amber-500/25',
    blue:    'bg-blue-500/15    text-blue-400    border-blue-500/25',
    rose:    'bg-rose-500/15    text-rose-400    border-rose-500/25',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${map[color]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {children}
    </span>
  );
};

/* ─── Dashboard ────────────────────────────────────────────── */
function DashboardMock() {
  const bars = [42, 58, 50, 74, 63, 89, 71, 85, 60, 77, 92, 68, 83, 95];

  return (
    <motion.div
      key="dash"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full gap-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1">Overview</p>
          <h2 className="text-2xl font-black tracking-tight">Workforce Pulse</h2>
        </div>
        <Pill color="emerald">Live · 9:21 AM</Pill>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Staff',  value: '42,850', sub: '+124 this month', icon: Users,        col: 'text-blue-400',    bg: 'bg-blue-500/10' },
          { label: 'Present Now',  value: '39,120', sub: '92% attendance',   icon: CheckCircle2, col: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Action Items', value: '143',    sub: 'Pending review',   icon: AlertTriangle,col: 'text-amber-400',   bg: 'bg-amber-500/10' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground font-semibold">{s.label}</span>
              <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-3.5 h-3.5 ${s.col}`} />
              </div>
            </div>
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-[10px] text-muted-foreground/70">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold">Activity Heatmap</span>
          <span className="text-xs text-muted-foreground">Last 14 days</span>
        </div>
        <div className="flex-1 flex items-end gap-[3px]">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t-sm"
              style={{
                background: `linear-gradient(to top, hsl(var(--primary)/0.8), hsl(var(--accent)/0.5))`,
              }}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.9, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Payroll ──────────────────────────────────────────────── */
function PayrollMock() {
  const items = [
    { dept: 'Engineering',  amount: '₹7.2 Cr',  pct: 29, color: 'from-primary/80 to-accent/60' },
    { dept: 'Operations',   amount: '₹6.1 Cr',  pct: 25, color: 'from-emerald-500/70 to-teal-500/50' },
    { dept: 'Branches',     amount: '₹5.8 Cr',  pct: 23, color: 'from-amber-500/70 to-orange-500/50' },
    { dept: 'Corporate',    amount: '₹5.7 Cr',  pct: 23, color: 'from-fuchsia-500/70 to-pink-500/50' },
  ];

  return (
    <motion.div
      key="pay"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full gap-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1">March 2026 Cycle</p>
          <h2 className="text-2xl font-black tracking-tight">Payroll Control</h2>
        </div>
        <Pill color="emerald">Verified</Pill>
      </div>

      {/* Hero stat */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-transparent to-accent/10 border border-white/10 rounded-2xl p-6">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <p className="text-xs text-muted-foreground/70 font-medium mb-2 uppercase tracking-wider">Total Disbursal</p>
        <div className="text-4xl font-black bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">₹24.8 Crore</div>
        <div className="flex items-center gap-1 mt-2 text-emerald-400 text-xs font-semibold">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+3.2% vs last cycle</span>
        </div>
      </div>

      {/* Dept bars */}
      <div className="space-y-3 flex-1">
        <p className="text-xs text-muted-foreground/60 font-semibold uppercase tracking-wider">Department Breakdown</p>
        {items.map((d, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            className="space-y-1.5"
          >
            <div className="flex justify-between text-xs">
              <span className="font-medium">{d.dept}</span>
              <span className="text-muted-foreground">{d.amount}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${d.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${d.pct}%` }}
                transition={{ duration: 1, delay: 0.15 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <button className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-[0.98] shadow-[0_0_30px_-8px_hsl(var(--primary))]">
        <CreditCard className="w-4 h-4" /> Initiate Bank Transfer
        <ChevronRight className="w-4 h-4 ml-auto" />
      </button>
    </motion.div>
  );
}

/* ─── Attendance ───────────────────────────────────────────── */
function AttendanceMock() {
  const days = ['M','T','W','T','F','S','S'];
  const grid = [
    [1,1,1,1,1,0,0],
    [1,1,0,1,1,0,0],
  ];

  const today = 7; // numeric date for highlight demo

  return (
    <motion.div
      key="att"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full gap-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1">April 2026</p>
          <h2 className="text-2xl font-black tracking-tight">Attendance Tracker</h2>
        </div>
        <Pill color="blue">Biometric Active</Pill>
      </div>

      {/* Calendar mini */}
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
        <div className="grid grid-cols-7 gap-1 mb-3">
          {days.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-bold text-muted-foreground/50">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {grid.flat().map((val, i) => {
            const date = i + 1;
            const isWeekend = i % 7 >= 5;
            return (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.02 }}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-semibold ${
                  isWeekend
                    ? 'text-muted-foreground/30'
                    : val
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {date}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'On Time',   value: '91%', color: 'text-emerald-400' },
          { label: 'Late',      value: '6%',  color: 'text-amber-400' },
          { label: 'Absent',    value: '3%',  color: 'text-rose-400' },
        ].map((s, i) => (
          <div key={i} className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-3 text-center">
            <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending leaves */}
      <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.07] rounded-2xl px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-sm font-bold">24 Leave Requests</div>
            <div className="text-[10px] text-muted-foreground">Awaiting your approval</div>
          </div>
        </div>
        <button className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
          Review <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Main Export ──────────────────────────────────────────── */
export function InteractiveDemo() {
  const [active, setActive] = useState('dashboard');
  const [hovered, setHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const ref = useRef<HTMLDivElement>(null);

  // 3-D tilt on mouse move
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 150, damping: 20 });

  function onMouseMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top)  / rect.height - 0.5);
  }
  function onMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
    setHovered(false);
  }

  // Auto-cycle
  useEffect(() => {
    if (hovered) return;
    const t = setInterval(() => {
      setActive(c => {
        const idx = TABS.findIndex(t => t.id === c);
        return TABS[(idx + 1) % TABS.length].id;
      });
    }, 5500);
    return () => clearInterval(t);
  }, [hovered]);

  return (
    <section className="relative z-10 py-28 px-6 overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14 space-y-4"
        >
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary/70">Live Interface Preview</p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
            See <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">HRMS in action</span>
          </h2>
          <p className="text-lg text-muted-foreground/70 max-w-xl mx-auto font-medium">
            Click through the modules below. This is the exact interface your teams will use every day.
          </p>
        </motion.div>

        {/* 3-D Window */}
        <motion.div
          ref={ref}
          style={{ rotateX, rotateY, transformPerspective: 1200 }}
          onMouseMove={onMouseMove}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={onMouseLeave}
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-5xl mx-auto cursor-default"
        >
          {/* Glow border */}
          <div className="absolute -inset-[1px] rounded-[2rem] bg-gradient-to-br from-primary/40 via-transparent to-accent/30 blur-sm" />
          <div className="absolute -inset-[2px] rounded-[2rem] bg-gradient-to-br from-primary/10 to-accent/10" />

          {/* Window chrome */}
          <div className="relative rounded-[2rem] border border-white/10 bg-background/80 backdrop-blur-3xl shadow-[0_40px_120px_-20px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col h-[640px]">
            {/* Title bar */}
            <div className="relative h-12 bg-white/[0.03] border-b border-white/[0.06] flex items-center px-5 gap-4 shrink-0">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80 shadow-[0_0_6px_1px_rgba(239,68,68,0.5)]" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_6px_1px_rgba(245,158,11,0.5)]" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_6px_1px_rgba(16,185,129,0.5)]" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="px-4 py-1 rounded-full bg-white/[0.05] border border-white/[0.07] text-[11px] font-mono text-muted-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_2px_rgba(52,211,153,0.5)]" />
                  portal.indianbank.com/hrms
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <nav className="w-[220px] border-r border-white/[0.06] bg-white/[0.02] p-4 flex flex-col gap-1 shrink-0">
                <div className="flex items-center gap-2.5 px-3 py-4 mb-3 border-b border-white/[0.06]">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg" />
                  <div>
                    <div className="font-bold text-xs tracking-tight">Indian Bank</div>
                    <div className="text-[10px] text-muted-foreground/60">HRMS Portal</div>
                  </div>
                </div>
                {TABS.map(tab => {
                  const isActive = active === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActive(tab.id)}
                      className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebarActive"
                          className="absolute inset-0 bg-primary/15 border border-primary/25 rounded-xl shadow-[0_0_20px_-6px_hsl(var(--primary))]"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      <tab.icon className={`relative z-10 w-4 h-4 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground/50'}`} />
                      <span className={`relative z-10 font-medium transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* Content */}
              <div className="flex-1 p-7 overflow-hidden relative">
                <AnimatePresence mode="wait">
                  {active === 'dashboard'  && <DashboardMock  />}
                  {active === 'payroll'    && <PayrollMock    />}
                  {active === 'attendance' && <AttendanceMock />}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab quick-pick pills (below window) */}
        <div className="flex justify-center gap-3 mt-10">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-300 ${
                active === tab.id
                  ? 'bg-primary/15 border-primary/40 text-primary shadow-[0_0_20px_-6px_hsl(var(--primary))]'
                  : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
