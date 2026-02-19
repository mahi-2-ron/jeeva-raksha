
import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import {
    Landmark, ClipboardList, Scroll, ShieldCheck, CheckCircle2,
    Clock, FileText, Send, Baby, AlignVerticalSpaceAround,
    RefreshCw, FileCheck, FileClock
} from 'lucide-react';

const GovtIntegrations: React.FC = () => {
    const { showToast } = useToast();
    const [submitting, setSubmitting] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'ABDM' | 'REPORTS' | 'CERTIFICATES'>('ABDM');

    const abdmStatus = [
        { feature: 'ABHA ID Registration', status: 'Active', lastSync: '2026-02-18 09:00', records: 8421 },
        { feature: 'Health Information Exchange', status: 'Active', lastSync: '2026-02-18 08:45', records: 6240 },
        { feature: 'Consent Management', status: 'Active', lastSync: '2026-02-18 09:15', records: 5103 },
        { feature: 'Digital Health Locker', status: 'Active', lastSync: '2026-02-18 08:30', records: 4890 },
        { feature: 'Vaccination Records', status: 'Pending Setup', lastSync: '-', records: 0 },
    ];

    const govtReports = [
        { id: 'RPT001', name: 'HMIS Monthly Return', authority: 'MoHFW', dueDate: '2026-02-28', status: 'Not Submitted', period: 'Feb 2026' },
        { id: 'RPT002', name: 'IDSP (Disease Surveillance)', authority: 'NCDC', dueDate: '2026-02-20', status: 'Submitted', period: 'Week 7' },
        { id: 'RPT003', name: 'Birth & Death Returns', authority: 'RBD', dueDate: '2026-03-05', status: 'Not Submitted', period: 'Jan 2026' },
        { id: 'RPT004', name: 'PCPNDT Form F', authority: 'State PCPNDT', dueDate: '2026-02-25', status: 'Submitted', period: 'Feb 2026' },
        { id: 'RPT005', name: 'Bio-Medical Waste Report', authority: 'CPCB', dueDate: '2026-02-28', status: 'Draft', period: 'Feb 2026' },
    ];

    const certificates = [
        { type: 'Birth Certificate', issued: 42, pending: 3, icon: <Baby size={32} /> },
        { type: 'Death Certificate', issued: 8, pending: 1, icon: <Scroll size={32} /> },
        { type: 'Medical Fitness', issued: 156, pending: 12, icon: <Activity size={32} /> },
        { type: 'Disability Certificate', issued: 14, pending: 2, icon: <AlignVerticalSpaceAround size={32} /> },
    ];

    const handleSubmitReport = async (id: string) => {
        setSubmitting(id);
        await new Promise(r => setTimeout(r, 1500));
        showToast('success', `Report ${id} submitted to government portal`);
        setSubmitting(null);
    };

    const handleGenerateCert = (type: string) => {
        showToast('info', `Generating ${type} form...`);
    };

    // Helper for activity icon
    const Activity = ({ size }: { size: number }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
    );


    return (
        <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500 space-y-8 p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-2xl font-black text-text-main tracking-tight">Government Integrations</h2>
                    <p className="text-sm font-bold text-text-muted mt-1 font-kannada flex items-center gap-2">
                        <span>"ಸರ್ಕಾರಿ ಅನುಸರಣೆ — ಪಾರದರ್ಶಕ ಆರೋಗ್ಯ"</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>Government compliance, transparent healthcare.</span>
                    </p>
                </div>
                <button onClick={() => showToast('info', 'Refreshing government portal connections...')} className="px-6 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-blue-700 transition-all flex items-center gap-2">
                    <RefreshCw size={16} /> Sync All Portals
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'ABHA IDs Linked', value: '8,421', color: 'text-primary', icon: <Landmark size={24} /> },
                    { label: 'Reports Due', value: govtReports.filter(r => r.status !== 'Submitted').length.toString().padStart(2, '0'), color: 'text-warning', icon: <ClipboardList size={24} /> },
                    { label: 'Certs Issued (Month)', value: certificates.reduce((s, c) => s + c.issued, 0).toString(), color: 'text-success', icon: <Scroll size={24} /> },
                    { label: 'Compliance Score', value: '96%', color: 'text-success', icon: <ShieldCheck size={24} /> },
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
                {([['ABDM', 'ABDM / NDHM'], ['REPORTS', 'Govt Reports'], ['CERTIFICATES', 'Certificates']] as const).map(([key, label]) => (
                    <button key={key} onClick={() => setActiveTab(key as any)} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === key ? 'bg-primary/10 text-primary shadow-sm' : 'text-text-muted hover:text-text-body hover:bg-hospital-bg'}`}>{label}</button>
                ))}
            </div>

            {activeTab === 'ABDM' && (
                <div className="bg-hospital-card rounded-2xl border border-hospital-border shadow-card overflow-hidden">
                    <div className="p-6 border-b border-hospital-border bg-hospital-bg/50">
                        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                            <Landmark size={14} /> Ayushman Bharat Digital Mission — Integration Status
                        </h3>
                    </div>
                    <div className="divide-y divide-hospital-border">
                        {abdmStatus.map(item => (
                            <div key={item.feature} className="px-8 py-5 flex items-center gap-6 hover:bg-hospital-bg/50 transition-colors">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.status === 'Active' ? 'bg-success/5 text-success' : 'bg-warning/5 text-warning'}`}>
                                    {item.status === 'Active' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-text-main">{item.feature}</p>
                                    <p className="text-[10px] font-bold text-text-muted mt-0.5">Last sync: {item.lastSync}</p>
                                </div>
                                {item.records > 0 && (
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-black text-text-main">{item.records.toLocaleString()}</p>
                                        <p className="text-[9px] font-bold text-text-muted">records</p>
                                    </div>
                                )}
                                <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shrink-0 ${item.status === 'Active' ? 'bg-success/5 text-success' : 'bg-warning/5 text-warning'}`}>{item.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'REPORTS' && (
                <div className="bg-hospital-card rounded-2xl border border-hospital-border shadow-card overflow-hidden">
                    <div className="p-6 border-b border-hospital-border bg-hospital-bg/50">
                        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                            <ClipboardList size={14} /> Government Mandatory Reports
                        </h3>
                    </div>
                    <div className="divide-y divide-hospital-border">
                        {govtReports.map(rpt => (
                            <div key={rpt.id} className="px-8 py-5 flex items-center gap-6 hover:bg-hospital-bg/50 transition-colors">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${rpt.status === 'Submitted' ? 'bg-success/5 text-success' : rpt.status === 'Draft' ? 'bg-primary/5 text-primary' : 'bg-warning/5 text-warning'}`}>
                                    {rpt.status === 'Submitted' ? <FileCheck size={18} /> : <FileText size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-text-main">{rpt.name}</p>
                                    <p className="text-[10px] font-bold text-text-muted mt-0.5">{rpt.authority} • {rpt.period} • Due: {rpt.dueDate}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shrink-0 ${rpt.status === 'Submitted' ? 'bg-success/5 text-success' : rpt.status === 'Draft' ? 'bg-primary/5 text-primary' : 'bg-warning/5 text-warning'}`}>{rpt.status}</span>
                                {rpt.status !== 'Submitted' && (
                                    <button onClick={() => handleSubmitReport(rpt.id)} disabled={submitting === rpt.id} className="px-4 py-2 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 shrink-0 flex items-center gap-1.5">
                                        {submitting === rpt.id ? <><RefreshCw size={10} className="animate-spin" /> Submitting...</> : <><Send size={10} /> Submit</>}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'CERTIFICATES' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certificates.map(cert => (
                        <div key={cert.type} className="bg-hospital-card p-8 rounded-2xl border border-hospital-border shadow-card hover:shadow-xl transition-all group">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-text-muted group-hover:text-primary transition-colors">{cert.icon}</span>
                                    <h4 className="text-lg font-black text-text-main">{cert.type}</h4>
                                </div>
                                {cert.pending > 0 && <span className="px-2 py-1 bg-warning/10 text-warning rounded-lg text-[8px] font-black uppercase tracking-widest border border-warning/10">{cert.pending} Pending</span>}
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Issued This Month</p>
                                    <p className="text-2xl font-black text-success">{cert.issued}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Pending</p>
                                    <p className="text-2xl font-black text-warning">{cert.pending}</p>
                                </div>
                            </div>
                            <button onClick={() => handleGenerateCert(cert.type)} className="w-full py-3 bg-text-main text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                Generate New <FileText size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl border border-slate-800 my-8">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center text-white border border-white/10">
                        <Landmark size={32} />
                    </div>
                    <div className="flex-1 space-y-2 text-center md:text-left">
                        <h4 className="text-lg font-black text-white">National Digital Health Ecosystem</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-kannada">
                            "ಡಿಜಿಟಲ್ ಭಾರತ — ಆರೋಗ್ಯ ಭಾರತ" — Fully integrated with ABDM, enabling seamless health data exchange across India.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GovtIntegrations;
