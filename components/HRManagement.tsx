
import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../apiClient';
import { useAuth } from '../context/AuthContext';
import {
    Users, Calendar, CheckCircle2, AlertCircle, Clock,
    UserPlus, Plus, Stethoscope, Briefcase, UserCog,
    Edit2, Trash2, Plane, ClipboardList, Building2,
    Activity, ArrowRight, Mail, Phone, Loader2
} from 'lucide-react';

const HRManagement: React.FC = () => {
    const { showToast } = useToast();
    const { user, canPerformAction } = useAuth();
    const isAdmin = canPerformAction('HR', 'ADMIN');
    const [activeTab, setActiveTab] = useState<'ROSTER' | 'LEAVES' | 'ATTENDANCE'>('ROSTER');
    const [approving, setApproving] = useState<string | null>(null);
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newDoc, setNewDoc] = useState({
        name: '', role: 'Doctor', department: '', email: '', phone: '', specialization: '', employee_id: ''
    });

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const doctors = await api.getDoctors();
            setStaff(doctors);
        } catch (err: any) {
            showToast('error', `Failed to load staff: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleAddDoctor = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if ((newDoc as any).id) {
                await api.updateDoctor((newDoc as any).id, newDoc);
                showToast('success', 'Staff member updated successfully');
            } else {
                await api.createDoctor(newDoc);
                showToast('success', 'Staff member added successfully');
            }
            setShowAddForm(false);
            setNewDoc({ name: '', role: 'Doctor', department: '', email: '', phone: '', specialization: '', employee_id: '' });
            fetchStaff();
        } catch (err: any) {
            showToast('error', err.message);
        }
    };

    const handleEditDoctor = (doc: any) => {
        setNewDoc({ ...doc });
        setShowAddForm(true);
    };

    const handleDeleteDoctor = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name}?`)) return;
        try {
            await api.deleteDoctor(id);
            showToast('success', 'Staff member removed');
            fetchStaff();
        } catch (err: any) {
            showToast('error', err.message);
        }
    };

    const leaves = [
        { id: 'LV001', staff: 'Dr. Sunita Rao', type: 'Casual Leave', from: '2026-02-18', to: '2026-02-20', days: 3, status: 'Approved', reason: 'Personal' },
        { id: 'LV002', staff: 'Nurse Kavitha R.', type: 'Sick Leave', from: '2026-02-19', to: '2026-02-19', days: 1, status: 'Pending', reason: 'Fever' },
        { id: 'LV003', staff: 'Ravi Kumar', type: 'Earned Leave', from: '2026-02-25', to: '2026-03-01', days: 5, status: 'Pending', reason: 'Family function' },
        { id: 'LV004', staff: 'Ganesh P.', type: 'Casual Leave', from: '2026-02-14', to: '2026-02-14', days: 1, status: 'Approved', reason: 'Personal' },
    ];

    const attendance = [
        { dept: 'Surgery', total: 12, present: 10, leaves: 1, absent: 1 },
        { dept: 'Internal Medicine', total: 8, present: 7, leaves: 1, absent: 0 },
        { dept: 'ICU', total: 15, present: 12, leaves: 2, absent: 1 },
        { dept: 'General Ward', total: 20, present: 18, leaves: 1, absent: 1 },
        { dept: 'OT', total: 6, present: 6, leaves: 0, absent: 0 },
        { dept: 'Pathology', total: 5, present: 4, leaves: 1, absent: 0 },
        { dept: 'Radiology', total: 4, present: 3, leaves: 1, absent: 0 },
        { dept: 'Admin', total: 10, present: 9, leaves: 0, absent: 1 },
    ];

    const handleApproveLeave = async (id: string) => {
        setApproving(id);
        await new Promise(r => setTimeout(r, 1000));
        showToast('success', `Leave ${id} approved successfully`);
        setApproving(null);
    };

    const onDuty = staff.filter(s => s.status === 'active' || !s.status).length;
    const onLeave = 0; // staff.filter(s => s.status === 'On Leave').length;
    const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;

    if (showAddForm) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto py-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-text-main tracking-tight">
                            {(newDoc as any).id ? 'Edit Staff Member' : 'Add Staff Member'}
                        </h2>
                        <p className="text-sm font-medium text-text-muted">
                            {(newDoc as any).id ? 'Update staff details.' : 'Register a new doctor or specialist.'}
                        </p>
                    </div>
                    <button onClick={() => setShowAddForm(false)} className="px-5 py-2.5 bg-white border border-hospital-border text-text-body rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-hospital-bg transition-colors">
                        Cancel
                    </button>
                </div>

                <form onSubmit={handleAddDoctor} className="bg-hospital-card p-8 rounded-2xl border border-hospital-border shadow-card space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Full Name *</label>
                        <div className="relative">
                            <UserPlus size={16} className="absolute left-4 top-3.5 text-text-muted" />
                            <input value={newDoc.name} onChange={e => setNewDoc({ ...newDoc, name: e.target.value })}
                                className="w-full bg-hospital-input border border-hospital-border rounded-xl pl-10 pr-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" required placeholder="Dr. Name or Staff Name" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Department *</label>
                            <div className="relative">
                                <Building2 size={16} className="absolute left-4 top-3.5 text-text-muted" />
                                <input value={newDoc.department} onChange={e => setNewDoc({ ...newDoc, department: e.target.value })}
                                    className="w-full bg-hospital-input border border-hospital-border rounded-xl pl-10 pr-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" required placeholder="Ex. Cardiology" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Specialization</label>
                            <input value={newDoc.specialization} onChange={e => setNewDoc({ ...newDoc, specialization: e.target.value })}
                                className="w-full bg-hospital-input border border-hospital-border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" placeholder="Ex. Surgeon" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-4 top-3.5 text-text-muted" />
                                <input type="email" value={newDoc.email} onChange={e => setNewDoc({ ...newDoc, email: e.target.value })}
                                    className="w-full bg-hospital-input border border-hospital-border rounded-xl pl-10 pr-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" placeholder="staff@hospital.com" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Phone</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-4 top-3.5 text-text-muted" />
                                <input value={newDoc.phone} onChange={e => setNewDoc({ ...newDoc, phone: e.target.value })}
                                    className="w-full bg-hospital-input border border-hospital-border rounded-xl pl-10 pr-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" placeholder="Contact Number" />
                            </div>
                        </div>
                    </div>
                    <button type="submit"
                        className="w-full bg-primary text-white font-bold py-3.5 rounded-xl mt-4 hover:bg-teal-800 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                        <CheckCircle2 size={18} />
                        {(newDoc as any).id ? 'Update Member' : 'Register Member'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500 space-y-8 p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
                <div>
                    <h2 className="text-2xl font-black text-text-main tracking-tight">HR & Workforce</h2>
                    <p className="text-sm font-bold text-text-muted mt-1 font-kannada flex items-center gap-2">
                        <span>"ತಂಡದ ಬಲ — ಸೇವೆಯ ಬಲ"</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>Team strength is service strength.</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => showToast('info', 'Shift planner opening...')} className="px-5 py-2.5 bg-white border border-hospital-border rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:bg-hospital-bg hover:text-text-main hover:border-text-muted/20 shadow-sm transition-all flex items-center gap-2">
                        <Calendar size={14} /> Shift Planner
                    </button>
                    <button
                        onClick={() => isAdmin && setShowAddForm(true)}
                        disabled={!isAdmin}
                        title={!isAdmin ? "Requires Admin privileges" : "Register new staff"}
                        className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 relative z-20 ${isAdmin
                                ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-teal-800 cursor-pointer'
                                : 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed grayscale'
                            }`}>
                        {isAdmin ? <Plus size={14} /> : <Lock size={14} />}
                        Add Staff
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Staff', value: staff.length.toString(), color: 'text-text-main', icon: <Users size={24} className="text-primary" />, bg: 'bg-primary/5' },
                    { label: 'On Duty', value: onDuty.toString().padStart(2, '0'), color: 'text-success', icon: <CheckCircle2 size={24} className="text-success" />, bg: 'bg-success/5' },
                    { label: 'On Leave', value: onLeave.toString().padStart(2, '0'), color: 'text-warning', icon: <Plane size={24} className="text-warning" />, bg: 'bg-warning/5' },
                    { label: 'Pending Leaves', value: pendingLeaves.toString().padStart(2, '0'), color: 'text-primary', icon: <ClipboardList size={24} className="text-primary" />, bg: 'bg-primary/5' },
                ].map(s => (
                    <div key={s.label} className="bg-hospital-card p-6 rounded-2xl border border-hospital-border shadow-card hover:shadow-card-hover transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${s.bg}`}>
                                {s.icon}
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{s.label}</p>
                        <p className={`text-3xl font-black ${s.color} tracking-tighter`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex bg-hospital-card p-1.5 rounded-xl border border-hospital-border w-fit shadow-sm">
                {([['ROSTER', 'Staff Roster'], ['LEAVES', 'Leave Requests'], ['ATTENDANCE', 'Attendance']] as const).map(([key, label]) => (
                    <button key={key} onClick={() => setActiveTab(key as any)} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === key ? 'bg-primary/10 text-primary shadow-sm' : 'text-text-muted hover:text-text-body hover:bg-hospital-bg'}`}>{label}</button>
                ))}
            </div>

            {activeTab === 'ROSTER' && (
                <div className="bg-hospital-card rounded-2xl border border-hospital-border shadow-card overflow-hidden">
                    <div className="p-6 border-b border-hospital-border bg-hospital-bg/50 flex justify-between items-center">
                        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                            <Users size={14} /> Staff Roster — {staff.length} Members
                        </h3>
                    </div>
                    <div className="divide-y divide-hospital-border">
                        {loading ? (
                            <div className="p-20 text-center flex flex-col items-center gap-3">
                                <Loader2 size={32} className="animate-spin text-primary/30" />
                                <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Loading rosters...</p>
                            </div>
                        ) : staff.map(s => (
                            <div key={s.id} className="px-8 py-5 flex items-center gap-6 hover:bg-hospital-bg/50 transition-colors group">
                                <div className="w-10 h-10 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                    {(s.role || '').includes('Dr') || (s.employee_id || '').startsWith('DOC') || s.specialization ? <Stethoscope size={20} /> : <Briefcase size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-text-main">{s.name}</p>
                                    <p className="text-[10px] font-bold text-text-muted flex items-center gap-1.5 mt-0.5">
                                        <span>{s.role || 'Specialist'}</span>
                                        <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                                        <span>{s.department || s.dept}</span>
                                        {s.specialization && (
                                            <>
                                                <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                                                <span>{s.specialization}</span>
                                            </>
                                        )}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shrink-0 border ${s.status === 'active' || !s.status ? 'bg-success/5 text-success border-success/10' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                    {s.status || 'active'}
                                </span>
                                <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => isAdmin && handleEditDoctor(s)}
                                        disabled={!isAdmin}
                                        className={`p-2 rounded-lg transition-all ${isAdmin ? 'text-text-muted hover:text-primary hover:bg-primary/5' : 'text-slate-200 cursor-not-allowed'}`}
                                        title={isAdmin ? "Edit Staff" : "Read-only"}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => isAdmin && handleDeleteDoctor(s.id, s.name)}
                                        disabled={!isAdmin}
                                        className={`p-2 rounded-lg transition-all ${isAdmin ? 'text-text-muted hover:text-danger hover:bg-danger/5' : 'text-slate-200 cursor-not-allowed'}`}
                                        title={isAdmin ? "Delete Staff" : "Read-only"}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'LEAVES' && (
                <div className="bg-hospital-card rounded-2xl border border-hospital-border shadow-card overflow-hidden">
                    <div className="p-6 border-b border-hospital-border bg-hospital-bg/50">
                        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                            <Plane size={14} /> Leave Requests
                        </h3>
                    </div>
                    <div className="divide-y divide-hospital-border">
                        {leaves.map(l => (
                            <div key={l.id} className="px-8 py-5 flex items-center gap-6 hover:bg-hospital-bg/50 transition-colors">
                                <div className="w-10 h-10 bg-warning/5 border border-warning/10 rounded-xl flex items-center justify-center text-warning shrink-0">
                                    <ClipboardList size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-text-main">{l.staff}</p>
                                    <p className="text-[10px] font-bold text-text-muted flex items-center gap-1.5 mt-0.5">
                                        <span className="text-text-body">{l.type}</span>
                                        <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                                        <span>{l.from} to {l.to}</span>
                                        <span className="bg-slate-100 px-1.5 rounded text-slate-500">{l.days} day{l.days > 1 ? 's' : ''}</span>
                                    </p>
                                    <p className="text-[10px] text-text-muted italic mt-1">Reason: {l.reason}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shrink-0 border ${l.status === 'Approved' ? 'bg-success/5 text-success border-success/10' : 'bg-warning/5 text-warning border-warning/10'}`}>
                                    {l.status}
                                </span>
                                <button
                                    onClick={() => isAdmin && handleApproveLeave(l.id)}
                                    disabled={!isAdmin || approving === l.id}
                                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shrink-0 flex items-center gap-2 ${isAdmin
                                            ? 'bg-success text-white hover:bg-green-700'
                                            : 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed'
                                        }`}
                                >
                                    {approving === l.id ? <Loader2 size={12} className="animate-spin" /> : (isAdmin ? <CheckCircle2 size={12} /> : <Lock size={12} />)}
                                    {approving === l.id ? 'Approving...' : 'Approve'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'ATTENDANCE' && (
                <div className="bg-hospital-card rounded-2xl border border-hospital-border shadow-card overflow-hidden">
                    <div className="p-6 border-b border-hospital-border bg-hospital-bg/50">
                        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                            <Activity size={14} /> Department-wise Attendance — Today
                        </h3>
                    </div>
                    <div className="divide-y divide-hospital-border">
                        {attendance.map(a => (
                            <div key={a.dept} className="px-8 py-5 flex items-center gap-6 hover:bg-hospital-bg/50 transition-colors">
                                <div className="w-10 h-10 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                    <Building2 size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-text-main">{a.dept}</p>
                                    <p className="text-[10px] font-bold text-text-muted mt-0.5">Total: <span className="text-text-body">{a.total}</span> staff members</p>
                                </div>
                                <div className="flex gap-6 shrink-0 mr-4">
                                    <div className="text-center">
                                        <p className="text-sm font-black text-success">{a.present}</p>
                                        <p className="text-[8px] font-black text-text-muted uppercase tracking-widest opacity-60">Present</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-black text-warning">{a.leaves}</p>
                                        <p className="text-[8px] font-black text-text-muted uppercase tracking-widest opacity-60">Leave</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-black text-danger">{a.absent}</p>
                                        <p className="text-[8px] font-black text-text-muted uppercase tracking-widest opacity-60">Absent</p>
                                    </div>
                                </div>
                                <div className="w-24 h-1.5 bg-hospital-bg rounded-full overflow-hidden shrink-0 border border-hospital-border/50">
                                    <div className="h-full bg-success rounded-full transition-all duration-1000" style={{ width: `${(a.present / a.total) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HRManagement;
