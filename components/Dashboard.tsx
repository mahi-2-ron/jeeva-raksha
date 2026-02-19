
import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import api from '../apiClient';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    'Stable': '#2E7D32',
    'Under Observation': '#1E88E5',
    'Critical': '#D32F2F'
  };

  const inflowData = stats?.inflowData || [];
  const statusDistribution = (stats?.statusDistribution || []).map((s: any) => ({
    ...s, color: statusColors[s.name] || '#94a3b8'
  }));

  const alerts = stats?.recentAlerts?.map((a: any, i: number) => ({
    id: a.id || i,
    type: a.entity_type || 'system',
    title: `${a.action}: ${a.entity_type}`,
    time: a.created_at ? new Date(a.created_at).toLocaleTimeString() : '',
    level: a.action?.includes('CRITICAL') ? 'Critical' : 'Info'
  })) || [
      { id: 1, type: 'emergency', title: 'Code Blue: Block C, Ward 4', time: '2 mins ago', level: 'Critical' },
      { id: 2, type: 'lab', title: 'Critical Potassium: Patient PAT-902', time: '14 mins ago', level: 'High' },
      { id: 3, type: 'ot', title: 'Surgical Delay: OT-2 (Anesthesia Prep)', time: '22 mins ago', level: 'Warning' },
    ];

  const aiInsights = [
    { id: 1, patient: 'Vikram M.', risk: 'High', factor: 'Sepsis probability (84%)', icon: '🧬' },
    { id: 2, patient: 'Anjali S.', risk: 'Moderate', factor: 'Readmission probability (42%)', icon: '📈' },
  ];

  const StatCard = ({ label, value, subtext, icon, trend, colorClass }: any) => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner bg-hospital-bg`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border ${trend.startsWith('+') ? 'bg-success/5 text-success border-success/10' : 'bg-danger/5 text-danger border-danger/10'}`}>
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className={`text-3xl font-black tracking-tighter text-slate-900`}>{value}</h3>
          <span className="text-[10px] font-bold text-slate-300 uppercase whitespace-nowrap">{subtext}</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-5xl animate-bounce mb-4">🏥</div>
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-[1600px] mx-auto pb-12">
      {/* Header / Brand Pulse */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 bg-white rounded-2xl shadow-md flex items-center justify-center border border-slate-50">
            <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="#1E88E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 12H9L10.5 8L13.5 16L15 12H17" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">Command Center</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${error ? 'bg-amber-400' : 'bg-success'} animate-pulse`}></span>
              {error ? 'Demo Mode • Backend Offline' : "St. Mary's Memorial • Live Pulse"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block mr-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">System Load</p>
            <p className="text-lg font-black text-primary mt-1">{error ? 'Offline' : 'Optimal'}</p>
          </div>
          <button className="p-3 bg-hospital-bg text-slate-400 rounded-xl hover:text-primary transition-colors">🔄</button>
          <button className="px-6 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-blue-700 transition-all active:scale-95">Generate Daily Report</button>
        </div>
      </div>

      {/* Primary Clinical KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard label="Patients Today" value={stats?.patientsToday?.toLocaleString() || '0'} subtext="TOTAL" trend="+12%" icon="👥" />
        <StatCard label="OPD Waiting" value={stats?.opdWaiting || '0'} subtext="ACTIVE" trend="-8%" icon="⏳" />
        <StatCard label="IPD Occupancy" value={`${stats?.bedOccupancy || 0}%`} subtext={`${stats?.occupiedBeds || 0} BEDS`} trend="Stable" icon="🛌" />
        <StatCard label="Emergency Cases" value={String(stats?.emergencyCases || 0).padStart(2, '0')} subtext="LIVE" trend="+2" icon="🚨" />
        <StatCard label="Total Registered" value={stats?.totalPatients?.toLocaleString() || '0'} subtext="PATIENTS" trend="" icon="📋" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Charts & Trends */}
        <div className="lg:col-span-8 space-y-8">
          {/* Patient Inflow Analytics */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="font-black text-slate-900 text-xl tracking-tight">Patient Inflow Trend</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time volume monitoring</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                  <span className="text-[10px] font-black text-slate-500 uppercase">Total</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-danger"></span>
                  <span className="text-[10px] font-black text-slate-500 uppercase">Critical</span>
                </div>
              </div>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={inflowData}>
                  <defs>
                    <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E88E5" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1E88E5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D32F2F" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#D32F2F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} dy={12} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '16px' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#1E88E5" strokeWidth={4} fillOpacity={1} fill="url(#colorInflow)" />
                  <Area type="monotone" dataKey="critical" stroke="#D32F2F" strokeWidth={3} fillOpacity={1} fill="url(#colorCritical)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Clinical Stability Mix */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
              <h3 className="font-black text-slate-900 text-xl tracking-tight mb-8">Stability Index</h3>
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusDistribution} innerRadius={65} outerRadius={85} paddingAngle={8} dataKey="value" stroke="none" cornerRadius={8}>
                        {statusDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">{statusDistribution[0]?.value || 0}%</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Healing</span>
                  </div>
                </div>
                <div className="w-full mt-6 space-y-3">
                  {statusDistribution.map((item: any) => (
                    <div key={item.name} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="text-slate-500">{item.name}</span>
                      </div>
                      <span className="text-slate-900">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* OT / Surgical Workflow */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-black text-slate-900 text-xl tracking-tight">Surgical Suite</h3>
                <span className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black rounded-full">ACTIVE</span>
              </div>
              <div className="space-y-4 flex-1">
                {[
                  { ot: 'OT-1', procedure: 'Cardiology', time: 'Ongoing', status: 'In-Op' },
                  { ot: 'OT-2', procedure: 'Orthopedic', time: '14:30', status: 'Prep' },
                  { ot: 'OT-3', procedure: 'Neuro', time: '16:00', status: 'Scheduled' },
                ].map(ot => (
                  <div key={ot.ot} className="p-4 bg-hospital-bg rounded-2xl border border-slate-100 flex justify-between items-center group hover:bg-white hover:shadow-md transition-all">
                    <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{ot.ot}</p>
                      <p className="text-sm font-bold text-slate-800">{ot.procedure}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-900">{ot.time}</p>
                      <p className={`text-[8px] font-black uppercase mt-1 ${ot.status === 'In-Op' ? 'text-danger' : 'text-slate-400'}`}>{ot.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Alerts & AI Insights */}
        <div className="lg:col-span-4 space-y-8">
          {/* Active Alerts Section */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Active Alerts</h3>
              <div className="h-6 w-6 bg-danger/10 text-danger rounded flex items-center justify-center text-xs animate-pulse">🚨</div>
            </div>
            <div className="space-y-4">
              {alerts.map((alert: any) => (
                <div key={alert.id} className={`p-5 rounded-2xl border-l-4 ${alert.level === 'Critical' ? 'bg-danger/5 border-danger' :
                  alert.level === 'High' ? 'bg-amber-50 border-amber-400' : 'bg-slate-50 border-slate-300'
                  }`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${alert.level === 'Critical' ? 'bg-danger text-white' : 'bg-white text-slate-600 border border-slate-100'
                      }`}>
                      {alert.level}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{alert.time}</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-800 leading-snug">{alert.title}</h4>
                  <button className="mt-3 text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View Details →</button>
                </div>
              ))}
            </div>
          </div>

          {/* AI Risk Engine Section */}
          <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent text-xl">✨</div>
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">AI Insight Engine</p>
                  <h3 className="text-lg font-black text-white mt-1">High-Risk Watchlist</h3>
                </div>
              </div>

              <div className="space-y-4">
                {aiInsights.map(insight => (
                  <div key={insight.id} className="p-5 bg-white/5 border border-white/5 rounded-2xl group hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{insight.icon}</span>
                        <span className="text-sm font-black">{insight.patient}</span>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${insight.risk === 'High' ? 'bg-danger/20 text-danger border border-danger/30' : 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                        }`}>
                        {insight.risk} RISK
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{insight.factor}</p>
                    <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${insight.risk === 'High' ? 'bg-danger w-[84%]' : 'bg-amber-400 w-[42%]'}`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-accent/10 border border-accent/20 rounded-2xl">
                <p className="text-[10px] italic text-accent font-kannada leading-relaxed">
                  "ಡೇಟಾದಿಂದ ನಿರ್ಣಯಕ್ಕೆ" — Recommendations prioritized based on acuity.
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
