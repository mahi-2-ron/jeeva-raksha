
import React, { useState, useEffect } from 'react';
import { Incident } from '../types';
import api from '../apiClient';
import {
  AlertTriangle, Pill, Activity, Wrench, Siren,
  User, Shield, ShieldAlert, CheckCircle2, XCircle,
  Clock, FileWarning, ChevronRight, Eye, ShieldCheck
} from 'lucide-react';

const IncidentReport: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: 'INC-2026-001',
      type: 'Medication Error',
      description: 'Patient administered incorrect dosage of Insulin Glargine due to label misreading.',
      severity: 'Moderate',
      date: '2026-02-22',
      status: 'Under Review',
      isAnonymous: false
    },
    {
      id: 'INC-2026-002',
      type: 'Fall',
      description: 'Elderly patient slipped in Ward B bathroom; no injuries reported.',
      severity: 'Low',
      date: '2026-02-23',
      status: 'Resolved',
      isAnonymous: true
    }
  ]);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const data = await api.getAuditLogs();
        if (data?.logs && data.logs.length > 0) {
          const incidentLogs = data.logs
            .filter((log: any) => log.entity_type === 'Incident' || log.action?.includes('Incident'))
            .map((log: any) => ({
              id: `INC-${log.id}`,
              type: log.action || 'Other',
              description: log.details || log.action || '',
              severity: 'Low' as const,
              date: log.created_at ? new Date(log.created_at).toISOString().split('T')[0] : '',
              status: 'Reported' as const,
              isAnonymous: false,
            }));
          if (incidentLogs.length > 0) {
            setIncidents(prev => [...incidentLogs, ...prev]);
          }
        }
      } catch { /* keep mock data */ }
    };
    fetchIncidents();
  }, []);

  const [formData, setFormData] = useState<Partial<Incident>>({
    type: 'Other',
    severity: 'Low',
    description: '',
    isAnonymous: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newIncident: Incident = {
      id: `INC-2026-${String(incidents.length + 1).padStart(3, '0')}`,
      type: formData.type as any,
      description: formData.description || '',
      severity: formData.severity as any,
      date: new Date().toISOString().split('T')[0],
      status: 'Reported',
      isAnonymous: formData.isAnonymous || false
    };
    setIncidents([newIncident, ...incidents]);
    setShowForm(false);
    setFormData({ type: 'Other', severity: 'Low', description: '', isAnonymous: false });

    // Persist to audit log
    try {
      await api.createAuditLog({
        action: `Incident: ${newIncident.type}`,
        entity_type: 'Incident',
        entity_id: newIncident.id,
        details: newIncident.description,
      });
    } catch { /* non-blocking */ }
  };

  const getSeverityColor = (severity: Incident['severity']) => {
    switch (severity) {
      case 'Low': return 'bg-success/5 text-success border-success/10';
      case 'Moderate': return 'bg-warning/5 text-warning border-warning/10';
      case 'High': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'Critical': return 'bg-danger/5 text-danger border-danger/10 animate-pulse font-black';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const getStatusColor = (status: Incident['status']) => {
    switch (status) {
      case 'Reported': return 'bg-primary/5 text-primary border-primary/10';
      case 'Under Review': return 'bg-accent/5 text-accent border-accent/10';
      case 'Resolved': return 'bg-success/5 text-success border-success/10';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Medication Error': return <Pill size={24} />;
      case 'Fall': return <Activity size={24} />;
      case 'Equipment Failure': return <Wrench size={24} />;
      case 'Clinical Complication': return <AlertTriangle size={24} />;
      default: return <Siren size={24} />;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-text-main tracking-tight">Safety & Incident Logging</h2>
          <p className="text-sm font-bold text-text-muted mt-1 font-kannada flex items-center gap-2">
            <span>“ರೋಗಿಯ ಸುರಕ್ಷತೆ ನಮ್ಮ ಆದ್ಯತೆ”</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>Patient safety is our priority.</span>
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center gap-2 ${showForm ? 'bg-white text-text-body border border-hospital-border hover:bg-hospital-bg' : 'bg-danger text-white hover:bg-red-700 shadow-danger/20'
            }`}
        >
          {showForm ? 'Cancel Report' : <><Siren size={16} /> New Incident Report</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-hospital-card p-8 rounded-2xl border border-hospital-border shadow-card animate-in zoom-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Incident Classification</label>
              <div className="relative">
                <FileWarning size={16} className="absolute left-4 top-3.5 text-text-muted" />
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full bg-hospital-input border border-hospital-border rounded-xl pl-10 pr-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                >
                  <option value="Medication Error">Medication Error</option>
                  <option value="Fall">Fall</option>
                  <option value="Equipment Failure">Equipment Failure</option>
                  <option value="Clinical Complication">Clinical Complication</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Initial Severity Level</label>
              <div className="relative">
                <Activity size={16} className="absolute left-4 top-3.5 text-text-muted" />
                <select
                  value={formData.severity}
                  onChange={e => setFormData({ ...formData, severity: e.target.value as any })}
                  className="w-full bg-hospital-input border border-hospital-border rounded-xl pl-10 pr-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                >
                  <option value="Low">Low (No harm)</option>
                  <option value="Moderate">Moderate (Minor harm)</option>
                  <option value="High">High (Significant harm)</option>
                  <option value="Critical">Critical (Severe harm/Death)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-8">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Detailed Description of Events</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a clear, factual account of the incident..."
              className="w-full bg-hospital-input border border-hospital-border rounded-2xl px-6 py-4 text-sm font-semibold h-40 outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-hospital-border pt-6">
            <div className="flex items-center gap-3 bg-hospital-bg px-4 py-2 rounded-xl border border-hospital-border">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isAnonymous}
                  onChange={e => setFormData({ ...formData, isAnonymous: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1">
                <User size={12} /> Report Anonymously
              </span>
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-text-main text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <ShieldAlert size={16} /> Submit Official Record
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
          <Shield size={14} /> Historical Safety Logs
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {incidents.map(inc => (
            <div key={inc.id} className="bg-hospital-card p-6 rounded-2xl border border-hospital-border shadow-card hover:shadow-card-hover transition-all group overflow-hidden relative">
              <div className="flex flex-col md:flex-row justify-between gap-6 items-start">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-hospital-bg border border-hospital-border rounded-xl flex items-center justify-center text-text-main shrink-0 group-hover:scale-110 transition-transform">
                    {getTypeIcon(inc.type)}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-text-main tracking-tight">{inc.type}</h4>
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-1 flex items-center gap-1.5">
                      <span>{inc.id}</span>
                      <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                      <span>{inc.date}</span>
                    </p>
                    <p className="text-sm text-text-body font-medium leading-relaxed mt-2 bg-hospital-bg/50 p-2 rounded-lg border border-hospital-border/50">
                      "{inc.description}"
                    </p>
                    {inc.isAnonymous && (
                      <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200">
                        <User size={10} /> Anonymous
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-3 items-end w-full md:w-auto">
                  <div className="flex gap-2">
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border text-center flex items-center gap-1 ${getSeverityColor(inc.severity)}`}>
                      <Activity size={10} /> {inc.severity} Risk
                    </span>
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border text-center flex items-center gap-1 ${getStatusColor(inc.status)}`}>
                      {inc.status === 'Resolved' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                      {inc.status}
                    </span>
                  </div>
                  <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline flex items-center gap-1 mt-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    Full Investigation <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-primary/5 p-8 rounded-2xl border border-primary/10 text-center space-y-3">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary mx-auto shadow-sm border border-primary/10">
          <ShieldCheck size={24} />
        </div>
        <h3 className="text-lg font-black text-text-main">Zero Harm Philosophy</h3>
        <p className="text-sm text-text-muted font-medium max-w-xl mx-auto font-kannada">
          “ದೋಷಮುಕ್ತ ಸೇವೆ — ಸುರಕ್ಷಿತ ಚಿಕಿತ್ಸೆ” — Every report is a step towards a safer hospital environment. Our system ensures non-punitive, data-driven improvement.
        </p>
      </div>
    </div>
  );
};

export default IncidentReport;
