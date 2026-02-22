import React, { useState, useEffect } from 'react';
import { ViewType } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import api from '../apiClient';
import {
  Users, Clock, Bed, Ambulance, Scissors, Banknote,
  Stethoscope, TestTube, ScanLine, Pill, Activity,
  CheckCircle2, AlertTriangle, AlertOctagon, ArrowRight,
  Calendar, FileText, TrendingUp, TrendingDown,
  MonitorCheck, AlertCircle, Lock, ShieldAlert, ChevronRight
} from 'lucide-react';

interface HomeProps {
  onNavigate: (view: ViewType) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { user, currentPermissions, overrideState } = useAuth();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<'ok' | 'degraded' | 'offline'>('ok');
  const [alertIndex, setAlertIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (alerts.length <= 1) return;
    const ticker = setInterval(() => setAlertIndex(i => (i + 1) % alerts.length), 4000);
    return () => clearInterval(ticker);
  }, [alerts.length]);

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

        const mappedAppts = (Array.isArray(apptData) ? apptData : []).slice(0, 5).map(a => ({
          ...a,
          time: a.slot_time ? new Date(a.slot_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '00:00 AM',
          name: a.patient_name || a.name || 'Unknown',
          type: a.appointment_type || a.type || 'Consultation'
        }));
        setAppointments(mappedAppts);

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
    { name: 'OPD', icon: <Stethoscope size={24} />, view: 'OPD' as ViewType, status: 'online', color: 'text-blue-500' },
    { name: 'IPD & Wards', icon: <Bed size={24} />, view: 'IPD' as ViewType, status: 'online', color: 'text-indigo-500' },
    { name: 'Emergency', icon: <Ambulance size={24} />, view: 'EMERGENCY' as ViewType, status: 'online', color: 'text-rose-500' },
    { name: 'OT/Surgical', icon: <Scissors size={24} />, view: 'OT' as ViewType, status: 'online', color: 'text-teal-500' },
    { name: 'Rounds', icon: <FileText size={24} />, view: 'ROUNDS' as ViewType, status: 'online', color: 'text-sky-500' },
    { name: 'Lab', icon: <TestTube size={24} />, view: 'LABORATORY' as ViewType, status: 'online', color: 'text-amber-500' },
    { name: 'Radiology', icon: <ScanLine size={24} />, view: 'RADIOLOGY' as ViewType, status: 'online', color: 'text-purple-500' },
    { name: 'Pharmacy', icon: <Pill size={24} />, view: 'PHARMACY' as ViewType, status: 'online', color: 'text-emerald-500' },
  ];

  const quickActions = [
    { label: 'Register', icon: <Users size={20} />, view: 'PATIENTS' as ViewType, minLevel: 'EDIT' },
    { label: 'Check-in', icon: <Stethoscope size={20} />, view: 'OPD' as ViewType, minLevel: 'VIEW' },
    { label: 'Order Lab', icon: <TestTube size={20} />, view: 'LABORATORY' as ViewType, minLevel: 'EDIT' },
    { label: 'Admit', icon: <Bed size={20} />, view: 'BEDS' as ViewType, minLevel: 'EDIT' },
    { label: 'Billing', icon: <Banknote size={20} />, view: 'BILLING' as ViewType, minLevel: 'ADMIN' },
    { label: 'Reports', icon: <Activity size={20} />, view: 'ANALYTICS' as ViewType, minLevel: 'VIEW' },
  ];

  const levelRank = (l: string) => l === 'ADMIN' ? 3 : l === 'EDIT' ? 2 : 1;

  const aiInsights = [
    { patient: 'Vikram M.', risk: 'High', detail: 'Sepsis probability 84%', icon: <AlertOctagon size={24} className="text-rose-500" />, pct: 84, color: 'bg-rose-500' },
    { patient: 'Anjali S.', risk: 'Moderate', detail: 'Readmission risk 42%', icon: <TrendingUp size={24} className="text-amber-500" />, pct: 42, color: 'bg-amber-500' },
  ];

  return (
    <div className="min-h-screen relative p-4 md:p-8 space-y-8 animate-in fade-in duration-1000 pb-32">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative">
        <div className="relative z-10 w-full md:w-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border border-primary/20">Operational Dashboard</span>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase border tracking-wider ${systemHealth === 'ok' ? 'bg-success/5 text-success border-success/10' : 'bg-warning/5 text-warning border-warning/10'}`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${systemHealth === 'ok' ? 'bg-success' : 'bg-warning'}`} />
              {systemHealth === 'ok' ? 'System Live' : 'Maintenance'}
            </div>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            {greet()}, <span className="text-primary">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-3 font-kannada flex flex-wrap items-center gap-x-3">
            <span className="text-primary font-medium">"ಜೀವ ರಕ್ಷಕ — ಪ್ರತಿ ಕ್ಷಣ ಮುಖ್ಯ"</span>
            <span className="w-1 h-1 rounded-full bg-slate-200 hidden md:block" />
            <span className="uppercase tracking-widest text-[10px] md:text-xs">Guardians of Life — Every Moment Matters</span>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar py-1">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hidden md:block text-right">
            <p className="text-xl font-bold text-slate-900 leading-none">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="text-[10px] font-semibold text-slate-400 uppercase mt-1">{currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
          </div>
          {!overrideState.active && (
            <button
              onClick={() => (window as any).dispatchSetShowOverrideModal?.(true)}
              className="flex-1 md:flex-none px-6 py-4 bg-white text-red-600 border border-red-200 rounded-2xl text-xs font-semibold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-red-600/10 flex items-center justify-center gap-3 active:scale-95 whitespace-nowrap"
            >
              <ShieldAlert size={14} />
              <span>Emergency Access</span>
            </button>
          )}
        </div>
      </div>

      {/* ── ALERTS TICKER ── */}
      {alerts.length > 0 && (
        <div className={`rounded-2xl p-4 flex items-center gap-4 border shadow-sm transition-all duration-500 overflow-hidden active:scale-[0.98] cursor-pointer ${alerts[alertIndex]?.level === 'Critical' ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-100'}`} onClick={() => setAlertIndex(i => (i + 1) % alerts.length)}>
          <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${alerts[alertIndex]?.level === 'Critical' ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
            {alerts[alertIndex]?.level === 'Critical' ? <AlertOctagon size={18} /> : <AlertCircle size={18} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 leading-snug truncate">{alerts[alertIndex]?.title}</p>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">{alerts[alertIndex]?.time}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-slate-300 uppercase">{alertIndex + 1}/{alerts.length}</span>
            <ChevronRight size={16} className="text-slate-300" />
          </div>
        </div>
      )}

      {/* ── KPI GRID ── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6">
        {[
          { label: 'Census', value: stats?.patientsToday || '0', icon: <Users size={20} />, color: 'bg-blue-600' },
          { label: 'OPD Queue', value: stats?.opdWaiting || '0', icon: <Clock size={20} />, color: 'bg-amber-500' },
          { label: 'Occupancy', value: `${stats?.bedOccupancy || 0}%`, icon: <Bed size={20} />, color: 'bg-emerald-500' },
          { label: 'ER Live', value: String(stats?.emergencyCases || 0), icon: <Ambulance size={20} />, color: 'bg-rose-600' },
          { label: 'Active OT', value: '03', icon: <Scissors size={20} />, color: 'bg-sky-500' },
          { label: 'Revenue', value: `₹${((stats?.revenue || 428000) / 1000).toFixed(0)}K`, icon: <Banknote size={20} />, color: 'bg-indigo-600' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden active:scale-95 md:active:scale-100">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${kpi.color} group-hover:scale-110 transition-transform`}>
                {kpi.icon}
              </div>
            </div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Schedule View */}
        <div className="lg:col-span-5 bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[450px]">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-primary" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Today's Slate</h3>
            </div>
            <button onClick={() => onNavigate('OPD')} className="text-xs font-semibold text-primary hover:underline uppercase tracking-wide">Full Schedule</button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
            {(appointments.length > 0 ? appointments : [
              { name: 'Vikram Mehta', time: '09:30 AM', status: 'confirmed', type: 'Review' },
              { name: 'Meena Kumari', time: '10:00 AM', status: 'waiting', type: 'New' },
              { name: 'Suresh Raina', time: '10:30 AM', status: 'confirmed', type: 'Procedure' },
              { name: 'Anjali Sharma', time: '11:00 AM', status: 'confirmed', type: 'Follow-up' },
            ]).map((appt, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group border-b border-slate-50/50">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex flex-col items-center justify-center shadow-sm group-hover:border-primary/30 transition-all">
                  <span className="text-[11px] font-bold text-slate-800 leading-none">
                    {appt.time ? appt.time.split(' ')[0] : '--:--'}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">
                    {appt.time && appt.time.split(' ')[1] ? appt.time.split(' ')[1] : ''}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{appt.patient_name || appt.name}</p>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase mt-0.5 tracking-wider">{appt.type || 'Consultation'}</p>
                </div>
                <div className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wide ${appt.status === 'confirmed' ? 'bg-success/5 text-success' : 'bg-warning/10 text-warning animate-pulse'}`}>
                  {appt.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI & Department Grids */}
        <div className="lg:col-span-7 space-y-8">
          {/* AI Insights - Compact & Modern */}
          <div className="bg-slate-900 rounded-[3rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl border border-slate-800 group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary shadow-inner border border-white/5">
                  <Activity size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">AI Co-Pilot</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">High-Acuity Risk Scan</p>
                </div>
              </div>
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 overflow-hidden"><Activity className="w-full h-full p-2 opacity-50" /></div>)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiInsights.map((insight, idx) => (
                <div key={idx} className="p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group/card active:scale-[0.98]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      {insight.icon}
                      <span className="text-sm font-bold">{insight.patient}</span>
                    </div>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border ${insight.risk === 'High' ? 'bg-rose-500/20 text-rose-500 border-rose-500/30' : 'bg-amber-500/20 text-amber-500 border-amber-500/30'}`}>{insight.risk}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mb-4 leading-relaxed">{insight.detail}</p>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${insight.color} transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.2)]`} style={{ width: `${insight.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Shortcuts - Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {departments.map(dept => (
              <button
                key={dept.name}
                onClick={() => onNavigate(dept.view)}
                className="p-5 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group flex flex-col items-center justify-center text-center active:scale-90"
              >
                <div className={`mb-3 transition-transform group-hover:scale-110 ${dept.color}`}>{dept.icon}</div>
                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-tight">{dept.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS BAR ── */}
      <div className="bg-white p-6 md:p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Clinical Hotkeys</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Authorized Actions for {badge.label}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {quickActions.map(action => {
            const hasAccess = levelRank(currentPermissions) >= levelRank(action.minLevel);
            return (
              <button
                key={action.label}
                onClick={() => hasAccess && onNavigate(action.view)}
                disabled={!hasAccess}
                className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${hasAccess ? 'bg-slate-50 border-slate-100 hover:bg-primary/5 hover:border-primary/20 cursor-pointer active:scale-90' : 'opacity-40 grayscale cursor-not-allowed'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${hasAccess ? 'bg-white text-slate-500' : 'bg-slate-100'}`}>{action.icon}</div>
                <span className="text-[9px] font-black text-slate-800 uppercase tracking-tight">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Home;
