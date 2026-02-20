
import React, { useState, useEffect } from 'react';
import api from '../apiClient';
import {
   TrendingUp, ShieldAlert, Award, FileText,
   Stethoscope, Package, Banknote, Settings,
   Clock, CheckCircle2, AlertCircle, RefreshCw,
   Download, Mail, ShieldCheck, ChevronRight, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Reports: React.FC = () => {
   const { canPerformAction } = useAuth();
   const { showToast } = useToast();
   const isAdmin = canPerformAction('REPORTS', 'ADMIN');
   const mockAuditLogs = [
      { id: 'AUD-901', type: 'Clinical', user: 'Dr. Sharma', action: 'Prescription Finalized', time: '10 mins ago', status: 'Verified' },
      { id: 'AUD-902', type: 'Inventory', user: 'Pharmacist Arjun', action: 'Stock Replenishment', time: '1 hr ago', status: 'Pending' },
      { id: 'AUD-903', type: 'System', user: 'Admin System', action: 'Nightly Backup Sync', time: '4 hrs ago', status: 'Success' },
      { id: 'AUD-904', type: 'Billing', user: 'Accounts Dept', action: 'Insurance Claim Batch', time: 'Yesterday', status: 'Verified' },
   ];

   const [auditLogs, setAuditLogs] = useState(mockAuditLogs);

   useEffect(() => {
      const fetchLogs = async () => {
         try {
            const data = await api.getAuditLogs();
            if (data?.logs && data.logs.length > 0) {
               setAuditLogs(data.logs.map((log: any) => ({
                  id: log.id?.toString().padStart(3, '0') ? `AUD-${log.id.toString().slice(-3)}` : log.id,
                  type: log.entity_type || 'System',
                  user: log.user_name || log.performed_by || 'System',
                  action: log.action || 'Unknown Action',
                  time: log.created_at ? new Date(log.created_at).toLocaleString() : 'Unknown',
                  status: 'Verified',
               })));
            }
         } catch { /* fallback to mock */ }
      };
      fetchLogs();
   }, []);

   const getTypeIcon = (type: string) => {
      switch (type) {
         case 'Clinical': return <Stethoscope size={20} />;
         case 'Inventory': return <Package size={20} />;
         case 'Billing': return <Banknote size={20} />;
         default: return <Settings size={20} />;
      }
   };

   return (
      <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8 p-8">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
               <h2 className="text-2xl font-black text-text-main tracking-tight">Enterprise Audit Reports</h2>
               <p className="text-sm font-bold text-text-muted mt-1 font-kannada flex items-center gap-2">
                  <span>“ಪಾರದರ್ಶಕತೆ — ಉತ್ತಮ ಆಡಳಿತ”</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span>Transparency through clinical intelligence.</span>
               </p>
            </div>
            <div className="flex gap-4">
               <button
                  onClick={() => isAdmin && showToast('info', 'Scheduling auto-mail...')}
                  disabled={!isAdmin}
                  title={!isAdmin ? "Requires Admin privileges" : "Schedule reports"}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 ${isAdmin ? 'bg-white border-hospital-border text-text-muted hover:bg-hospital-bg hover:text-text-main' : 'bg-slate-50 border-slate-100 text-slate-200 cursor-not-allowed'
                     }`}
               >
                  {isAdmin ? <Mail size={14} /> : <Lock size={14} />} Schedule Auto-Mail
               </button>
               <button
                  onClick={() => isAdmin && showToast('info', 'Downloading audit trail...')}
                  disabled={!isAdmin}
                  title={!isAdmin ? "Requires Admin privileges" : "Download data"}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all flex items-center gap-2 ${isAdmin ? 'bg-text-main text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-300 cursor-not-allowed grayscale'
                     }`}
               >
                  {isAdmin ? <Download size={14} /> : <Lock size={14} />} Download Audit Trail
               </button>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
               { label: 'Patient Outcomes', val: '94.2%', icon: <TrendingUp size={24} className="text-success" />, desc: 'Efficiency rating across all wards', bg: 'bg-success/5' },
               { label: 'Safety Incidents', val: '02', icon: <ShieldAlert size={24} className="text-danger" />, desc: 'Unresolved issues in current cycle', bg: 'bg-danger/5' },
               { label: 'Audit Score', val: '9.8/10', icon: <Award size={24} className="text-warning" />, desc: 'Compliance health index', bg: 'bg-warning/5' },
            ].map(stat => (
               <div key={stat.label} className="bg-hospital-card p-6 rounded-2xl border border-hospital-border shadow-card hover:shadow-card-hover transition-all group">
                  <div className="flex justify-between items-start mb-4">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ${stat.bg}`}>
                        {stat.icon}
                     </div>
                     <span className="px-2.5 py-1 bg-success/10 text-success text-[9px] font-black uppercase rounded-lg border border-success/10">High Trust</span>
                  </div>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{stat.label}</p>
                  <h4 className="text-3xl font-black text-text-main tracking-tight">{stat.val}</h4>
                  <p className="text-[10px] text-text-muted mt-2 font-bold">{stat.desc}</p>
               </div>
            ))}
         </div>

         <div className="bg-hospital-card rounded-2xl border border-hospital-border shadow-card relative overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-hospital-border bg-hospital-bg/50">
               <h3 className="text-lg font-black text-text-main tracking-tight flex items-center gap-2">
                  <FileText size={20} className="text-primary" /> Active Audit Trail
               </h3>
               <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-success/20 shadow-sm">
                  <span className="relative flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </span>
                  <span className="text-[9px] font-black text-success uppercase tracking-widest leading-none">Live Sync: ACTIVE</span>
               </div>
            </div>

            <div className="divide-y divide-hospital-border">
               {auditLogs.map(log => (
                  <div key={log.id} className="flex items-center justify-between p-6 hover:bg-hospital-bg/50 transition-colors group">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-hospital-bg rounded-xl border border-hospital-border flex items-center justify-center text-text-muted shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all">
                           {getTypeIcon(log.type)}
                        </div>
                        <div>
                           <h5 className="text-sm font-black text-text-main tracking-tight">{log.action}</h5>
                           <p className="text-[10px] font-bold text-text-muted uppercase mt-0.5 flex items-center gap-1.5">
                              <span>Logged by {log.user}</span>
                              <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                              <span>{log.id}</span>
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-8">
                        <div className="text-right hidden sm:block">
                           <p className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none mb-1 opacity-60">Time</p>
                           <p className="text-xs font-bold text-text-body flex items-center gap-1 justify-end">
                              <Clock size={12} className="text-text-muted" /> {log.time}
                           </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${log.status === 'Verified' ? 'bg-success/5 text-success border-success/10' :
                           log.status === 'Pending' ? 'bg-warning/5 text-warning border-warning/10' : 'bg-primary/5 text-primary border-primary/10'
                           }`}>
                           {log.status === 'Verified' ? <CheckCircle2 size={10} /> : log.status === 'Pending' ? <AlertCircle size={10} /> : <RefreshCw size={10} />}
                           {log.status}
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            <div className="p-4 border-t border-hospital-border bg-hospital-bg/30">
               <button className="w-full py-3 bg-white border border-hospital-border rounded-xl text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hover:bg-hospital-bg hover:text-text-main transition-all flex items-center justify-center gap-2">
                  View Extended Historical Data Logs <ChevronRight size={12} />
               </button>
            </div>
         </div>

         <div className="bg-text-main rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl group border border-text-main">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
               <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white shadow-inner border border-white/10">
                  <ShieldCheck size={32} />
               </div>
               <div className="flex-1 space-y-2 text-center md:text-left">
                  <h3 className="text-xl font-black text-white tracking-tight">Compliance Readiness Score</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed font-kannada">
                     “ಸಂಪೂರ್ಣ ಅನುಸರಣೆ — ಸುರಕ್ಷಿತ ಚಿಕಿತ್ಸೆ” — Hospital is currently 98.4% compliant with NABH and HIPAA standard audit protocols. Auto-generation of quarterly review is active.
                  </p>
               </div>
               <div className="text-center md:text-right shrink-0 bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Next State Review</p>
                  <p className="text-2xl font-black text-accent mt-1 tracking-tighter">14 MAR 2026</p>
               </div>
            </div>
         </div>
      </div>
   );
};

export default Reports;
