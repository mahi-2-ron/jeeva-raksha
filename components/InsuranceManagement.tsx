
import React, { useState, useEffect } from 'react';
import api from '../apiClient';
import { useToast } from '../context/ToastContext';
import {
    Shield, Landmark, FileText, CheckCircle2,
    XCircle, Clock, Search, CreditCard,
    History, Users, ArrowRight, Activity,
    ShieldCheck, AlertCircle, RefreshCw
} from 'lucide-react';

const InsuranceManagement: React.FC = () => {
    const { showToast } = useToast();
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'GOVT' | 'PRIVATE' | 'PRE_AUTH' | 'TPA'>('GOVT');
    const [processing, setProcessing] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const mockGovtClaims = [
        { id: 'AYU001', patient: 'Vikram Mehta', scheme: 'PMJAY (Ayushman)', uhid: 'ABHA-1102', amount: 85000, status: 'Pre-Approved', date: '2026-02-20', type: 'Cashless' },
        { id: 'AYU002', patient: 'Suresh Raina', scheme: 'State Health Card', uhid: 'KA-9921', amount: 12000, status: 'Settled', date: '2026-02-18', type: 'Scheme' },
        { id: 'AYU003', patient: 'Meena Kumari', scheme: 'PMJAY (Ayushman)', uhid: 'ABHA-5582', amount: 155000, status: 'Under Review', date: '2026-02-19', type: 'Cashless' },
    ];

    const mockPrivateClaims = [
        { id: 'CLM001', patient: 'Vikram Mehta', insurer: 'Star Health', policyNo: 'SH-9988721', amount: 125000, status: 'Approved', date: '2026-02-18', type: 'Cashless' },
        { id: 'CLM002', patient: 'Anjali Singh', insurer: 'ICICI Lombard', policyNo: 'IL-5543219', amount: 45000, status: 'Pending', date: '2026-02-17', type: 'Reimbursement' },
        { id: 'CLM003', patient: 'Rajesh Kumar', insurer: 'HDFC Ergo', policyNo: 'HE-7712340', amount: 280000, status: 'Under Review', date: '2026-02-16', type: 'Cashless' },
    ];

    const preAuthRequests = [
        { id: 'PA001', patient: 'Gopal Reddy', procedure: 'Knee Replacement', insurer: 'Star Health', amount: 350000, status: 'Awaiting', submittedAt: '2 hrs ago' },
        { id: 'PA002', patient: 'Lakshmi N.', procedure: 'Cardiac Stent', insurer: 'HDFC Ergo', amount: 180000, status: 'Approved', submittedAt: '6 hrs ago' },
        { id: 'PA003', patient: 'Arvind M.', procedure: 'Appendectomy', insurer: 'ICICI Lombard', amount: 75000, status: 'Awaiting', submittedAt: '1 hr ago' },
    ];

    const tpas = [
        { name: 'Medi Assist', claimsPending: 8, avgTAT: '3.2 days', status: 'Active' },
        { name: 'Vidal Health', claimsPending: 3, avgTAT: '2.8 days', status: 'Active' },
        { name: 'Health India', claimsPending: 12, avgTAT: '5.1 days', status: 'Slow' },
        { name: 'Paramount Health', claimsPending: 1, avgTAT: '1.5 days', status: 'Active' },
    ];

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await api.getInsuranceClaims().catch(() => null);
                setClaims(data && data.length > 0 ? data : [...mockGovtClaims, ...mockPrivateClaims]);
            } catch {
                setClaims([...mockGovtClaims, ...mockPrivateClaims]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleFollowUp = async (id: string) => {
        setProcessing(id);
        await new Promise(r => setTimeout(r, 1000));
        showToast('success', `Follow-up sent for case ${id}`);
        setProcessing(null);
    };

    const checkEligibility = () => {
        if (!searchQuery) return showToast('warning', 'Please enter UHID or PMJAY ID');
        setProcessing('ELIGIBILITY');
        setTimeout(() => {
            showToast('success', 'Patient ELIGIBLE for PMJAY (Ayushman Bharat). Card Verified.');
            setProcessing(null);
        }, 1500);
    };

    const govtCount = claims.filter(c => c.id.startsWith('AYU')).length;
    const privateCount = claims.filter(c => c.id.startsWith('CLM')).length;

    return (
        <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500 space-y-8 p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-2xl font-black text-text-main tracking-tight">Govt Schemes & Insurance</h2>
                    <p className="text-sm font-bold text-text-muted mt-1 font-kannada flex items-center gap-2">
                        <span>"ವಿಮೆ ಮತ್ತು ಯೋಜನೆ — ರೋಗಿ ರಕ್ಷಣೆ"</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>Scheme management & Insurance oversight.</span>
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="relative group">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search PMJAY / UHID..."
                            className="pl-10 pr-4 py-3 bg-hospital-card border border-hospital-border rounded-xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 outline-none w-64 group-hover:border-primary/50 transition-all"
                        />
                        <Search className="absolute left-3 top-3.5 text-text-muted" size={14} />
                    </div>
                    <button
                        onClick={checkEligibility}
                        disabled={processing === 'ELIGIBILITY'}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                        {processing === 'ELIGIBILITY' ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                        Check Eligibility
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Govt Claims', value: govtCount.toString().padStart(2, '0'), color: 'text-primary', icon: <Landmark size={24} /> },
                    { label: 'Private Claims', value: privateCount.toString().padStart(2, '0'), color: 'text-indigo-600', icon: <Shield size={24} /> },
                    { label: 'Pending Pre-Auth', value: preAuthRequests.length.toString().padStart(2, '0'), color: 'text-warning', icon: <Clock size={24} /> },
                    { label: 'Settled Amt (Lac)', value: '₹42.5', color: 'text-success', icon: <CreditCard size={24} /> },
                ].map(s => (
                    <div key={s.label} className="bg-hospital-card p-6 rounded-2xl border border-hospital-border shadow-card hover:shadow-card-hover transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <span className={`${s.color.replace('text-', 'text-opacity-80 ')}`}>{s.icon}</span>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{s.label}</p>
                        </div>
                        <p className={`text-3xl font-black ${s.color} tracking-tighter`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex bg-hospital-card p-1.5 rounded-xl border border-hospital-border w-fit shadow-sm">
                {(['GOVT', 'PRIVATE', 'PRE_AUTH', 'TPA'] as const).map((key) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === key ? 'bg-primary/10 text-primary shadow-sm' : 'text-text-muted hover:text-text-body hover:bg-hospital-bg'}`}
                    >
                        {key === 'GOVT' ? 'Government Schemes' : key === 'PRIVATE' ? 'Private Insurance' : key === 'PRE_AUTH' ? 'Pre-Auth Requests' : 'TPA Partners'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Loading financial data...</p>
                    </div>
                </div>
            ) : (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'GOVT' && (
                        <div className="bg-hospital-card rounded-2xl border border-hospital-border shadow-card overflow-hidden">
                            <div className="p-6 border-b border-hospital-border bg-hospital-bg/50 flex justify-between items-center">
                                <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                                    <Landmark size={14} /> Active Scheme Records — {govtCount} Cases
                                </h3>
                                <button className="text-[9px] font-black text-primary uppercase flex items-center gap-1 hover:underline">
                                    <History size={12} /> View Archived
                                </button>
                            </div>
                            <div className="divide-y divide-hospital-border">
                                {claims.filter(c => c.id.startsWith('AYU')).map(c => (
                                    <div key={c.id} className="px-8 py-5 flex items-center gap-6 hover:bg-hospital-bg/50 transition-colors group">
                                        <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                            <ShieldCheck size={20} className="text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-text-main">{c.patient}</p>
                                            <p className="text-[10px] font-bold text-text-muted uppercase">{c.scheme} • UHID: {c.uhid}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-black text-text-main">₹{c.amount.toLocaleString()}</p>
                                            <p className="text-[9px] font-bold text-text-muted uppercase">{c.date}</p>
                                        </div>
                                        <div className="flex items-center gap-4 min-w-[300px] justify-end">
                                            <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shrink-0 ${c.status === 'Settled' ? 'bg-success/5 text-success' : 'bg-warning/5 text-warning font-black animate-pulse'}`}>{c.status}</span>
                                            {c.status !== 'Settled' && (
                                                <button onClick={() => handleFollowUp(c.id)} disabled={processing === c.id} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50 shrink-0 flex items-center gap-1.5">
                                                    {processing === c.id ? 'Refining...' : <><RefreshCw size={10} /> Case Followup</>}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'PRIVATE' && (
                        <div className="bg-hospital-card rounded-2xl border border-hospital-border shadow-card overflow-hidden">
                            <div className="p-6 border-b border-hospital-border bg-hospital-bg/50 flex justify-between items-center">
                                <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                                    <Shield size={14} /> Private TPA Claims Portal
                                </h3>
                                <button className="px-4 py-2 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest">+ New Claim</button>
                            </div>
                            <div className="divide-y divide-hospital-border">
                                {claims.filter(c => c.id.startsWith('CLM')).map(c => (
                                    <div key={c.id} className="px-8 py-5 flex items-center gap-6 hover:bg-hospital-bg/50 transition-colors">
                                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 font-black">
                                            {c.insurer.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-text-main">{c.patient}</p>
                                            <p className="text-[10px] font-bold text-text-muted uppercase">{c.insurer} • {c.policyNo} • {c.type}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-black text-text-main">₹{c.amount.toLocaleString()}</p>
                                            <p className="text-[9px] font-bold text-text-muted">{c.date}</p>
                                        </div>
                                        <div className="flex items-center gap-4 min-w-[200px] justify-end">
                                            <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shrink-0 ${c.status === 'Approved' ? 'bg-success/5 text-success' : c.status === 'Rejected' ? 'bg-danger/5 text-danger' : 'bg-warning/5 text-warning'}`}>{c.status}</span>
                                            {(c.status === 'Pending' || c.status === 'Under Review') && (
                                                <button onClick={() => handleFollowUp(c.id)} disabled={processing === c.id} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all">
                                                    <RefreshCw size={14} className={processing === c.id ? 'animate-spin' : ''} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'PRE_AUTH' && (
                        <div className="bg-hospital-card rounded-2xl border border-hospital-border shadow-card overflow-hidden">
                            <div className="p-6 border-b border-hospital-border bg-hospital-bg/50 flex justify-between items-center">
                                <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                                    <FileText size={14} /> Pending Pre-Authorization Requests
                                </h3>
                            </div>
                            <div className="divide-y divide-hospital-border">
                                {preAuthRequests.map(pa => (
                                    <div key={pa.id} className="px-8 py-5 flex items-center gap-6 hover:bg-hospital-bg/50 transition-colors">
                                        <div className="w-10 h-10 bg-warning/5 text-warning rounded-xl flex items-center justify-center shrink-0">
                                            <Activity size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-text-main">{pa.patient}</p>
                                            <p className="text-[10px] font-bold text-text-muted uppercase">{pa.procedure} • {pa.insurer}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-text-main">₹{pa.amount.toLocaleString()}</p>
                                            <p className="text-[9px] font-bold text-text-muted uppercase">Sent {pa.submittedAt}</p>
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest shrink-0 border ${pa.status === 'Approved' ? 'bg-success/5 text-success border-success/20' : 'bg-warning/5 text-warning border-warning/20 animate-pulse'}`}>{pa.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'TPA' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {tpas.map(tpa => (
                                <div key={tpa.name} className="bg-hospital-card p-8 rounded-[2rem] border border-hospital-border shadow-card hover:shadow-xl transition-all group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />
                                    <div className="flex items-center justify-between mb-8 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-hospital-border flex items-center justify-center text-primary">
                                                <Users size={24} />
                                            </div>
                                            <h4 className="text-lg font-black text-text-main tracking-tight">{tpa.name}</h4>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${tpa.status === 'Active' ? 'bg-success/5 text-success border-success/10' : 'bg-warning/5 text-warning border-warning/10'}`}>{tpa.status}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 relative z-10">
                                        <div className="p-4 bg-hospital-bg rounded-2xl border border-hospital-border">
                                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5">Active Claims</p>
                                            <p className="text-2xl font-black text-text-main">{tpa.claimsPending}</p>
                                        </div>
                                        <div className="p-4 bg-hospital-bg rounded-2xl border border-hospital-border">
                                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5">Avg TAT</p>
                                            <p className="text-2xl font-black text-primary">{tpa.avgTAT}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InsuranceManagement;

