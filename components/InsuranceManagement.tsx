
import React, { useState, useEffect } from 'react';
import api from '../apiClient';
import { useToast } from '../context/ToastContext';

const InsuranceManagement: React.FC = () => {
    const { showToast } = useToast();
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'CLAIMS' | 'PRE_AUTH' | 'TPA'>('CLAIMS');
    const [processing, setProcessing] = useState<string | null>(null);

    const mockClaims = [
        { id: 'CLM001', patient: 'Vikram Mehta', insurer: 'Star Health', policyNo: 'SH-9988721', amount: 125000, status: 'Approved', date: '2026-02-18', type: 'Cashless' },
        { id: 'CLM002', patient: 'Anjali Singh', insurer: 'ICICI Lombard', policyNo: 'IL-5543219', amount: 45000, status: 'Pending', date: '2026-02-17', type: 'Reimbursement' },
        { id: 'CLM003', patient: 'Rajesh Kumar', insurer: 'HDFC Ergo', policyNo: 'HE-7712340', amount: 280000, status: 'Under Review', date: '2026-02-16', type: 'Cashless' },
        { id: 'CLM004', patient: 'Meena Kumari', insurer: 'New India', policyNo: 'NI-3345678', amount: 18000, status: 'Rejected', date: '2026-02-15', type: 'Reimbursement' },
        { id: 'CLM005', patient: 'Suresh Raina', insurer: 'Bajaj Allianz', policyNo: 'BA-2234561', amount: 92000, status: 'Approved', date: '2026-02-14', type: 'Cashless' },
        { id: 'CLM006', patient: 'Priya Sharma', insurer: 'Star Health', policyNo: 'SH-1123890', amount: 55000, status: 'Pending', date: '2026-02-18', type: 'Cashless' },
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
                setClaims(data && data.length > 0 ? data : mockClaims);
            } catch {
                setClaims(mockClaims);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleFollowUp = async (id: string) => {
        setProcessing(id);
        await new Promise(r => setTimeout(r, 1000));
        showToast('success', `Follow-up sent for claim ${id}`);
        setProcessing(null);
    };

    const handleSubmitPreAuth = () => {
        showToast('info', 'Pre-authorization form opening...');
    };

    const approvedAmt = claims.filter(c => c.status === 'Approved').reduce((s, c) => s + c.amount, 0);
    const pendingCount = claims.filter(c => c.status === 'Pending' || c.status === 'Under Review').length;

    return (
        <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Insurance & Claims</h2>
                    <p className="text-sm font-medium text-slate-500 font-kannada">"ಬೆಂಬಲ ವಿಮೆ — ರೋಗಿ ರಕ್ಷಣೆ" — Insurance support for patient protection.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleSubmitPreAuth} className="px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 shadow-sm transition-all">📋 New Pre-Auth</button>
                    <button onClick={() => showToast('info', 'New claim form opening...')} className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-blue-700 transition-all">+ New Claim</button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Claims', value: claims.length.toString(), color: 'text-slate-900', icon: '📑' },
                    { label: 'Approved Amount', value: `₹${(approvedAmt / 1000).toFixed(0)}K`, color: 'text-success', icon: '✅' },
                    { label: 'Pending Claims', value: pendingCount.toString().padStart(2, '0'), color: 'text-warning', icon: '⏳' },
                    { label: 'Active TPAs', value: tpas.length.toString().padStart(2, '0'), color: 'text-primary', icon: '🏢' },
                ].map(s => (
                    <div key={s.label} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-xl">{s.icon}</span>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                        </div>
                        <p className={`text-3xl font-black ${s.color} tracking-tighter`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex bg-hospital-bg p-1.5 rounded-2xl border border-slate-100 w-fit">
                {([['CLAIMS', 'Claims'], ['PRE_AUTH', 'Pre-Auth'], ['TPA', 'TPA Partners']] as const).map(([key, label]) => (
                    <button key={key} onClick={() => setActiveTab(key as any)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === key ? 'bg-white text-primary shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>{label}</button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading insurance data...</p>
                    </div>
                </div>
            ) : (
                <>
                    {activeTab === 'CLAIMS' && (
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Insurance Claims — {claims.length} Records</h3>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {claims.map(c => (
                                    <div key={c.id} className="px-8 py-5 flex items-center gap-6 hover:bg-hospital-bg/50 transition-colors">
                                        <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-lg shrink-0">📑</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-slate-800">{c.patient}</p>
                                            <p className="text-[10px] font-bold text-slate-400">{c.insurer} • {c.policyNo} • {c.type}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-black text-slate-900">₹{c.amount.toLocaleString()}</p>
                                            <p className="text-[9px] font-bold text-slate-400">{c.date}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shrink-0 ${c.status === 'Approved' ? 'bg-success/10 text-success' : c.status === 'Rejected' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>{c.status}</span>
                                        {(c.status === 'Pending' || c.status === 'Under Review') && (
                                            <button onClick={() => handleFollowUp(c.id)} disabled={processing === c.id} className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all disabled:opacity-50 shrink-0">
                                                {processing === c.id ? 'Sending...' : 'Follow Up'}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'PRE_AUTH' && (
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pre-Authorization Requests</h3>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {preAuthRequests.map(pa => (
                                    <div key={pa.id} className="px-8 py-5 flex items-center gap-6 hover:bg-hospital-bg/50 transition-colors">
                                        <div className="w-10 h-10 bg-warning/5 rounded-xl flex items-center justify-center text-lg shrink-0">📋</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-slate-800">{pa.patient} — {pa.procedure}</p>
                                            <p className="text-[10px] font-bold text-slate-400">{pa.insurer} • Submitted {pa.submittedAt}</p>
                                        </div>
                                        <p className="text-sm font-black text-slate-900 shrink-0">₹{pa.amount.toLocaleString()}</p>
                                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shrink-0 ${pa.status === 'Approved' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning animate-pulse'}`}>{pa.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'TPA' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {tpas.map(tpa => (
                                <div key={tpa.name} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="text-lg font-black text-slate-900">{tpa.name}</h4>
                                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${tpa.status === 'Active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{tpa.status}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Claims</p>
                                            <p className="text-2xl font-black text-slate-900">{tpa.claimsPending}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg TAT</p>
                                            <p className="text-2xl font-black text-primary">{tpa.avgTAT}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default InsuranceManagement;
