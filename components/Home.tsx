
import React, { useState, useEffect } from 'react';
import { ViewType } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import api from '../api';
import {
  Users, Clock, Bed, Ambulance, Scissors, Banknote,
  Stethoscope, TestTube, ScanLine, Pill, Activity,
  CheckCircle2, AlertTriangle, AlertOctagon, ArrowRight,
  Calendar, FileText, TrendingUp, TrendingDown,
  MonitorCheck, AlertCircle
} from 'lucide-react';

interface HomeProps {
  onNavigate: (view: ViewType) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { user, currentPermissions } = useAuth();

  // ─── State ──────────────────────────────────────────────────
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<'ok' | 'degraded' | 'offline'>('ok');
  const [alertIndex, setAlertIndex] = useState(0);

  // ─── Clock ──────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ─── Alert ticker rotation ─────────────────────────────────
  useEffect(() => {
    if (alerts.length <= 1) return;
    const ticker = setInterval(() => setAlertIndex(i => (i + 1) % alerts.length), 4000);
    return () => clearInterval(ticker);
  }, [alerts.length]);

  // ─── Fetch all data ────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [dashData, apptData, auditData, healthData] = await Promise.all([
          api.getDashboardStats().catch(() => null),
          api.getAppointments().catch(() => []),
          api.getAuditLogs().catch(() => ({ logs: [] })),
          api.healthCheck().catch(() => ({ status: 'offline' })),
        ]);

        if (dashData) setStats(dashData);
        else setStats({
          patientsToday: 1482, totalPatients: 8421, opdWaiting: 42,
          bedOccupancy: 84, totalBeds: 150, occupiedBeds: 126, availableBeds: 24,
          emergencyCases: 8, revenue: 428500,
        });

        setAppointments(Array.isArray(apptData) ? apptData.slice(0, 5) : []);

        const logAlerts = (auditData?.logs || []).slice(0, 5).map((a: any, i: number) => ({
          id: a.id || i,
          title: `${a.action || 'System Event'}: ${a.entity_type || 'System'}`,
          time: a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          level: a.action?.includes('CRITICAL') ? 'Critical' : 'Info',
        }));
        setAlerts(logAlerts.length > 0 ? logAlerts : [
          { id: 1, title: 'Code Blue: Block C, Ward 4', time: '2 mins ago', level: 'Critical' },
          { id: 2, title: 'Critical Lab: Potassium — PAT-902', time: '14 mins ago', level: 'High' },
          { id: 3, title: 'OT-2 Delay: Anesthesia Prep', time: '22 mins ago', level: 'Warning' },
        ]);

        setSystemHealth(healthData?.status === 'ok' ? 'ok' : 'degraded');
      } catch {
        setSystemHealth('offline');
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  // ─── Helpers ────────────────────────────────────────────────
  const greet = () => {
    const h = currentTime.getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const roleBadge = (level: string) => {
    switch (level) {
      case 'ADMIN': return { bg: 'bg-primary/10 text-primary border-primary/20', label: 'Admin' };
      case 'EDIT': return { bg: 'bg-success/10 text-success border-success/20', label: 'Clinical Staff' };
      default: return { bg: 'bg-slate-100 text-slate-500 border-slate-200', label: 'View Only' };
    }
  };
  const badge = roleBadge(currentPermissions);

  const departments = [
    { name: 'OPD', icon: <Stethoscope size={24} />, view: 'OPD' as ViewType, status: 'online' },
    { name: 'Emergency', icon: <Ambulance size={24} />, view: 'EMERGENCY' as ViewType, status: 'online' },
    { name: 'Laboratory', icon: <TestTube size={24} />, view: 'LABORATORY' as ViewType, status: 'online' },
    { name: 'Radiology', icon: <ScanLine size={24} />, view: 'RADIOLOGY' as ViewType, status: 'online' },
    { name: 'Pharmacy', icon: <Pill size={24} />, view: 'PHARMACY' as ViewType, status: 'online' },
    { name: 'Operation Theatre', icon: <Scissors size={24} />, view: 'OT' as ViewType, status: 'online' },
  ];

  const quickActions = [
    { label: 'Register Patient', icon: <Users size={20} />, view: 'PATIENTS' as ViewType, minLevel: 'EDIT' },
    { label: 'OPD Check-in', icon: <Stethoscope size={20} />, view: 'OPD' as ViewType, minLevel: 'VIEW' },
    { label: 'Emergency Admit', icon: <Ambulance size={20} />, view: 'EMERGENCY' as ViewType, minLevel: 'VIEW' },
    { label: 'Order Lab', icon: <TestTube size={20} />, view: 'LABORATORY' as ViewType, minLevel: 'EDIT' },
    { label: 'Admit Patient', icon: <Bed size={20} />, view: 'BEDS' as ViewType, minLevel: 'EDIT' },
    { label: 'Billing & Payments', icon: <Banknote size={20} />, view: 'BILLING' as ViewType, minLevel: 'ADMIN' },
    { label: 'Doctor Rounds', icon: <FileText size={20} />, view: 'ROUNDS' as ViewType, minLevel: 'EDIT' },
    { label: 'View Reports', icon: <Activity size={20} />, view: 'ANALYTICS' as ViewType, minLevel: 'VIEW' },
  ];

  const levelRank = (l: string) => l === 'ADMIN' ? 3 : l === 'EDIT' ? 2 : 1;
  const filteredActions = quickActions.filter(a => levelRank(currentPermissions) >= levelRank(a.minLevel));

  // ─── AI Insights (mock enriched) ───────────────────────────
  const aiInsights = [
    { patient: 'Vikram M.', risk: 'High', detail: 'Sepsis probability 84% — immediate review', icon: <AlertOctagon size={24} />, pct: 84, color: 'danger' },
    { patient: 'Anjali S.', risk: 'Moderate', detail: 'Readmission risk 42% — flagged by AI', icon: <TrendingUp size={24} />, pct: 42, color: 'warning' },
    { patient: 'Rajesh K.', risk: 'Low', detail: 'Discharge readiness 91% — clear for release', icon: <CheckCircle2 size={24} />, pct: 91, color: 'success' },
  ];

  // ═══════════════════════════════════════════════════════════
  //  R E N D E R
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-hospital-bg font-sans selection:bg-primary/20 p-8 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">

      {/* ── GREETING + TOP BAR ───────────────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-black text-text-main tracking-tight">
              {greet()}, <span className="text-primary">{user?.name?.split(' ')[0] || 'Doctor'}</span>
            </h2>
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${badge.bg}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {badge.label}
            </div>
          </div>
          <p className="text-sm font-medium text-text-muted mt-1 font-kannada flex items-center gap-2">
            <span>"ಜೀವ ರಕ್ಷಣೆ — ಪ್ರತಿ ಕ್ಷಣ ಮುಖ್ಯ"</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>Every moment counts.</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Live Clock & Date */}
          <div className="text-right hidden md:block">
            <p className="text-2xl font-black text-text-main tabular-nums tracking-tight leading-none">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">
              {currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
          </div>

          <div className="h-10 w-px bg-slate-200 hidden md:block"></div>

          {/* System Health */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest ${systemHealth === 'ok' ? 'bg-success/5 text-success border-success/10' :
            systemHealth === 'degraded' ? 'bg-warning/5 text-warning border-warning/10' :
              'bg-danger/5 text-danger border-danger/10'
            }`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${systemHealth === 'ok' ? 'bg-success' : systemHealth === 'degraded' ? 'bg-warning' : 'bg-danger'
              }`} />
            <span className="hidden lg:inline">{systemHealth === 'ok' ? 'System Online' : systemHealth === 'degraded' ? 'Degraded' : 'Offline'}</span>
          </div>
        </div>
      </div>

      {/* ── CRITICAL ALERTS TICKER ─────────────────────── */}
      {alerts.length > 0 && (
        <div className={`relative overflow-hidden rounded-xl p-4 flex items-center gap-4 border transition-all duration-500 ${alerts[alertIndex]?.level === 'Critical'
          ? 'bg-danger/5 border-danger/20'
          : alerts[alertIndex]?.level === 'High'
            ? 'bg-warning/5 border-warning/20'
            : 'bg-primary/5 border-primary/10'
          }`}>
          <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${alerts[alertIndex]?.level === 'Critical' ? 'bg-danger text-white animate-pulse' : 'bg-white text-text-muted border border-slate-100'
            }`}>
            {alerts[alertIndex]?.level === 'Critical' ? <AlertOctagon size={18} /> : <AlertCircle size={18} />}
          </div>
          <div className="flex-1 flex items-center justify-between gap-4">
            <div className="transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
              <p className="text-sm font-bold text-text-main leading-tight">{alerts[alertIndex]?.title}</p>
              <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">{alerts[alertIndex]?.time}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                {alertIndex + 1}/{alerts.length}
              </span>
              <button
                onClick={() => setAlertIndex(i => (i + 1) % alerts.length)}
                className="w-6 h-6 rounded-md bg-white border border-slate-100 flex items-center justify-center text-text-muted hover:text-primary transition-colors"
              >
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── KPI CARDS ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Patients Today', value: stats?.patientsToday?.toLocaleString() || '—', icon: <Users size={20} />, trend: '+12%', trendUp: true, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'OPD Queue', value: stats?.opdWaiting || '—', icon: <Clock size={20} />, trend: '-8%', trendUp: false, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Bed Occupancy', value: `${stats?.bedOccupancy || 0}%`, icon: <Bed size={20} />, trend: `${stats?.occupiedBeds || 0} beds`, trendUp: true, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'ER Active', value: String(stats?.emergencyCases || 0).padStart(2, '0'), icon: <Ambulance size={20} />, trend: 'Live', trendUp: true, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Active OTs', value: '03', icon: <Scissors size={20} />, trend: '2 scheduled', trendUp: true, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Revenue Today', value: `₹${((stats?.revenue || 428500) / 1000).toFixed(0)}K`, icon: <Banknote size={20} />, trend: '+15%', trendUp: true, color: 'text-slate-600', bg: 'bg-slate-50' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-hospital-card p-5 rounded-2xl border border-hospital-border shadow-card hover:shadow-card-hover transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${kpi.bg} ${kpi.color}`}>
                {kpi.icon}
              </div>
              {kpi.trend && (
                <div className={`flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border ${kpi.trendUp ? 'bg-success/5 text-success border-success/10' : 'bg-danger/5 text-danger border-danger/10'
                  }`}>
                  {kpi.trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {kpi.trend}
                </div>
              )}
            </div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] mb-1">{kpi.label}</p>
            <p className="text-2xl font-black text-text-main tracking-tighter">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID: Schedule + AI Insights ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Today's Schedule */}
        <div className="lg:col-span-5 bg-hospital-card rounded-3xl border border-hospital-border shadow-card overflow-hidden flex flex-col">
          <div className="p-6 border-b border-hospital-border flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white border border-slate-100 rounded-lg text-primary">
                <Calendar size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-main">Today's Schedule</h3>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Appointments & Rounds</p>
              </div>
            </div>
            <button onClick={() => onNavigate('OPD')} className="text-[10px] font-black text-primary uppercase tracking-widest hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors">View All →</button>
          </div>
          <div className="divide-y divide-slate-50 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
            {(appointments.length > 0 ? appointments : [
              { id: 1, patient_name: 'Vikram Mehta', doctor_name: 'Dr. Sharma', appointment_time: '09:30 AM', status: 'confirmed', type: 'Follow-up' },
              { id: 2, patient_name: 'Lakshmi Devi', doctor_name: 'Dr. Das', appointment_time: '10:00 AM', status: 'confirmed', type: 'New' },
              { id: 3, patient_name: 'Mohammed F.', doctor_name: 'Dr. Verma', appointment_time: '10:30 AM', status: 'waiting', type: 'Walk-in' },
              { id: 4, patient_name: 'Kavitha Rao', doctor_name: 'Dr. Rao', appointment_time: '11:00 AM', status: 'confirmed', type: 'Follow-up' },
              { id: 5, patient_name: 'Subramaniam P.', doctor_name: 'Dr. Kapoor', appointment_time: '11:30 AM', status: 'confirmed', type: 'Regular' },
            ]).map((appt: any, idx: number) => (
              <div key={appt.id || idx} className="px-6 py-4 flex items-center gap-4 hover:bg-hospital-bg transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xs font-black text-text-body border border-slate-100 shrink-0 group-hover:border-primary/20 group-hover:text-primary transition-colors">
                  {(appt.appointment_time || appt.time || '').replace(/ (AM|PM)/, '').slice(0, 5) || `${9 + idx}:00`}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text-main truncate">{appt.patient_name || appt.patientName || 'Patient'}</p>
                  <p className="text-[10px] font-medium text-text-muted truncate flex items-center gap-1">
                    <span>{appt.doctor_name || appt.doctorName || ''}</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                    <span>{appt.type || 'General'}</span>
                  </p>
                </div>
                <div className={`shrink-0 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border ${appt.status === 'waiting' ? 'bg-warning/5 text-warning border-warning/10' :
                  appt.status === 'confirmed' ? 'bg-success/5 text-success border-success/10' :
                    'bg-slate-50 text-slate-400 border-slate-100'
                  }`}>
                  {appt.status || 'scheduled'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights + Department Status */}
        <div className="lg:col-span-7 space-y-6">

          {/* AI Risk Engine */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl border border-slate-800">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10 text-accent">
                    <Activity size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Clinical Decision Support</p>
                    <h3 className="text-lg font-bold text-white mt-1">AI Risk Monitor</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-black text-accent uppercase tracking-widest bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  Live Analysis
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiInsights.map((insight, idx) => (
                  <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors group">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white/80 group-hover:text-white transition-colors">{insight.icon}</span>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${insight.risk === 'High' ? 'bg-danger/20 text-danger border-danger/30' :
                        insight.risk === 'Moderate' ? 'bg-warning/20 text-warning border-warning/30' :
                          'bg-success/20 text-success border-success/30'
                        }`}>{insight.risk}</span>
                    </div>
                    <p className="text-sm font-bold text-white mb-1">{insight.patient}</p>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-3">{insight.detail}</p>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${insight.color === 'danger' ? 'bg-danger' : insight.color === 'warning' ? 'bg-warning' : 'bg-success'
                        }`} style={{ width: `${insight.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Department Status Grid */}
          <div className="bg-hospital-card rounded-3xl border border-hospital-border shadow-card p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-primary">
                  <MonitorCheck size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-main">System Status</h3>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Departmental Operations</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-black text-success uppercase tracking-widest bg-success/5 px-2.5 py-1 rounded-full border border-success/10">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> All Online
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {departments.map(dept => (
                <button
                  key={dept.name}
                  onClick={() => onNavigate(dept.view)}
                  className="p-4 rounded-xl border border-hospital-border bg-hospital-bg hover:bg-white hover:shadow-md hover:border-primary/20 transition-all group text-left active:scale-95"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-text-muted group-hover:text-primary transition-colors">{dept.icon}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  </div>
                  <p className="text-xs font-bold text-text-main leading-tight">{dept.name}</p>
                  <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Open</span>
                    <ArrowRight size={10} className="text-primary" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS ──────────────────────────────── */}
      <div className="bg-hospital-card rounded-3xl border border-hospital-border shadow-card p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-text-main">Quick Actions</h3>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">
              Authorized for <span className="text-primary">{badge.label}</span>
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredActions.map(action => (
            <button
              key={action.label}
              onClick={() => onNavigate(action.view)}
              className="p-4 rounded-xl border border-hospital-border bg-hospital-bg hover:bg-white hover:border-primary/20 hover:shadow-md transition-all group text-left active:scale-95 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center text-text-muted group-hover:text-primary group-hover:scale-110 transition-all shrink-0">
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-text-main truncate group-hover:text-primary transition-colors">{action.label}</p>
                <div className="flex items-center gap-1 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                  <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">Execute</span>
                  <ArrowRight size={8} className="text-text-muted" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
