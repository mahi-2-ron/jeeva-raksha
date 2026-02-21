
import React, { useState, useEffect } from 'react';
import { RadiologyResult } from '../types';
import { aiService } from '../aiService';
import api from '../apiClient';
import {
  Search, Upload, FileText, Calendar, User,
  BrainCircuit, Sparkles, Image as ImageIcon,
  ZoomIn, Box, ChevronRight, CheckCircle2,
  AlertTriangle, Scan
} from 'lucide-react';

const RadiologyResults: React.FC = () => {
  const [selectedResult, setSelectedResult] = useState<RadiologyResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [results, setResults] = useState<RadiologyResult[]>([
    {
      id: 'RAD-2026-001',
      patientId: 'P001',
      patientName: 'Vikram Mehta',
      modality: 'CT',
      studyDescription: 'CT Thorax w/ Contrast',
      date: '2026-02-21',
      radiologist: 'Dr. Sanjay Kapoor',
      report: 'Examination of the chest shows normal cardiac size. Lung fields are clear of any acute focal consolidations. No pleural effusion or pneumothorax identified. Hilar and mediastinal structures appear normal for age.',
      keyFindings: [
        'No acute pulmonary process.',
        'Normal cardiac silhouette.',
        'Intact bony structures of the thorax.'
      ],
      aiSummary: 'Clinical appearance suggests a healthy respiratory system with no significant pathological deviations in the thoracic cavity.',
      imageUrls: [
        'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=801&q=80'
      ],
      status: 'Finalized'
    },
    {
      id: 'RAD-2026-002',
      patientId: 'P003',
      patientName: 'Rajesh Kumar',
      modality: 'X-Ray',
      studyDescription: 'Chest AP View',
      date: '2026-02-22',
      radiologist: 'Dr. Priya Das',
      report: 'Frontal view of the chest demonstrates mildly increased bronchovascular markings. Heart size is at the upper limit of normal. No evidence of pulmonary edema. Trace bilateral pleural thickening noted.',
      keyFindings: [
        'Borderline cardiomegaly.',
        'Increased bronchovascular markings suggestive of chronic changes.',
        'No acute infiltrate.'
      ],
      imageUrls: [
        'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80'
      ],
      status: 'Draft'
    }
  ]);

  useEffect(() => {
    const enrichWithPatients = async () => {
      try {
        const patients = await api.getPatients();
        if (patients && patients.length > 0) {
          setResults(prev => prev.map((res, idx) => ({
            ...res,
            patientName: patients[idx % patients.length]?.name || res.patientName,
            patientId: patients[idx % patients.length]?.uhid || res.patientId,
          })));
        }
      } catch { /* keep mock data */ }
    };
    enrichWithPatients();
  }, []);

  const handleAIAnalyze = async () => {
    if (!selectedResult) return;
    setIsAnalyzing(true);
    try {
      // Analyze the image using the AI service
      const aiResponse = await aiService.analyzeRadiologyScan(selectedResult.imageUrls[0], selectedResult.modality);
      setSelectedResult({
        ...selectedResult,
        aiSummary: aiResponse.aiSummary,
        keyFindings: [...selectedResult.keyFindings, ...aiResponse.keyObservations]
      });
    } catch (err) {
      console.error(err);
      alert("AI analysis failed. Please try again later.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`Study "${file.name}" received. In a production environment, this would be uploaded to the PACS server for processing.`);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500 space-y-8 p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-2xl font-black text-text-main tracking-tight">Radiology Command Center</h2>
          <p className="text-sm font-bold text-text-muted mt-1 font-kannada flex items-center gap-2">
            <span>“ನಿಖರ ರೋಗನಿರ್ಣಯ — ಉತ್ತಮ ಚಿಕಿತ್ಸೆ”</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>Precise imaging for better care.</span>
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <input type="text" placeholder="Search Studies..." className="bg-hospital-input border border-hospital-border rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 shadow-sm w-64 text-text-main" />
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          </div>

          <input type="file" id="dicom-upload" className="hidden" onChange={handleFileUpload} />
          <label
            htmlFor="dicom-upload"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <Upload size={14} /> DICOM Upload
          </label>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Results List */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-hospital-card rounded-2xl border border-hospital-border shadow-card overflow-hidden">
            <div className="p-5 border-b border-hospital-border bg-hospital-bg/50 flex justify-between items-center">
              <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                <FileText size={14} /> Completed Imaging Studies
              </h3>
              <span className="text-[10px] font-bold text-text-muted uppercase bg-white px-2 py-0.5 rounded border border-hospital-border">{results.length} Total</span>
            </div>
            <div className="divide-y divide-hospital-border">
              {results.map(res => (
                <div
                  key={res.id}
                  onClick={() => {
                    setSelectedResult(res);
                    setActiveImageIndex(0);
                  }}
                  className={`p-5 cursor-pointer transition-all hover:bg-hospital-bg border-l-4 ${selectedResult?.id === res.id ? 'bg-primary/5 border-primary' : 'border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-text-muted flex items-center gap-1.5">
                      <Calendar size={10} /> {res.date}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${res.status === 'Finalized' ? 'bg-success/5 text-success border border-success/10' : 'bg-warning/5 text-warning border border-warning/10'}`}>
                      {res.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-text-main leading-snug">{res.modality} - {res.studyDescription}</h4>
                  <p className="text-xs font-bold text-text-muted mt-1 flex items-center gap-1.5">
                    <User size={10} /> {res.patientName}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Study Viewer */}
        <div className="col-span-12 lg:col-span-8">
          {selectedResult ? (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <div className="bg-hospital-card p-8 rounded-2xl border border-hospital-border shadow-card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="aspect-square bg-black rounded-2xl overflow-hidden relative shadow-md group">
                      <img
                        src={selectedResult.imageUrls[activeImageIndex]}
                        alt="Radiology Scan"
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-black/50 p-2 rounded-full backdrop-blur-sm">
                          <ZoomIn size={24} className="text-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2">
                        {selectedResult.imageUrls.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImageIndex(i)}
                            className={`w-2 h-2 rounded-full transition-all ${activeImageIndex === i ? 'bg-white w-6' : 'bg-white/30'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button className="flex-1 py-2.5 bg-hospital-bg border border-hospital-border rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:bg-white hover:shadow-sm transition-all flex items-center justify-center gap-2">
                        <Sparkles size={14} /> Enhance Contrast
                      </button>
                      <button className="flex-1 py-2.5 bg-hospital-bg border border-hospital-border rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:bg-white hover:shadow-sm transition-all flex items-center justify-center gap-2">
                        <Box size={14} /> 3D Reconstruction
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-black text-text-main tracking-tight mb-2 flex items-center gap-2">
                        <FileText size={18} className="text-primary" /> Radiologist Report
                      </h3>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                        <User size={10} /> Interpreted by {selectedResult.radiologist}
                      </p>
                    </div>
                    <p className="text-sm text-text-body leading-relaxed font-medium bg-hospital-bg p-5 rounded-xl border border-hospital-border">
                      {selectedResult.report}
                    </p>
                    <div>
                      <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                        <CheckCircle2 size={12} /> Key Findings
                      </h4>
                      <ul className="space-y-2">
                        {selectedResult.keyFindings.map((finding, i) => (
                          <li key={i} className="flex items-start gap-3 text-xs text-text-main font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl border border-slate-800">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary text-xl border border-primary/30">
                        <BrainCircuit size={20} />
                      </div>
                      <h3 className="text-lg font-black text-white mt-1">Clinical AI Assistant</h3>
                    </div>
                    <button
                      onClick={handleAIAnalyze}
                      disabled={isAnalyzing}
                      className="px-5 py-2 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                      {isAnalyzing ? <><Sparkles size={14} className="animate-spin" /> Analyzing...</> : <><Sparkles size={14} /> Run Deep Diagnosis</>}
                    </button>
                  </div>

                  {selectedResult.aiSummary ? (
                    <div className="p-5 bg-white/5 border border-white/5 rounded-xl animate-in fade-in zoom-in duration-500">
                      <p className="text-sm text-slate-300 font-medium leading-relaxed italic">
                        "{selectedResult.aiSummary}"
                      </p>
                    </div>
                  ) : (
                    <div className="p-5 border border-white/5 border-dashed rounded-xl text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI insights not yet generated for this study</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 bg-hospital-card rounded-2xl border border-hospital-border shadow-sm border-dashed">
              <div className="w-20 h-20 bg-hospital-bg rounded-full flex items-center justify-center text-text-muted opacity-30 mb-6">
                <ImageIcon size={32} />
              </div>
              <h3 className="text-sm font-black text-text-muted uppercase tracking-widest">Select Study to View</h3>
              <p className="text-xs text-text-muted mt-2 font-bold uppercase tracking-widest">Awaiting selection from imaging pool</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RadiologyResults;
