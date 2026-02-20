
import React, { useState, useEffect } from 'react';
import { RadiologyStudy } from '../types';
import api from '../apiClient';
import { useAuth } from '../context/AuthContext';
import {
  Scan, Zap, FileText, Siren, Clock, User,
  Search, Plus, ChevronRight, Activity,
  BrainCircuit, Bone, Magnet, Waves, Radio, Lock
} from 'lucide-react';

const Radiology: React.FC = () => {
  const { canPerformAction, showToast } = useAuth();
  const isEdit = canPerformAction('RADIOLOGY', 'EDIT');
  const [studies, setStudies] = useState<RadiologyStudy[]>([
    {
      id: 'STUDY-101',
      patientName: 'Vikram Mehta',
      modality: 'CT',
      status: 'Scanning',
      radiologist: 'Dr. Sanjay Kapoor',
      requestedBy: 'Dr. Aditi Sharma',
      isCritical: true,
      timeRequested: '10:15 AM',
      reportAvailable: false
    },
    {
      id: 'STUDY-102',
      patientName: 'Anjali Sharma',
      modality: 'MRI',
      status: 'Scheduled',
      radiologist: 'Dr. Priya Das',
      requestedBy: 'Dr. Vikram Seth',
      isCritical: false,
      timeRequested: '09:30 AM',
      reportAvailable: false
    },
    {
      id: 'STUDY-103',
      patientName: 'Rajesh Kumar',
      modality: 'X-Ray',
      status: 'Awaiting-Report',
      radiologist: 'Dr. Sanjay Kapoor',
      requestedBy: 'Dr. Priya Das',
      isCritical: true,
      timeRequested: '08:45 AM',
      reportAvailable: false
    },
    {
      id: 'STUDY-104',
      patientName: 'Meena Kumari',
      modality: 'USG',
      status: 'Finalized',
      radiologist: 'Dr. Ravi Varma',
      requestedBy: 'Dr. Sneha Rao',
      isCritical: false,
      timeRequested: '07:30 AM',
      reportAvailable: true
    },
    {
      id: 'STUDY-105',
      patientName: 'Suresh Raina',
      modality: 'CT',
      status: 'Delayed',
      radiologist: 'Dr. Priya Das',
      requestedBy: 'Dr. Rahul Verma',
      isCritical: false,
      timeRequested: '11:00 AM',
      reportAvailable: false
    }
  ]);

  useEffect(() => {
    const enrichWithPatients = async () => {
      try {
        const patients = await api.getPatients();
        if (patients && patients.length > 0) {
          setStudies(prev => prev.map((study, idx) => ({
            ...study,
            patientName: patients[idx % patients.length]?.name || study.patientName,
          })));
        }
      } catch { /* keep mock data */ }
    };
    enrichWithPatients();
  }, []);

  const [activeTab, setActiveTab] = useState<'ALL' | 'CT' | 'MRI' | 'XRAY' | 'USG'>('ALL');
  const [selectedStudy, setSelectedStudy] = useState<RadiologyStudy | null>(null);

  const filteredStudies = activeTab === 'ALL'
    ? studies
    : studies.filter(s => {
      if (activeTab === 'XRAY') return s.modality === 'X-Ray';
      return s.modality === activeTab;
    });

  const getStatusStyle = (status: RadiologyStudy['status']) => {
    switch (status) {
      case 'Scanning': return 'bg-primary/5 text-primary border-primary/10';
      case 'Scheduled': return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'Awaiting-Report': return 'bg-warning/5 text-warning border-warning/10';
      case 'Finalized': return 'bg-success/5 text-success border-success/10';
      case 'Delayed': return 'bg-danger/5 text-danger border-danger/10 animate-pulse';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const getModalityIcon = (modality: RadiologyStudy['modality']) => {
    switch (modality) {
      case 'CT': return <Scan size={20} />;
      case 'MRI': return <Magnet size={20} />;
      case 'X-Ray': return <Bone size={20} />;
      case 'USG': return <Waves size={20} />;
      default: return <Radio size={20} />;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500 space-y-8 pb-20 p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-2xl font-black text-text-main tracking-tight">Radiology Operations</h2>
          <p className="text-sm font-bold text-text-muted mt-1 font-kannada flex items-center gap-2">
            <span>“ನಿಖರ ಚಿತ್ರಣ — ಸುರಕ್ಷಿತ ರೋಗನಿರ್ಣಯ”</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>Precision imaging for safe diagnosis.</span>
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-hospital-card rounded-xl p-1 shadow-sm border border-hospital-border overflow-x-auto max-w-full custom-scrollbar">
            {(['ALL', 'CT', 'MRI', 'XRAY', 'USG'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === tab ? 'bg-primary/10 text-primary shadow-sm' : 'text-text-muted hover:bg-hospital-bg hover:text-text-body'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            onClick={() => isEdit && showToast('info', 'Requesting new radiology study...')}
            disabled={!isEdit}
            title={!isEdit ? "Requires Clinical Clinical Staff privileges" : "Order new scan"}
            className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center gap-2 ${isEdit
              ? 'bg-primary text-white shadow-primary/20 hover:bg-blue-700'
              : 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed grayscale'
              }`}
          >
            {isEdit ? <Plus size={14} /> : <Lock size={14} />} Request New Study
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Scanning Now', value: String(studies.filter(s => s.status === 'Scanning').length).padStart(2, '0'), icon: <Zap size={24} />, color: 'primary' },
          { label: 'Reports Pending', value: String(studies.filter(s => s.status === 'Awaiting-Report' || s.status === 'Scheduled').length).padStart(2, '0'), icon: <FileText size={24} />, color: 'warning' },
          { label: 'Critical Alerts', value: String(studies.filter(s => s.isCritical).length).padStart(2, '0'), icon: <Siren size={24} />, color: 'danger' },
          { label: 'Avg Turnaround', value: '42m', icon: <Clock size={24} />, color: 'success' },
        ].map(stat => (
          <div key={stat.label} className="bg-hospital-card p-6 rounded-2xl border border-hospital-border shadow-card flex items-center justify-between group hover:shadow-card-hover transition-all">
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-text-main">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 bg-${stat.color}/5 text-${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Worklist Table */}
        <div className="col-span-12 lg:col-span-9">
          <div className="bg-hospital-card rounded-2xl border border-hospital-border shadow-card overflow-hidden">
            <div className="p-6 border-b border-hospital-border flex justify-between items-center bg-hospital-bg/50">
              <h3 className="text-lg font-black text-text-main tracking-tight flex items-center gap-2">
                <Radio size={18} className="text-primary" /> Active Worklist
              </h3>
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-hospital-border">
                {filteredStudies.length} Studies Active
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-hospital-border">
                    <th className="px-6 py-4">Study Info</th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Requested By</th>
                    <th className="px-6 py-4">Acuity</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Radiologist</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hospital-border">
                  {filteredStudies.map(study => (
                    <tr
                      key={study.id}
                      onClick={() => setSelectedStudy(study)}
                      className={`group hover:bg-hospital-bg/50 transition-colors cursor-pointer ${selectedStudy?.id === study.id ? 'bg-primary/5' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <span className="text-text-muted group-hover:text-primary group-hover:scale-110 transition-all bg-hospital-bg p-2 rounded-lg border border-hospital-border">
                            {getModalityIcon(study.modality)}
                          </span>
                          <div>
                            <p className="text-sm font-black text-text-main leading-none">{study.modality} Study</p>
                            <p className="text-[10px] font-bold text-primary uppercase mt-1">{study.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-text-body">{study.patientName}</p>
                        <p className="text-[10px] font-bold text-text-muted uppercase mt-0.5 flex items-center gap-1">
                          <Clock size={10} /> {study.timeRequested}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-text-muted flex items-center gap-1.5 is-truncated max-w-[120px]">
                          <User size={12} /> {study.requestedBy}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {study.isCritical ? (
                          <span className="px-2.5 py-1 bg-danger/5 text-danger text-[9px] font-black uppercase rounded-lg border border-danger/10 animate-pulse flex items-center gap-1 w-fit">
                            <Siren size={10} /> High Urgency
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-text-muted uppercase bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 w-fit">Routine</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit ${getStatusStyle(study.status)}`}>
                          <Activity size={10} /> {study.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-xs font-black text-text-main">{study.radiologist}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-8">
          {selectedStudy ? (
            <div className="bg-hospital-card p-8 rounded-2xl border border-hospital-border shadow-card animate-in slide-in-from-right-4 duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
                <FileText size={14} /> Study Details
              </h3>

              <div className="space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-hospital-border">
                  <div className="w-14 h-14 bg-hospital-bg rounded-xl flex items-center justify-center text-primary shadow-sm border border-hospital-border">
                    {getModalityIcon(selectedStudy.modality)}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-text-main leading-tight">{selectedStudy.modality} Scan</h4>
                    <p className="text-[10px] font-bold text-text-muted uppercase mt-1">{selectedStudy.patientName}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] font-black text-text-muted uppercase mb-1.5">Assignment</p>
                    <select className="w-full bg-hospital-bg border border-hospital-border rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-1 focus:ring-primary/20">
                      <option>{selectedStudy.radiologist}</option>
                      <option>Dr. Sanjay Kapoor</option>
                      <option>Dr. Priya Das</option>
                      <option>Dr. Ravi Varma</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-text-muted uppercase mb-1.5">Study Urgency</p>
                    <div className="flex gap-2">
                      <button className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border flex justify-center items-center gap-1 ${selectedStudy.isCritical ? 'bg-danger text-white border-danger' : 'bg-hospital-bg text-text-muted border-hospital-border'}`}>
                        <Siren size={12} /> Critical
                      </button>
                      <button className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${!selectedStudy.isCritical ? 'bg-success text-white border-success' : 'bg-hospital-bg text-text-muted border-hospital-border'}`}>
                        Routine
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <button className="w-full py-4 bg-text-main text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 shadow-lg transition-all flex items-center justify-center gap-2">
                    <Activity size={14} /> Update Scan Status
                  </button>
                  <button className="w-full py-4 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                    <Scan size={14} /> Open Viewer (PACS)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-hospital-card p-10 rounded-2xl border border-hospital-border shadow-sm flex flex-col items-center justify-center text-center py-24 border-dashed">
              <div className="w-16 h-16 bg-hospital-bg rounded-full flex items-center justify-center mb-6 text-text-muted opacity-50">
                <Scan size={32} />
              </div>
              <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest">Selection Required</h4>
              <p className="text-xs text-text-muted mt-2 font-bold px-4">Select a study from the worklist to manage assignments and status.</p>
            </div>
          )}

          <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl group border border-slate-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <BrainCircuit size={24} className="text-accent group-hover:rotate-12 transition-transform" />
                <h4 className="text-sm font-black text-white">AI Prioritization</h4>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed font-kannada">
                “ಸಮಯೋಚಿತ ಚಿಕಿತ್ಸೆ — ಪ್ರಾಣರಕ್ಷಣೆ” — AI engine has auto-flagged Study-101 for immediate review due to hyper-dense opacity detection in pre-report analysis.
              </p>
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                <p className="text-[9px] font-black text-accent uppercase tracking-widest mb-1">Impact score</p>
                <p className="text-2xl font-black text-white tracking-tighter">9.4/10</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Radiology;
