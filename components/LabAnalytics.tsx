
import React, { useState } from 'react';
import { aiService } from '../aiService';
import {
  Bot, Microscope, Upload, FileText, Activity,
  Sparkles, AlertTriangle, CheckCircle2, Download,
  Share2, ArrowRight
} from 'lucide-react';

const LabAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleReportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const result = await aiService.analyzeLabReport(base64);
        setAnalysis(result);
      } catch (err) {
        alert("Failed to analyze report.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-text-main tracking-tight">AI Diagnostic Analytics</h2>
          <p className="text-sm font-medium text-text-muted mt-1">Automated summary of clinical findings and longitudinal health tracking.</p>
        </div>
        <div className="flex gap-4">
          <input type="file" id="lab-report" className="hidden" onChange={handleReportUpload} />
          <label
            htmlFor="lab-report"
            className="bg-primary text-white px-6 py-3 rounded-xl font-black text-sm cursor-pointer hover:bg-blue-700 shadow-xl shadow-primary/20 transition-all flex items-center gap-2 active:scale-95 border border-primary/20"
          >
            {loading ? <><Bot size={18} className="animate-pulse" /> AI Processing...</> : <><Upload size={18} /> Upload New Lab Report</>}
          </label>
        </div>
      </div>

      {!analysis && !loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-hospital-card rounded-2xl border border-hospital-border shadow-sm border-dashed">
          <div className="w-20 h-20 bg-hospital-bg rounded-full flex items-center justify-center text-text-muted opacity-40 mb-6">
            <Microscope size={32} />
          </div>
          <p className="text-base font-bold text-text-muted">Awaiting Lab Results for Processing</p>
          <p className="text-xs text-text-muted mt-1 uppercase tracking-widest font-black">Upload a digital or scanned report to begin</p>
        </div>
      ) : analysis ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Health Score Card */}
          <div className="bg-hospital-card p-8 rounded-2xl border border-hospital-border shadow-card flex flex-col items-center text-center">
            <h3 className="font-black text-text-main mb-8 self-start tracking-tight flex items-center gap-2">
              <Activity size={20} className="text-primary" /> Health Index Score
            </h3>
            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="112" cy="112" r="100" stroke="#f1f5f9" strokeWidth="20" fill="transparent" />
                <circle
                  cx="112" cy="112" r="100"
                  stroke={analysis.healthScore > 70 ? '#22c55e' : analysis.healthScore > 40 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="20"
                  fill="transparent"
                  strokeDasharray={628}
                  strokeDashoffset={628 - (628 * analysis.healthScore) / 100}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-black text-text-main tracking-tighter">{analysis.healthScore}</span>
                <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mt-2">Score Index</span>
              </div>
            </div>
            <div className={`mt-10 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest border flex items-center gap-2 ${analysis.riskLevel === 'Low' ? 'bg-success/5 text-success border-success/20' :
              analysis.riskLevel === 'Moderate' ? 'bg-warning/5 text-warning border-warning/20' : 'bg-danger/5 text-danger border-danger/20'
              }`}>
              {analysis.riskLevel === 'Low' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
              {analysis.riskLevel} Risk Profile Identified
            </div>
          </div>

          {/* AI Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-hospital-card p-8 rounded-2xl border border-hospital-border shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 bg-primary/5 rounded-bl-3xl text-primary">
                <Sparkles size={24} />
              </div>
              <h3 className="font-black text-text-main mb-6 flex items-center gap-2">
                <Bot size={20} className="text-primary" /> Clinical AI Summary
              </h3>
              <p className="text-text-body text-base leading-relaxed font-medium italic border-l-4 border-primary/20 pl-4 py-1">
                "{analysis.summary}"
              </p>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-danger/5 rounded-xl border border-danger/10">
                  <h4 className="text-[10px] font-black text-danger uppercase tracking-widest mb-4 flex items-center gap-2">
                    <AlertTriangle size={12} /> Critical Abnormalities
                  </h4>
                  <ul className="space-y-3">
                    {analysis.abnormalFindings?.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-xs text-danger font-bold leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0 mt-1.5"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6 bg-success/5 rounded-xl border border-success/10">
                  <h4 className="text-[10px] font-black text-success uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CheckCircle2 size={12} /> Recommended Care Pathway
                  </h4>
                  <ul className="space-y-3">
                    {analysis.recommendations?.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-xs text-text-main font-bold leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0 mt-1.5"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 bg-white border border-slate-200 py-4 rounded-xl font-black text-sm text-slate-600 hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                <Download size={16} /> Download Analysis Report
              </button>
              <button className="flex-1 bg-primary text-white py-4 rounded-xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-2">
                <Share2 size={16} /> Push to Patient EMR <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-6 font-black text-text-muted uppercase tracking-widest text-xs">AI Insight Engine Working...</p>
        </div>
      )}
    </div>
  );
};

export default LabAnalytics;
