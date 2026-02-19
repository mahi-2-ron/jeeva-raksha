
import React, { useState, useEffect } from 'react';
import { LabTestResult } from '../types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import apiClient from '../apiClient';
import {
  Microscope, FileText, FlaskConical, Activity,
  AlertOctagon, CheckCircle2, TrendingUp, Download,
  Share2, Info, ChevronRight, Stethoscope, Clock
} from 'lucide-react';

const LabResults: React.FC = () => {
  const [selectedResult, setSelectedResult] = useState<LabTestResult | null>(null);
  const [filterType, setFilterType] = useState<string>('All');
  const [labResults, setLabResults] = useState<LabTestResult[]>([]);
  const [loading, setLoading] = useState(true);

  const mockLabResults: LabTestResult[] = [
    {
      id: 'LAB-2026-001', patientId: 'P001', patientName: 'Vikram Mehta',
      testType: 'CBC (Complete Blood Count)', date: '2026-02-21', status: 'Normal',
      metrics: [
        { parameter: 'Hemoglobin', value: 14.2, unit: 'g/dL', range: '13.5 - 17.5', status: 'Normal' },
        { parameter: 'WBC Count', value: 7200, unit: '/µL', range: '4500 - 11000', status: 'Normal' },
        { parameter: 'Platelets', value: 210000, unit: '/µL', range: '150000 - 450000', status: 'Normal' }
      ],
      aiSummary: 'All values are within the normal physiological range. No signs of infection or anemia.'
    },
    {
      id: 'LAB-2026-002', patientId: 'P003', patientName: 'Rajesh Kumar',
      testType: 'Blood Sugar (Fasting)', date: '2026-02-22', status: 'Critical',
      criticalAlert: 'Extreme Hyperglycemia Detected',
      metrics: [{ parameter: 'Glucose', value: 245, unit: 'mg/dL', range: '70 - 100', status: 'Critical' }],
      aiSummary: 'Urgent intervention required. Fasting glucose level is significantly elevated, suggesting uncontrolled diabetes.'
    },
    {
      id: 'LAB-2026-003', patientId: 'P002', patientName: 'Anjali Sharma',
      testType: 'Lipid Profile', date: '2026-02-20', status: 'Abnormal',
      metrics: [
        { parameter: 'Total Cholesterol', value: 220, unit: 'mg/dL', range: '< 200', status: 'Abnormal' },
        { parameter: 'HDL (Good)', value: 45, unit: 'mg/dL', range: '> 40', status: 'Normal' },
        { parameter: 'LDL (Bad)', value: 160, unit: 'mg/dL', range: '< 100', status: 'Abnormal' }
      ],
      aiSummary: 'Patient exhibits hypercholesterolemia. Elevated LDL suggests cardiovascular risk. Dietary adjustments recommended.'
    }
  ];

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const data = await api.getLabOrders();
        if (data && data.length > 0) {
          const mapped: LabTestResult[] = data.map((order: any) => ({
            id: order.id,
            patientId: order.patient_id,
            patientName: order.patient_name || 'Unknown',
            testType: order.clinical_notes || 'Lab Order',
            date: order.ordered_at ? new Date(order.ordered_at).toISOString().split('T')[0] : '',
            status: order.results?.some((r: any) => r.is_flagged && r.flag_severity === 'Critical') ? 'Critical' :
              order.results?.some((r: any) => r.is_flagged) ? 'Abnormal' : 'Normal',
            metrics: (order.results || []).map((r: any) => ({
              parameter: r.test_name,
              value: parseFloat(r.result_value) || 0,
              unit: r.result_unit || '',
              range: r.normal_range || '',
              status: r.is_flagged ? (r.flag_severity === 'Critical' ? 'Critical' : 'Abnormal') : 'Normal'
            })),
            aiSummary: 'AI analysis pending for this result.'
          }));
          setLabResults(mapped);
        } else {
          setLabResults(mockLabResults);
        }
      } catch {
        setLabResults(mockLabResults);
      } finally {
        setLoading(false);
      }
    };
    fetchLabs();
  }, []);

  // Mock trend data for glucose
  const glucoseTrend = [
    { date: 'Feb 10', value: 180 },
    { date: 'Feb 14', value: 210 },
    { date: 'Feb 18', value: 195 },
    { date: 'Feb 22', value: 245 },
  ];

  const filteredResults = filterType === 'All'
    ? labResults
    : labResults.filter(r => r.status === filterType);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Normal': return 'bg-success/5 text-success border-success/10';
      case 'Abnormal': return 'bg-warning/5 text-warning border-warning/10';
      case 'Critical': return 'bg-danger/5 text-danger border-danger/10 animate-pulse font-black';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-2xl font-black text-text-main tracking-tight">Clinical Lab Results</h2>
          <p className="text-sm font-bold text-text-muted mt-1 font-kannada flex items-center gap-2">
            <span>“ನಿಖರ ರೋಗನಿರ್ಣಯ — ಜೀವ ಉಳಿಸುವ ಕೀಲಿಕೈ”</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>Precise diagnosis is the key to life.</span>
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-hospital-card rounded-xl p-1 shadow-sm border border-hospital-border">
            {['All', 'Normal', 'Abnormal', 'Critical'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filterType === t ? 'bg-primary/10 text-primary shadow-sm' : 'text-text-muted hover:bg-hospital-bg hover:text-text-body'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <button className="px-6 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-blue-700 transition-all flex items-center gap-2">
            <Download size={14} /> Export Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Results List */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <div className="bg-hospital-card rounded-2xl border border-hospital-border shadow-card overflow-hidden">
            <div className="p-5 border-b border-hospital-border bg-hospital-bg/50 flex justify-between items-center">
              <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                <Clock size={12} /> Recent Diagnostic Reports
              </h3>
              <span className="text-[10px] font-bold text-text-muted uppercase bg-white px-2 py-0.5 rounded border border-hospital-border">3 Total</span>
            </div>
            <div className="divide-y divide-hospital-border max-h-[700px] overflow-y-auto custom-scrollbar">
              {filteredResults.map(res => (
                <div
                  key={res.id}
                  onClick={() => setSelectedResult(res)}
                  className={`p-5 cursor-pointer transition-all hover:bg-hospital-bg border-l-4 ${selectedResult?.id === res.id ? 'bg-primary/5 border-primary' : 'border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-text-muted flex items-center gap-1.5">
                      <Calendar size={10} /> {res.date}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${getStatusStyle(res.status)}`}>
                      {res.status}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-text-main leading-none">{res.testType}</h4>
                  <p className="text-xs font-bold text-text-muted mt-1.5 flex items-center gap-1.5">
                    <Stethoscope size={12} /> {res.patientName} • {res.id}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Report Detail & AI Insights */}
        <div className="col-span-12 lg:col-span-7 space-y-8">
          {selectedResult ? (
            <div className="space-y-6 animate-in slide-in-from-right duration-500">
              {/* Parameter Table */}
              <div className="bg-hospital-card p-8 rounded-2xl border border-hospital-border shadow-card">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-text-main tracking-tight flex items-center gap-2">
                    <FlaskConical size={20} className="text-primary" /> Test Parameters
                  </h3>
                  {selectedResult.criticalAlert && (
                    <div className="bg-danger/10 text-danger px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse border border-danger/20 flex items-center gap-2">
                      <AlertOctagon size={12} /> {selectedResult.criticalAlert}
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-hospital-border">
                        <th className="pb-4">Parameter</th>
                        <th className="pb-4">Observed Value</th>
                        <th className="pb-4">Unit</th>
                        <th className="pb-4">Ref. Range</th>
                        <th className="pb-4 text-right">Acuity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hospital-border">
                      {selectedResult.metrics.map((m, i) => (
                        <tr key={i} className="group hover:bg-hospital-bg/50 transition-colors">
                          <td className="py-4 font-bold text-text-body text-sm pl-2">{m.parameter}</td>
                          <td className="py-4 font-black text-text-main text-base">{m.value}</td>
                          <td className="py-4 text-xs text-text-muted font-bold">{m.unit}</td>
                          <td className="py-4 text-xs text-text-muted font-medium">{m.range}</td>
                          <td className="py-4 text-right pr-2">
                            <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase inline-flex items-center gap-1 ${getStatusStyle(m.status)}`}>
                              {m.status === 'Normal' ? <CheckCircle2 size={10} /> : <AlertOctagon size={10} />}
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Trend Analytics (Visible for metabolic markers like Glucose) */}
              {selectedResult.testType.includes('Sugar') && (
                <div className="bg-hospital-card p-8 rounded-2xl border border-hospital-border shadow-card">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black text-text-main tracking-tight flex items-center gap-2">
                      <TrendingUp size={18} /> Longitudinal Trend
                    </h3>
                    <span className="text-[10px] font-black text-danger uppercase tracking-widest bg-danger/5 px-2 py-1 rounded border border-danger/10">Rising Acuity Warning</span>
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={glucoseTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                        />
                        <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* AI Clinical Summary */}
              <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl border border-slate-800">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent text-xl border border-accent/20">
                      <Microscope size={20} />
                    </div>
                    <h3 className="text-lg font-black text-white mt-1">AI Diagnostic Summary</h3>
                  </div>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed italic border-l-2 border-accent pl-4">
                    "{selectedResult.aiSummary}"
                  </p>
                  <div className="pt-4 flex gap-4 border-t border-white/5">
                    <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                      <Download size={14} /> Download PDF
                    </button>
                    <button className="flex-1 py-3 bg-accent text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20 transition-all flex items-center justify-center gap-2">
                      <Share2 size={14} /> Forward to Doctor
                    </button>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                    <p className="text-[10px] italic text-slate-400 font-kannada leading-relaxed text-center">
                      “ಡೇಟಾದಿಂದ ನಿರ್ಣಯಕ್ಕೆ” — Automated analysis based on clinical guidelines.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-48 bg-hospital-card rounded-2xl border border-hospital-border shadow-sm border-dashed">
              <div className="w-24 h-24 bg-hospital-bg rounded-full flex items-center justify-center text-text-muted opacity-30 mb-8">
                <FlaskConical size={32} />
              </div>
              <h3 className="text-xl font-black text-text-muted uppercase tracking-widest">Select Report to Review</h3>
              <p className="text-xs text-text-muted mt-2 font-bold uppercase tracking-widest">Awaiting selection from patient record pool</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabResults;
