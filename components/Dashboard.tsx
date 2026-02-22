import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import api from '../apiClient';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, TrendingUp, TrendingDown, Clock, Activity, AlertCircle, FileText, ChevronRight } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { overrideState } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
        setError('');
      } catch (err: any) {
        console.error('Dashboard stats error:', err);
        setError(err.message);
        // Fall back to demo data when backend is unavailable
        setStats({
          patientsToday: 1482, totalPatients: 8421, opdWaiting: 42,
          bedOccupancy: 84, totalBeds: 150, occupiedBeds: 126, availableBeds: 24,
          emergencyCases: 8,
          inflowData: [
            { time: '08:00', total: 45, critical: 4 },
            { time: '10:00', total: 120, critical: 12 },
            { time: '12:00', total: 180, critical: 18 },
            { time: '14:00', total: 160, critical: 14 },
            { time: '16:00', total: 140, critical: 10 },
            { time: '18:00', total: 95, critical: 8 },
            { time: '20:00', total: 60, critical: 6 },
          ],
          statusDistribution: [
            { name: 'Stable', value: 72, color: '#2E7D32' },
            { name: 'Under Observation', value: 20, color: '#1E88E5' },
            { name: 'Critical', value: 8, color: '#D32F2F' },
          ],
          recentAlerts: []
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const statusColors: Record<string, string> = {
    'Stable': '#2196F3',
    'Under Observation': '#FF9800',
    'Critical': '#F44336'
  };

  const inflowData = stats?.inflowData || [];
  const statusDistribution = (stats?.statusDistribution || []).map((s: any) => ({
    ...s, color: statusColors[s.name] || '#94a3b8'
  }));

  const alerts = [
    { id: 1, type: 'emergency', title: 'Code Blue: Block C, Ward 4', time: '2 mins ago', level: 'Critical' },
    { id: 2, type: 'lab', title: 'Critical Potassium: Patient PAT-902', time: '14 mins ago', level: 'High' },
    { id: 3, type: 'ot', title: 'Surgical Delay: OT-2 (Anesthesia Prep)', time: '22 mins ago', level: 'Warning' },
  ];

  const aiInsights = [
    { id: 1, patient: 'Vikram M.', risk: 'High', factor: 'Sepsis probability (84%)', icon: '' },
    { id: 2, patient: 'Anjali S.', risk: 'Moderate', factor: 'Readmission probability (42%)', icon: '' },
  ];

  const StatCard = ({ label, value, subtext, icon, trend, colorClass }: any) => (
    <div className={`bg-white p-6 rounded-[2.5rem] border ${colorClass?.border || 'border-slate-100'} shadow-sm hover:shadow-xl transition-all group relative overflow-hidden active:scale-95 md:active:scale-100`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${colorClass?.bg || 'bg-hospital-bg'} ${colorClass?.text || 'text-slate-600'}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black border ${trend.startsWith('+') ? 'bg-success/5 text-success border-success/10' : 'bg-danger/5 text-danger border-danger/10'}`}>
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-4xl font-black tracking-tighter text-slate-900">{value}</h3>
          <span className="text-[10px] font-bold text-slate-300 uppercase whitespace-nowrap">{subtext}</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center animate-in fade-in zoom-in duration-500">
          <div className="text-6xl animate-bounce mb-6"></div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Synchronizing Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-[1600px] mx-auto p-4 md:p-8 pb-32 md:pb-12">
      {/* Header - Stacks on mobile */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 bg-primary/5 rounded-2xl shadow-inner flex items-center justify-center border border-primary/10">
            <Activity className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none">Clinical Command</h1>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${error ? 'bg-amber-400' : 'bg-success'} animate-pulse`}></span>
              {error ? 'DEMO MODE • READ-ONLY' : "Live Hospital Pulse"}
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-4">
          {!overrideState.active && (
            <button
              onClick={() => (window as any).dispatchSetShowOverrideModal?.(true)}
              className="w-full sm:w-auto px-6 py-4 bg-white text-red-600 border-2 border-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/10 hover:bg-red-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 group"
            >
              <ShieldAlert size={16} />
              <span>Emergency Access</span>
            </button>
          )}
          <button className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:bg-teal-800 transition-all active:scale-95">Daily Summary</button>
        </div>
      </div>

      {/* Primary Clinical KPIs - Single column on mobile, multis on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 md:gap-6">
        <StatCard label="Total Census" value={stats?.totalPatients?.toLocaleString() || '0'} subtext="PATIENTS" trend="" icon="" colorClass={{ bg: 'bg-primary/5', text: 'text-primary', border: 'border-primary/10' }} />
        <StatCard label="Admissions" value={stats?.patientsToday?.toLocaleString() || '0'} subtext="TODAY" trend="" icon="" colorClass={{ bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' }} />
        <StatCard label="OPD Queue" value={stats?.opdWaiting || '0'} subtext="WAITING" trend="-12%" icon="" colorClass={{ bg: 'bg-warning/5', text: 'text-warning', border: 'border-warning/10' }} />
        <StatCard label="IPD Load" value={`${stats?.bedOccupancy || 0}%`} subtext="OCCUPIED" trend="Stable" icon="" colorClass={{ bg: 'bg-success/5', text: 'text-success', border: 'border-success/10' }} />
        <StatCard label="ER STAT" value={String(stats?.emergencyCases || 0).padStart(2, '0')} subtext="ACTIVE" trend="+3" icon="" colorClass={{ bg: 'bg-danger/5', text: 'text-danger', border: 'border-danger/10' }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Analytics */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Inflow Chart - Responsive Height */}
          <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <div>
                <h3 className="font-black text-slate-900 text-xl tracking-tight">Patient Flow Patterns</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time throughput metrics</p>
              </div>
              <div className="flex gap-4 bg-slate-50 p-2 rounded-xl">
                <div className="flex items-center gap-2 px-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm" />
                  <span className="text-[9px] font-black text-slate-500 uppercase">Total</span>
                </div>
                <div className="flex items-center gap-2 px-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-danger shadow-sm" />
                  <span className="text-[9px] font-black text-slate-500 uppercase">Critical</span>
                </div>
              </div>
            </div>
            <div className="h-[300px] md:h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={inflowData}>
                  <defs>
                    <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2196F3" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2196F3" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F44336" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#F44336" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '16px' }} />
                  <Area type="monotone" dataKey="total" stroke="#2196F3" strokeWidth={4} fill="url(#colorInflow)" />
                  <Area type="monotone" dataKey="critical" stroke="#F44336" strokeWidth={3} fill="url(#colorCritical)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Stability Donut */}
            <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center">
              <h3 className="w-full font-black text-slate-900 text-xl tracking-tight mb-8">Clinical Stability Mix</h3>
              <div className="relative h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusDistribution} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none" cornerRadius={10}>
                      {statusDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-900 tracking-tighter">{statusDistribution[0]?.value || 0}%</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Recovering</span>
                </div>
              </div>
              <div className="w-full mt-8 grid grid-cols-1 gap-3">
                {statusDistribution.map((item: any) => (
                  <div key={item.name} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.name}</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* OT Status - Vertical List */}
            <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-10">
                <h3 className="font-black text-slate-900 text-xl tracking-tight">Surgical Suite</h3>
                <span className="px-4 py-1.5 bg-primary/10 text-primary text-[9px] font-black rounded-full uppercase tracking-widest">Live OT</span>
              </div>
              <div className="space-y-4">
                {[
                  { ot: 'OT-1', procedure: 'Cardiology', time: 'In Progress', status: 'In-Op', color: 'text-danger' },
                  { ot: 'OT-2', procedure: 'Orthopedic', time: '14:30', status: 'Prep', color: 'text-warning' },
                  { ot: 'OT-3', procedure: 'Neuro', time: '16:00', status: 'Scheduled', color: 'text-slate-400' },
                ].map(ot => (
                  <div key={ot.ot} className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 flex justify-between items-center group hover:bg-white hover:border-primary/20 hover:shadow-lg transition-all active:scale-[0.98]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-slate-100"></div>
                      <div>
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">{ot.ot}</p>
                        <p className="text-sm font-bold text-slate-800">{ot.procedure}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{ot.time}</p>
                      <p className={`text-[9px] font-black uppercase mt-1.5 tracking-tighter ${ot.color}`}>{ot.status}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all">View All Theatres</button>
            </div>
          </div>
        </div>

        {/* Right Column: High Risk & Alerts */}
        <div className="lg:col-span-4 space-y-8">
          {/* Real-time Alerts */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Active Protocol Alerts</h3>
              <div className="h-10 w-10 bg-danger/10 text-danger rounded-2xl flex items-center justify-center animate-pulse shadow-lg shadow-danger/10"><AlertCircle size={20} /></div>
            </div>
            <div className="space-y-4">
              {alerts.map((alert: any) => (
                <div key={alert.id} className={`p-6 rounded-3xl border transition-all active:scale-[0.98] cursor-pointer ${alert.level === 'Critical' ? 'bg-danger/5 border-danger/20' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-xl shadow-sm ${alert.level === 'Critical' ? 'bg-danger text-white' : 'bg-white text-slate-600'}`}>
                      {alert.level}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5"><Clock size={12} /> {alert.time}</span>
                  </div>
                  <h4 className="text-base font-black text-slate-800 leading-snug pr-4">{alert.title}</h4>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">Acknowledge <ChevronRight size={14} /></span>
                    <div className="flex -space-x-2">
                      {[1, 2].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Risk Engine */}
          <div className="bg-medical-gradient rounded-[3rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl border border-white/10 group">
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white opacity-[0.05] rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
            <div className="relative z-10 space-y-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center text-white text-3xl shadow-xl border border-white/20"></div>
                <div>
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] leading-none">Intelligence Engine</p>
                  <h3 className="text-2xl font-black text-white mt-2">Critical Watchlist</h3>
                </div>
              </div>

              <div className="space-y-5">
                {aiInsights.map(insight => (
                  <div key={insight.id} className="p-6 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all cursor-pointer">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl drop-shadow-lg">{insight.icon}</span>
                        <span className="text-lg font-black tracking-tight">{insight.patient}</span>
                      </div>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-xl shadow-lg ${insight.risk === 'High' ? 'bg-danger text-white' : 'bg-warning text-white'}`}>
                        {insight.risk}
                      </span>
                    </div>
                    <p className="text-sm text-white/80 font-medium leading-relaxed mb-6">{insight.factor}</p>
                    <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${insight.risk === 'High' ? 'bg-white w-[84%]' : 'bg-warning w-[42%]'}`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-white/10 border border-white/10 rounded-3xl backdrop-blur-sm">
                <p className="text-xs italic text-white/70 font-kannada leading-relaxed text-center">
                  "ದತ್ತಾಂಶ ಚಾಲಿತ ನಿರ್ಧಾರ" — Insights derived from real-time acuity score 4.0.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
