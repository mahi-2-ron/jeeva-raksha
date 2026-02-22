import React, { useRef, useState, useEffect } from 'react';
import { aiService } from '../aiService';
import { WardPatient } from '../types';
import api from '../apiClient';

const DoctorPad: React.FC = () => {
  // State for Ward and Selected Patient
  const [wardPatients, setWardPatients] = useState<WardPatient[]>([
    { id: 'P101', bed: 'A-12', name: 'Vikram Mehta', age: 42, gender: 'M', acuity: 'High', lastSeen: '2026-02-23T10:00:00Z', seenToday: true },
    { id: 'P102', bed: 'A-14', name: 'Suresh Raina', age: 29, gender: 'M', acuity: 'Low', lastSeen: '2026-02-22T18:30:00Z', seenToday: false },
    { id: 'P103', bed: 'A-15', name: 'Meena Kumari', age: 64, gender: 'F', acuity: 'Medium', lastSeen: '2026-02-22T09:00:00Z', seenToday: false },
    { id: 'P104', bed: 'B-02', name: 'Anjali Sharma', age: 34, gender: 'F', acuity: 'Medium', lastSeen: '2026-02-23T08:15:00Z', seenToday: true },
  ]);

  useEffect(() => {
    const fetchWardPatients = async () => {
      try {
        const patients = await api.getPatients();
        if (patients && patients.length > 0) {
          const dbPatients: WardPatient[] = patients.slice(0, 6).map((p: any, idx: number) => ({
            id: p.uhid || p.id,
            bed: `A-${(idx + 10).toString()}`,
            name: p.name,
            age: p.date_of_birth ? Math.floor((Date.now() - new Date(p.date_of_birth).getTime()) / 31557600000) : 0,
            gender: p.gender?.charAt(0) || '?',
            acuity: (['High', 'Medium', 'Low'] as const)[idx % 3],
            lastSeen: p.updated_at || new Date().toISOString(),
            seenToday: idx % 2 === 0,
          }));
          setWardPatients(dbPatients);
        }
      } catch { /* fallback to mock */ }
    };
    fetchWardPatients();
  }, []);

  const [activePatient, setActivePatient] = useState<WardPatient>(wardPatients[1]); // Starting with an "unseen" patient

  // Canvas Refs for Stylus Integration
  const canvasRefs = {
    progressNotes: useRef<HTMLCanvasElement>(null),
    signature: useRef<HTMLCanvasElement>(null)
  };

  const [isDrawing, setIsDrawing] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'NOTES' | 'VITALS' | 'MEDS'>('NOTES');

  // Medications state for the active patient
  const [meds, setMeds] = useState([
    { name: 'Ceftriaxone', dose: '1g IV BD', status: 'Continued' },
    { name: 'Pantoprazole', dose: '40mg IV OD', status: 'Continued' },
    { name: 'Paracetamol', dose: '650mg SOS', status: 'Continued' }
  ]);

  useEffect(() => {
    Object.values(canvasRefs).forEach(ref => {
      const canvas = ref.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    });
  }, [activePatient, activeTab]);

  const startDrawing = (key: string, e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(key);
    draw(key, e);
  };

  const draw = (key: string, e: React.MouseEvent | React.TouchEvent) => {
    if (isDrawing !== key) return;
    const canvas = (canvasRefs as any)[key].current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (('touches' in e) ? e.touches[0].clientX : (e as React.MouseEvent).clientX) - rect.left;
    const y = (('touches' in e) ? e.touches[0].clientY : (e as React.MouseEvent).clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = (key: string) => {
    setIsDrawing(null);
    const ctx = (canvasRefs as any)[key].current?.getContext('2d');
    ctx?.beginPath();
  };

  const clearCanvas = (key: string) => {
    const canvas = (canvasRefs as any)[key].current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const finalizeRound = async () => {
    setIsProcessing(true);
    try {
      // Logic for saving round data
      const canvas = canvasRefs.progressNotes.current;
      if (canvas) {
        // const base64 = canvas.toDataURL('image/png').split(',')[1];
      }

      // Update local state to show patient as "seen"
      setWardPatients(prev => prev.map(p =>
        p.id === activePatient.id ? { ...p, seenToday: true, lastSeen: new Date().toISOString() } : p
      ));

      alert(`Round finalized for ${activePatient.name}. EMR updated.`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const VitalCard = ({ label, value, unit, status }: any) => (
    <div className={`p-5 rounded-3xl border transition-all ${status === 'critical' ? 'bg-danger/5 border-danger/20' : 'bg-hospital-bg border-slate-100 hover:shadow-md'
      }`}>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-xl font-black ${status === 'critical' ? 'text-danger' : 'text-slate-900'}`}>{value}</span>
        <span className="text-[10px] font-bold text-slate-400">{unit}</span>
      </div>
    </div>
  );

  const unseenCount = wardPatients.filter(p => !p.seenToday).length;

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700 space-y-6 md:space-y-10 p-4 md:p-8 pb-32 md:pb-8">
      {/* Session Header - Responsive */}
      <div className="bg-medical-gradient p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] text-white relative overflow-hidden shadow-2xl border border-white/20">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 relative z-10">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="h-16 w-16 md:h-24 md:w-24 bg-white/10 backdrop-blur-xl rounded-2xl md:rounded-[2.5rem] flex items-center justify-center text-3xl md:text-5xl border border-white/20 shadow-2xl shrink-0"></div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="px-3 py-1 bg-emerald-500 rounded-full text-[8px] md:text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20">Live Session</div>
                {unseenCount > 0 && (
                  <div className="bg-warning/20 border border-warning/30 px-3 py-1 rounded-full flex items-center gap-1.5 md:hidden">
                    <span className="text-[8px] font-black text-warning uppercase">{unseenCount} PENDING</span>
                  </div>
                )}
              </div>
              <h1 className="text-xl md:text-4xl font-black text-white tracking-tighter leading-tight">General Ward Rounds: Suite A</h1>
              <div className="flex items-center gap-3 mt-2 opacity-80">
                <p className="text-[9px] md:text-[11px] font-black uppercase tracking-wider truncate">Dr. Aditi Sharma</p>
                <span className="w-1 h-1 rounded-full bg-white/40"></span>
                <p className="text-[9px] md:text-[11px] font-black uppercase tracking-wider">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex gap-4">
            {unseenCount > 0 && (
              <div className="bg-warning/10 border border-warning/20 px-6 py-3 rounded-2xl flex items-center gap-3 animate-pulse">
                <span className="text-warning"></span>
                <span className="text-[10px] font-black text-warning uppercase tracking-widest">{unseenCount} Patients Pending Rounds</span>
              </div>
            )}
            <button
              onClick={finalizeRound}
              disabled={isProcessing}
              className="px-8 py-4 bg-white text-primary rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {isProcessing ? 'Saving...' : 'Finalize & Sign All'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 md:gap-8 relative">
        {/* Patient Selection List - Mobile Header for current selection */}
        <div className="col-span-12 md:hidden">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center group active:scale-[0.98] transition-all" onClick={() => setIsDetailOpen(true)}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-primary/20">
                {activePatient.bed}
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Roundup</p>
                <h4 className="text-lg font-black text-slate-900 leading-none">{activePatient.name}</h4>
              </div>
            </div>
            <div className="bg-primary/5 p-3 rounded-full text-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Patient Selection Bar - Grid/Sidebar */}
        <div className={`col-span-12 lg:col-span-3 space-y-6 md:block ${isDetailOpen ? 'hidden md:block' : 'block'}`}>
          <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:h-[calc(100vh-280px)]">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ward Patients</h3>
              <span className="text-[10px] font-black text-primary bg-primary/5 px-2.5 py-1 rounded-full uppercase">{wardPatients.length} TOTAL</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {wardPatients.map(p => (
                <div
                  key={p.id}
                  onClick={() => { setActivePatient(p); if (window.innerWidth < 768) setIsDetailOpen(true); }}
                  className={`p-6 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 relative group ${activePatient.id === p.id ? 'bg-primary/5' : ''
                    }`}
                >
                  {activePatient.id === p.id && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>}
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.1em]">Bed {p.bed}</span>
                    <span className={`text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 ${p.seenToday ? 'text-success' : 'text-danger'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.seenToday ? 'bg-success' : 'bg-danger animate-pulse'}`}></span>
                      {p.seenToday ? 'SEEN' : 'PENDING'}
                    </span>
                  </div>
                  <h4 className="text-base md:text-lg font-black text-slate-900 group-hover:text-primary transition-colors">{p.name}</h4>
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-[10px] font-bold text-slate-400">{p.age}y • {p.gender}</p>
                    <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase ${p.acuity === 'High' ? 'bg-danger/10 text-danger' :
                      p.acuity === 'Medium' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                      }`}>
                      {p.acuity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Clinical Roundup Area - Responsive View */}
        <div className={`col-span-12 lg:col-span-9 space-y-8 fixed md:relative inset-0 z-[60] md:z-auto transition-all duration-500 ease-in-out md:block ${isDetailOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 md:translate-y-0 md:opacity-100'
          }`}>
          {/* Mobile Overlay/Scrim */}
          {isDetailOpen && <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm md:hidden" onClick={() => setIsDetailOpen(false)} />}

          <div className="absolute bottom-0 md:relative bg-white pt-6 md:p-10 rounded-t-[3rem] md:rounded-[4rem] border border-slate-100 shadow-2xl md:shadow-sm w-full h-[90vh] md:h-auto overflow-hidden flex flex-col">
            {/* Mobile Drawer Handle */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 md:hidden shrink-0" onClick={() => setIsDetailOpen(false)} />

            <div className="flex-1 overflow-y-auto px-6 md:px-0">
              {/* Active Patient Hero */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-8 border-b border-slate-50">
                <div className="flex items-center gap-5 md:gap-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/5 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center text-primary text-2xl md:text-3xl font-black border border-primary/10">
                    {activePatient.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{activePatient.name}</h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">{activePatient.id}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Bed {activePatient.bed}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></span>
                      <span className="text-[10px] font-black text-success uppercase tracking-widest">Stable</span>
                    </div>
                  </div>
                </div>

                {/* Horizontally Scrollable Tabs */}
                <div className="w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
                  <div className="flex bg-hospital-bg p-1 rounded-2xl border border-slate-100 min-w-max">
                    {(['NOTES', 'VITALS', 'MEDS'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-primary shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
                          }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Content Based on Tab */}
              <div className="min-h-[400px] md:min-h-[500px] animate-in fade-in duration-300">
                {activeTab === 'VITALS' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                      <VitalCard label="Heart Rate" value="84" unit="bpm" />
                      <VitalCard label="Blood Pressure" value="138/92" unit="mmHg" status="critical" />
                      <VitalCard label="Temp" value="98.6" unit="°F" />
                      <VitalCard label="SpO2" value="97" unit="%" />
                    </div>
                    <div className="p-6 md:p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6">24hr Trend Summary</h4>
                      <div className="h-32 md:h-40 flex items-end gap-1.5 md:gap-2 px-2">
                        {[40, 65, 30, 85, 45, 90, 60, 75, 55, 80].map((h, i) => (
                          <div key={i} className="flex-1 bg-primary/20 rounded-t-md md:rounded-t-lg transition-all hover:bg-primary" style={{ height: `${h}%` }}></div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-4 px-2 text-[8px] font-black text-slate-300 uppercase tracking-widest">
                        <span>08:00 AM</span>
                        <span>08:00 PM</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'MEDS' && (
                  <div className="space-y-6">
                    <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Active Inpatient Medications</h3>
                    <div className="space-y-4">
                      {meds.map((med, i) => (
                        <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 md:p-6 bg-slate-50 rounded-3xl border border-slate-50 group hover:bg-white hover:shadow-xl transition-all gap-4">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0"></div>
                            <div>
                              <p className="text-base font-black text-slate-900 leading-tight">{med.name}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">{med.dose}</p>
                            </div>
                          </div>
                          <select
                            value={med.status}
                            onChange={(e) => {
                              const newMeds = [...meds];
                              newMeds[i].status = e.target.value as any;
                              setMeds(newMeds);
                            }}
                            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border outline-none cursor-pointer ${med.status === 'Continued' ? 'bg-success text-white border-success' :
                              med.status === 'Changed' ? 'bg-warning text-white border-warning' : 'bg-danger text-white border-danger'
                              }`}
                          >
                            <option value="Continued">Continued</option>
                            <option value="Changed">Changed</option>
                            <option value="Stopped">Stopped</option>
                          </select>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-5 border-2 border-dashed border-slate-200 rounded-3xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-primary hover:text-primary transition-all">
                      + Add New Order
                    </button>
                  </div>
                )}

                {activeTab === 'NOTES' && (
                  <div className="space-y-8 pb-10">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Progress Notes</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Stylus Input Enabled</p>
                      </div>
                      <button onClick={() => clearCanvas('progressNotes')} className="text-[9px] font-black text-primary uppercase tracking-widest p-2">Reset Layer</button>
                    </div>

                    <div className="bg-[#f8fafc] border border-slate-200 rounded-[2.5rem] overflow-hidden h-[250px] md:h-[300px] shadow-inner relative group touch-none">
                      <canvas
                        ref={canvasRefs.progressNotes}
                        width={1200} height={300}
                        className="w-full h-full cursor-crosshair"
                        onMouseDown={(e) => startDrawing('progressNotes', e)}
                        onMouseMove={(e) => draw('progressNotes', e)}
                        onMouseUp={() => stopDrawing('progressNotes')}
                        onTouchStart={(e) => startDrawing('progressNotes', e)}
                        onTouchMove={(e) => draw('progressNotes', e)}
                        onTouchEnd={() => stopDrawing('progressNotes')}
                      />
                      <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center select-none text-4xl md:text-9xl font-black text-slate-900 rotate-12">EMR PAPER</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Signature</h4>
                        <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl md:rounded-[2rem] overflow-hidden h-32 shadow-inner touch-none">
                          <canvas
                            ref={canvasRefs.signature}
                            width={600} height={128}
                            className="w-full h-full cursor-crosshair"
                            onMouseDown={(e) => startDrawing('signature', e)}
                            onMouseMove={(e) => draw('signature', e)}
                            onMouseUp={() => stopDrawing('signature')}
                            onTouchStart={(e) => startDrawing('signature', e)}
                            onTouchMove={(e) => draw('signature', e)}
                            onTouchEnd={() => stopDrawing('signature')}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col justify-end gap-4">
                        <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl hidden md:block">
                          <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">AI Recommendation</p>
                          <p className="text-[10px] text-primary/70 font-medium">Verify vitals after medication change.</p>
                        </div>
                        <button
                          onClick={finalizeRound}
                          className="w-full py-5 bg-medical-gradient text-white rounded-[1.5rem] md:rounded-[2rem] font-black text-xs uppercase tracking-[0.15em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          Submit Entry
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile Finalize */}
      <div className="fixed bottom-8 right-6 z-[100] md:hidden">
        <button
          onClick={finalizeRound}
          disabled={isProcessing}
          className="w-16 h-16 bg-medical-gradient rounded-full shadow-2xl flex items-center justify-center text-white border-4 border-white active:scale-90 transition-all"
        >
          {isProcessing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
        </button>
      </div>

      {/* Stylized Quote - Compact on Mobile */}
      <div className="bg-primary rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-32 md:w-48 h-32 md:h-48 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-3xl md:text-4xl shadow-inner shrink-0"></div>
          <div className="flex-1 space-y-2 md:space-y-3 text-center md:text-left">
            <h3 className="text-lg md:text-xl font-black">Clinical Compliance Protocol</h3>
            <p className="text-[11px] md:text-sm text-white/80 font-medium leading-relaxed font-kannada px-2 md:px-0">
              “ನಿಖರ ದಾಖಲಾತಿ — ಸುರಕ್ಷಿತ ಚಿಕಿತ್ಸೆ”<br className="hidden md:block" />
              Cryptographically signed time-stamped rounds for zero-tamper safety.
            </p>
          </div>
          <div className="hidden md:block text-right shrink-0">
            <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Next Audit</p>
            <p className="text-xl font-black mt-1">12 Days</p>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default DoctorPad;
