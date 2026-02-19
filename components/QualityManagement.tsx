
import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import {
    Award, ShieldCheck, AlertTriangle, Star, CheckCircle2,
    XCircle, ArrowUp, ArrowDown, Activity, FileText,
    RotateCw, AlertOctagon, Info, Flag
} from 'lucide-react';

const QualityManagement: React.FC = () => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'METRICS' | 'NABH' | 'INCIDENTS'>('METRICS');
    const [resolving, setResolving] = useState<string | null>(null);

    const metrics = [
        { name: 'Hospital Infection Rate', value: '1.2%', target: '< 2%', status: 'Pass', trend: '↓ 0.3%' },
        { name: 'Readmission Rate (30-day)', value: '3.8%', target: '< 5%', status: 'Pass', trend: '↓ 0.5%' },
        { name: 'Patient Satisfaction Score', value: '4.6/5', target: '> 4.0', status: 'Pass', trend: '↑ 0.2' },
        { name: 'Average Length of Stay', value: '4.2 days', target: '< 5 days', status: 'Pass', trend: '↓ 0.8d' },
        { name: 'Mortality Rate', value: '0.8%', target: '< 1%', status: 'Pass', trend: '= 0.0%' },
        { name: 'Hand Hygiene Compliance', value: '94%', target: '> 95%', status: 'Fail', trend: '↓ 1%' },
        { name: 'Medication Error Rate', value: '0.05%', target: '< 0.1%', status: 'Pass', trend: '↓ 0.02%' },
        { name: 'Surgical Site Infection', value: '0.9%', target: '< 1%', status: 'Pass', trend: '↓ 0.1%' },
    ];

    const nabhChecklist = [
        { section: 'Patient Rights & Education', items: 12, completed: 12, status: 'Complete' },
        { section: 'Care of Patients', items: 18, completed: 17, status: 'In Progress' },
        { section: 'Management of Medication', items: 10, completed: 10, status: 'Complete' },
        { section: 'Infection Control', items: 15, completed: 13, status: 'In Progress' },
        { section: 'Continuous Quality Improvement', items: 8, completed: 8, status: 'Complete' },
        { section: 'Hospital Infrastructure', items: 14, completed: 14, status: 'Complete' },
        { section: 'Human Resource Management', items: 11, completed: 10, status: 'In Progress' },
        { section: 'Information Management', items: 9, completed: 9, status: 'Complete' },
    ];

    const incidents = [
        { id: 'INC001', type: 'Medication Error', description: 'Wrong dosage administered — corrected within 30 min', severity: 'High', date: '2026-02-17', status: 'Under Review' },
        { id: 'INC002', type: 'Patient Fall', description: 'Fall in Ward 3B — minor injury, vitals stable', severity: 'Moderate', date: '2026-02-16', status: 'Resolved' },
        { id: 'INC003', type: 'Equipment Failure', description: 'Ventilator V-04 malfunction — backup deployed', severity: 'High', date: '2026-02-15', status: 'Resolved' },
        { id: 'INC004', type: 'Near Miss', description: 'Wrong patient ID on lab sample — caught at verification', severity: 'Low', date: '2026-02-18', status: 'Under Review' },
    ];

    const handleResolve = async (id: string) => {
        setResolving(id);
        await new Promise(r => setTimeout(r, 1000));
        showToast('success', `Incident ${id} marked as resolved`);
        setResolving(null);
    };

    const passCount = metrics.filter(m => m.status === 'Pass').length;
    const nabhPct = Math.round(nabhChecklist.reduce((s, c) => s + c.completed, 0) / nabhChecklist.reduce((s, c) => s + c.items, 0) * 100);
    const openIncidents = incidents.filter(i => i.status === 'Under Review').length;

    return (
        <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500 space-y-8 p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-2xl font-black text-text-main tracking-tight">Quality & Compliance</h2>
                    <p className="text-sm font-bold text-text-muted mt-1 font-kannada flex items-center gap-2">
                        <span>"ಗುಣಮಟ್ಟ — ಜೀವರಕ್ಷೆಯ ಆಧಾರ"</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>Quality is the foundation of life-saving care.</span>
                    </p>
                </div>
                <button onClick={() => showToast('info', 'New incident report form opening...')} className="px-6 py-3 bg-danger text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-danger/20 hover:bg-red-700 transition-all flex items-center gap-2">
                    <AlertOctagon size={16} /> Report Incident
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Quality Score', value: `${passCount}/${metrics.length}`, color: 'text-success', icon: <ShieldCheck size={24} /> },
                    { label: 'NABH Compliance', value: `${nabhPct}%`, color: 'text-primary', icon: <Award size={24} /> },
                    { label: 'Open Incidents', value: openIncidents.toString().padStart(2, '0'), color: 'text-warning', icon: <AlertTriangle size={24} /> },
                    { label: 'Patient Satisfaction', value: '4.6/5', color: 'text-primary', icon: <Star size={24} /> },
                ].map(s => (
                    <div key={s.label} className="bg-hospital-card p-6 rounded-2xl border border-hospital-border shadow-card hover:shadow-card-hover transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <span className={`text-xl ${s.color.replace('text-', 'text-opacity-80 ')}`}>{s.icon}</span>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{s.label}</p>
                        </div>
                        <p className={`text-3xl font-black ${s.color} tracking-tighter`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex bg-hospital-card p-1.5 rounded-xl border border-hospital-border w-fit shadow-sm">
                {([['METRICS', 'Quality Metrics'], ['NABH', 'NABH Checklist'], ['INCIDENTS', 'Incidents']] as const).map(([key, label]) => (
                    <button key={key} onClick={() => setActiveTab(key as any)} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === key ? 'bg-primary/10 text-primary shadow-sm' : 'text-text-muted hover:text-text-body hover:bg-hospital-bg'}`}>{label}</button>
                ))}
            </div>

            {activeTab === 'METRICS' && (
                <div className="bg-hospital-card rounded-2xl border border-hospital-border shadow-card overflow-hidden">
                    <div className="p-6 border-b border-hospital-border bg-hospital-bg/50">
                        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                            <Activity size={14} /> Clinical Quality Indicators
                        </h3>
                    </div>
                    <div className="divide-y divide-hospital-border">
                        {metrics.map(m => (
                            <div key={m.name} className="px-8 py-5 flex items-center gap-6 hover:bg-hospital-bg/50 transition-colors">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.status === 'Pass' ? 'bg-success/5 text-success' : 'bg-danger/5 text-danger'}`}>
                                    {m.status === 'Pass' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-text-main">{m.name}</p>
                                    <p className="text-[10px] font-bold text-text-muted mt-0.5">Target: {m.target}</p>
                                </div>
                                <p className="text-lg font-black text-text-main shrink-0">{m.value}</p>
                                <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shrink-0 flex items-center gap-1 ${m.trend.startsWith('↓') ? 'bg-success/5 text-success' : m.trend.startsWith('↑') ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-text-muted'}`}>
                                    {m.trend.startsWith('↓') ? <ArrowDown size={10} /> : m.trend.startsWith('↑') ? <ArrowUp size={10} /> : null}
                                    {m.trend}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'NABH' && (
                <div className="bg-hospital-card rounded-2xl border border-hospital-border shadow-card overflow-hidden">
                    <div className="p-6 border-b border-hospital-border bg-hospital-bg/50">
                        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck size={14} /> NABH Accreditation Checklist — {nabhPct}% Complete
                        </h3>
                    </div>
                    <div className="divide-y divide-hospital-border">
                        {nabhChecklist.map(c => (
                            <div key={c.section} className="px-8 py-5 flex items-center gap-6 hover:bg-hospital-bg/50 transition-colors">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.status === 'Complete' ? 'bg-success/5 text-success' : 'bg-warning/5 text-warning'}`}>
                                    {c.status === 'Complete' ? <CheckCircle2 size={18} /> : <RotateCw size={18} className={c.status === 'In Progress' ? 'animate-pulse' : ''} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-text-main">{c.section}</p>
                                    <p className="text-[10px] font-bold text-text-muted mt-0.5">{c.completed}/{c.items} items completed</p>
                                </div>
                                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0">
                                    <div className={`h-full rounded-full ${c.status === 'Complete' ? 'bg-success' : 'bg-warning'}`} style={{ width: `${(c.completed / c.items) * 100}%` }} />
                                </div>
                                <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shrink-0 ${c.status === 'Complete' ? 'bg-success/5 text-success' : 'bg-warning/5 text-warning'}`}>{c.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'INCIDENTS' && (
                <div className="bg-hospital-card rounded-2xl border border-hospital-border shadow-card overflow-hidden">
                    <div className="p-6 border-b border-hospital-border bg-hospital-bg/50">
                        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                            <AlertTriangle size={14} /> Incident Reports
                        </h3>
                    </div>
                    <div className="divide-y divide-hospital-border">
                        {incidents.map(inc => (
                            <div key={inc.id} className="px-8 py-5 flex items-center gap-6 hover:bg-hospital-bg/50 transition-colors">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${inc.severity === 'High' ? 'bg-danger/5 text-danger' : inc.severity === 'Moderate' ? 'bg-warning/5 text-warning' : 'bg-slate-100 text-text-muted'}`}>
                                    {inc.severity === 'High' ? <AlertOctagon size={18} /> : inc.severity === 'Moderate' ? <AlertTriangle size={18} /> : <Info size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-text-main">{inc.type}</p>
                                    <p className="text-[10px] font-bold text-text-muted mt-0.5">{inc.description}</p>
                                </div>
                                <p className="text-[10px] font-bold text-text-muted shrink-0">{inc.date}</p>
                                <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shrink-0 ${inc.status === 'Resolved' ? 'bg-success/5 text-success' : 'bg-warning/5 text-warning'}`}>{inc.status}</span>
                                {inc.status === 'Under Review' && (
                                    <button onClick={() => handleResolve(inc.id)} disabled={resolving === inc.id} className="px-4 py-2 bg-success text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-700 transition-all disabled:opacity-50 shrink-0 flex items-center gap-1.5">
                                        {resolving === inc.id ? <><RotateCw size={10} className="animate-spin" /> Resolving...</> : <><CheckCircle2 size={10} /> Resolve</>}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QualityManagement;
