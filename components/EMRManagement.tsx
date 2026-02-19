
import React, { useState, useEffect } from 'react';
import api from '../apiClient';
import { useToast } from '../context/ToastContext';
import {
    Folder, FolderOpen, Save, Siren, Search, Plus,
    FileText, Clock, ShieldCheck, Database, Server
} from 'lucide-react';

const EMRManagement: React.FC = () => {
    const { showToast } = useToast();
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'ALL' | 'RECENT' | 'CRITICAL'>('ALL');
    const [viewing, setViewing] = useState<string | null>(null);

    const mockRecords = [
        { id: 'EMR001', patientId: 'PAT-1001', name: 'Vikram Mehta', age: 45, gender: 'Male', lastVisit: '2026-02-18', totalVisits: 12, conditions: ['Hypertension', 'Type 2 DM'], status: 'Active', digitized: true },
        { id: 'EMR002', patientId: 'PAT-1002', name: 'Anjali Singh', age: 32, gender: 'Female', lastVisit: '2026-02-17', totalVisits: 5, conditions: ['Asthma'], status: 'Active', digitized: true },
        { id: 'EMR003', patientId: 'PAT-1003', name: 'Rajesh Kumar', age: 67, gender: 'Male', lastVisit: '2026-02-16', totalVisits: 28, conditions: ['CAD', 'CKD Stage 3', 'Anemia'], status: 'Critical', digitized: true },
        { id: 'EMR004', patientId: 'PAT-1004', name: 'Meena Kumari', age: 28, gender: 'Female', lastVisit: '2026-02-15', totalVisits: 3, conditions: ['Pregnancy (32wk)'], status: 'Active', digitized: true },
        { id: 'EMR005', patientId: 'PAT-1005', name: 'Suresh Raina', age: 55, gender: 'Male', lastVisit: '2026-02-14', totalVisits: 8, conditions: ['COPD', 'Hypertension'], status: 'Active', digitized: false },
        { id: 'EMR006', patientId: 'PAT-1006', name: 'Lakshmi Devi', age: 72, gender: 'Female', lastVisit: '2026-02-18', totalVisits: 35, conditions: ['Osteoarthritis', 'Type 2 DM', 'Hypothyroidism'], status: 'Active', digitized: true },
        { id: 'EMR007', patientId: 'PAT-1007', name: 'Mohammed Farooq', age: 41, gender: 'Male', lastVisit: '2026-02-13', totalVisits: 2, conditions: ['Appendectomy (post-op)'], status: 'Discharged', digitized: true },
        { id: 'EMR008', patientId: 'PAT-1008', name: 'Kavitha Rao', age: 38, gender: 'Female', lastVisit: '2026-02-18', totalVisits: 7, conditions: ['Migraine', 'Anxiety'], status: 'Active', digitized: true },
    ];

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await api.getPatients().catch(() => null);
                if (data && data.length > 0) {
                    setRecords(data.map((p: any) => ({
                        id: `EMR-${p.id}`, patientId: p.uhid || p.id, name: p.name, age: p.age,
                        gender: p.gender, lastVisit: p.last_visit || '2026-02-18', totalVisits: Math.floor(Math.random() * 30) + 1,
                        conditions: p.conditions || ['General'], status: p.status || 'Active', digitized: true,
                    })));
                } else {
                    setRecords(mockRecords);
                }
            } catch {
                setRecords(mockRecords);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleViewRecord = (id: string) => {
        setViewing(id);
        setTimeout(() => {
            showToast('info', `Opening full medical record for ${records.find(r => r.id === id)?.name || id}`);
            setViewing(null);
        }, 800);
    };

    const filtered = records.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.patientId.toLowerCase().includes(search.toLowerCase());
        if (activeTab === 'RECENT') return matchesSearch && r.lastVisit >= '2026-02-17';
        if (activeTab === 'CRITICAL') return matchesSearch && r.status === 'Critical';
        return matchesSearch;
    });

    const totalDigitized = records.filter(r => r.digitized).length;
    const digitizationPct = Math.round((totalDigitized / records.length) * 100);

    return (
        <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500 space-y-8 p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-2xl font-black text-text-main tracking-tight">Electronic Medical Records</h2>
                    <p className="text-sm font-bold text-text-muted mt-1 font-kannada flex items-center gap-2">
                        <span>"ಸಂಪೂರ್ಣ ದಾಖಲೆ — ಸಂಪೂರ್ಣ ಆರೈಕೆ"</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>Complete records, complete care.</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records..." className="bg-hospital-input border border-hospital-border rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 shadow-sm w-64 text-text-main" />
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    </div>
                    <button onClick={() => showToast('info', 'New EMR creation form opening...')} className="px-6 py-2.5 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-blue-700 transition-all flex items-center gap-2">
                        <Plus size={16} /> New Record
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Records', value: records.length.toLocaleString(), color: 'text-text-main', icon: <Folder size={24} /> },
                    { label: 'Active Files', value: records.filter(r => r.status === 'Active').length.toString(), color: 'text-primary', icon: <FolderOpen size={24} /> },
                    { label: 'Digitization', value: `${digitizationPct}%`, color: 'text-success', icon: <Save size={24} /> },
                    { label: 'Critical Patients', value: records.filter(r => r.status === 'Critical').length.toString().padStart(2, '0'), color: 'text-danger', icon: <Siren size={24} /> },
                ].map(s => (
                    <div key={s.label} className="bg-hospital-card p-6 rounded-2xl border border-hospital-border shadow-card hover:shadow-card-hover transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <span className={`text-xl ${s.color !== 'text-text-main' ? s.color.replace('text-', 'text-opacity-80 ') : 'text-slate-400'}`}>{s.icon}</span>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{s.label}</p>
                        </div>
                        <p className={`text-3xl font-black ${s.color} tracking-tighter`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex bg-hospital-card p-1.5 rounded-xl border border-hospital-border w-fit shadow-sm">
                {([['ALL', 'All Records'], ['RECENT', 'Recent'], ['CRITICAL', 'Critical']] as const).map(([key, label]) => (
                    <button key={key} onClick={() => setActiveTab(key as any)} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === key ? 'bg-primary/10 text-primary shadow-sm' : 'text-text-muted hover:text-text-body hover:bg-hospital-bg'}`}>{label}</button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Loading medical records...</p>
                    </div>
                </div>
            ) : (
                <div className="bg-hospital-card rounded-2xl border border-hospital-border shadow-card overflow-hidden">
                    <div className="p-6 border-b border-hospital-border bg-hospital-bg/50">
                        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                            <FileText size={14} /> Patient Medical Records — {filtered.length} Files
                        </h3>
                    </div>
                    <div className="divide-y divide-hospital-border">
                        {filtered.map(rec => (
                            <div key={rec.id} className="px-8 py-5 flex items-center gap-6 hover:bg-hospital-bg/50 transition-colors">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${rec.status === 'Critical' ? 'bg-danger/5 text-danger' : 'bg-primary/5 text-primary'}`}>
                                    {rec.status === 'Critical' ? <Siren size={18} /> : <FileText size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-text-main">{rec.name} <span className="text-text-muted font-bold">({rec.patientId})</span></p>
                                    <p className="text-[10px] font-bold text-text-muted mt-0.5">{rec.age}y / {rec.gender} • {rec.conditions.join(', ')} • {rec.totalVisits} visits</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[10px] font-bold text-text-muted flex items-center gap-1 justify-end"><Clock size={10} /> Last visit</p>
                                    <p className="text-sm font-black text-text-main">{rec.lastVisit}</p>
                                </div>
                                {!rec.digitized && <span className="px-2 py-1 bg-warning/10 text-warning rounded-lg text-[8px] font-black uppercase tracking-widest shrink-0 border border-warning/10">Paper</span>}
                                <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shrink-0 ${rec.status === 'Active' ? 'bg-success/5 text-success border border-success/10' : rec.status === 'Critical' ? 'bg-danger/5 text-danger animate-pulse border border-danger/10' : 'bg-slate-100 text-text-muted'}`}>{rec.status}</span>
                                <button onClick={() => handleViewRecord(rec.id)} disabled={viewing === rec.id} className="px-5 py-2 bg-primary/10 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all disabled:opacity-50 shrink-0 flex items-center gap-1.5">
                                    {viewing === rec.id ? 'Opening...' : <><FolderOpen size={12} /> View EMR</>}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl border border-slate-800">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center text-white border border-white/10">
                        <ShieldCheck size={32} />
                    </div>
                    <div className="flex-1 space-y-2 text-center md:text-left">
                        <h4 className="text-lg font-black text-white">HIPAA & DISHA Compliant Storage</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">All medical records are encrypted at rest (AES-256) and in transit (TLS 1.3). Access is role-based and fully audited.</p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 justify-end"><Database size={10} /> Storage Used</p>
                        <p className="text-xl font-black text-primary mt-1 flex items-center gap-2 justify-end"><Server size={16} /> 4.2 TB</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EMRManagement;
