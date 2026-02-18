
import React, { useState } from 'react';
import { aiService } from '../aiService';

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
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">AI Diagnostic Analytics</h2>
          <p className="text-sm font-medium text-slate-500">Automated summary of clinical findings and longitudinal health tracking.</p>
        </div>
        <div className="flex gap-4">
          <input type="file" id="lab-report" className="hidden" onChange={handleReportUpload} />
          <label
            htmlFor="lab-report"
            className="bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-sm cursor-pointer hover:bg-blue-700 shadow-xl shadow-primary/20 transition-all flex items-center gap-2 active:scale-95"
          >
            {loading ? '🤖 AI Processing...' : '🔬 Upload New Lab Report'}
          </label>
        </div>
      </div>

      {!analysis && !loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm border-dashed">
          <div className="w-20 h-20 bg-hospital-bg rounded-full flex items-center justify-center text-4xl mb-6 grayscale opacity-40">🔬</div>
          <p className="text-base font-bold text-slate-400">Awaiting Lab Results for Processing</p>
          <p className="text-xs text-slate-300 mt-1 uppercase tracking-widest font-black">Upload a digital or scanned report to begin</p>
        </div>
      ) : analysis ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Health Score Card */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col items-center text-center">
            <h3 className="font-black text-slate-800 mb-10 self-start tracking-tight">Health Index Score</h3>
            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="112" cy="112" r="100" stroke="#f1f5f9" strokeWidth="20" fill="transparent" />
                <circle
                  cx="112" cy="112" r="100"
                  stroke={analysis.healthScore > 70 ? '#2E7D32' : analysis.healthScore > 40 ? '#FFB300' : '#D32F2F'}
                  strokeWidth="20"
                  fill="transparent"
                  strokeDasharray={628}
                  strokeDashoffset={628 - (628 * analysis.healthScore) / 100}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-black text-slate-800 tracking-tighter">{analysis.healthScore}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Score Index</span>
              </div>
            </div>
            <div className={`mt-10 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest border ${analysis.riskLevel === 'Low' ? 'bg-success/5 text-success border-success/20' :
              analysis.riskLevel === 'Moderate' ? 'bg-warning/5 text-warning border-warning/20' : 'bg-danger/5 text-danger border-danger/20'
              }`}>
              {analysis.riskLevel} Risk Profile Identified
            </div>
          </div>

          {/* AI Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 bg-primary/5 rounded-bl-3xl">
                <span className="text-xl">✨</span>
              </div>
              <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">Clinical AI Summary</h3>
              <p className="text-slate-600 text-base leading-relaxed font-medium italic">
                "{analysis.summary}"
              </p>

              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 bg-danger/5 rounded-3xl border border-danger/10">
                  <h4 className="text-[10px] font-black text-danger uppercase tracking-widest mb-4">Critical Abnormalities</h4>
                  <ul className="space-y-3">
                    {analysis.abnormalFindings?.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-xs text-danger font-bold leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0 mt-1"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6 bg-success/5 rounded-3xl border border-success/10">
                  <h4 className="text-[10px] font-black text-success uppercase tracking-widest mb-4">Recommended Care Pathway</h4>
                  <ul className="space-y-3">
                    {analysis.recommendations?.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-xs text-slate-700 font-bold leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0 mt-1"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 bg-white border border-slate-200 py-4 rounded-2xl font-black text-sm text-slate-600 hover:bg-slate-50 transition-all active:scale-95">Download Analysis Report</button>
              <button className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-primary/20 active:scale-95">Push to Patient EMR</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-6 font-black text-slate-400 uppercase tracking-widest text-xs">AI Insight Engine Working...</p>
        </div>
      )}
    </div>
  );
};

export default LabAnalytics;
