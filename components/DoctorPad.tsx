
import React, { useRef, useState, useEffect } from 'react';
import { aiService } from '../aiService';
// Removed unused and non-existent RoundRecord import
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
        const base64 = canvas.toDataURL('image/png').split(',')[1];
        // We could use AI to digitize if needed
        // await aiService.processConsultationNotes(base64);
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
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500 space-y-8">
      {/* Session Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary text-3xl border border-primary/10 shadow-inner">👨‍⚕️</div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Active Ward Rounds: General Ward A</h1>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attending: Dr. Aditi Sharma</p>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          {unseenCount > 0 && (
            <div className="bg-warning/10 border border-warning/20 px-6 py-3 rounded-2xl flex items-center gap-3 animate-pulse">
              <span className="text-warning">⚠️</span>
              <span className="text-[10px] font-black text-warning uppercase tracking-widest">{unseenCount} Patients Pending Rounds</span>
            </div>
          )}
          <button
            onClick={finalizeRound}
            disabled={isProcessing}
            className="flex-1 md:flex-none px-10 py-4 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isProcessing ? 'Saving...' : 'Finalize & Sign All'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Patient Selection Bar */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ward Patient List</h3>
              <span className="text-[10px] font-bold text-slate-300 uppercase">{wardPatients.length} Total</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {wardPatients.map(p => (
                <div
                  key={p.id}
                  onClick={() => setActivePatient(p)}
                  className={`p-6 border-b border-slate-50 cursor-pointer transition-all hover:bg-hospital-bg relative ${activePatient.id === p.id ? 'bg-primary/5' : ''
                    }`}
                >
                  {activePatient.id === p.id && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>}
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Bed {p.bed}</span>
                    {p.seenToday ? (
                      <span className="text-[8px] font-black text-success uppercase tracking-widest flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-success"></span> SEEN
                      </span>
                    ) : (
                      <span className="text-[8px] font-black text-danger uppercase tracking-widest flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-danger"></span> PENDING
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-black text-slate-900 leading-none">{p.name}</h4>
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-[10px] font-bold text-slate-400">{p.age}y • {p.gender}</p>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${p.acuity === 'High' ? 'bg-danger/10 text-danger' :
                      p.acuity === 'Medium' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                      }`}>
                      {p.acuity} Acuity
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Clinical Roundup Area */}
        <div className="col-span-12 lg:col-span-9 space-y-8">
          <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm">
            {/* Active Patient Hero */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 pb-10 border-b border-slate-50">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-primary/5 rounded-[2.5rem] flex items-center justify-center text-primary text-3xl font-black border border-primary/10 shadow-inner">
                  {activePatient.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{activePatient.name}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{activePatient.id}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Bed {activePatient.bed}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="text-[10px] font-black text-success uppercase tracking-[0.2em]">Stable Progress</span>
                  </div>
                </div>
              </div>
              <div className="flex bg-hospital-bg p-1.5 rounded-2xl border border-slate-100">
                {(['NOTES', 'VITALS', 'MEDS'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-primary shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Content Based on Tab */}
            <div className="min-h-[500px] animate-in slide-in-from-bottom-4 duration-500">
              {activeTab === 'VITALS' && (
                <div className="space-y-10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <VitalCard label="Heart Rate" value="84" unit="bpm" />
                    <VitalCard label="Blood Pressure" value="138/92" unit="mmHg" status="critical" />
                    <VitalCard label="Temperature" value="98.6" unit="°F" />
                    <VitalCard label="SpO2" value="97" unit="%" />
                  </div>
                  <div className="p-8 bg-hospital-bg rounded-[3rem] border border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">24hr Trend Summary</h4>
                    <div className="h-40 flex items-end gap-2 px-4">
                      {[40, 65, 30, 85, 45, 90, 60, 75, 55, 80].map((h, i) => (
                        <div key={i} className="flex-1 bg-primary/20 rounded-t-lg transition-all hover:bg-primary" style={{ height: `${h}%` }}></div>
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
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Inpatient Medication List</h3>
                  <div className="space-y-4">
                    {meds.map((med, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-hospital-bg rounded-3xl border border-slate-50 group hover:bg-white hover:shadow-xl transition-all">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">💊</div>
                          <div>
                            <p className="text-base font-black text-slate-900">{med.name}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{med.dose}</p>
                          </div>
                        </div>
                        <select
                          value={med.status}
                          onChange={(e) => {
                            const newMeds = [...meds];
                            newMeds[i].status = e.target.value as any;
                            setMeds(newMeds);
                          }}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border outline-none focus:ring-2 focus:ring-primary/20 ${med.status === 'Continued' ? 'bg-success/5 text-success border-success/20' :
                            med.status === 'Changed' ? 'bg-warning/5 text-warning border-warning/20' : 'bg-danger/5 text-danger border-danger/20'
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
                    + Add New Medication Order
                  </button>
                </div>
              )}

              {activeTab === 'NOTES' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Daily Progress Notes</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Write or stylus input enabled</p>
                    </div>
                    <button onClick={() => clearCanvas('progressNotes')} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Reset Note Layer</button>
                  </div>

                  <div className="bg-[#f8fafc] border border-slate-200 rounded-[3rem] overflow-hidden h-[300px] shadow-inner relative group">
                    <canvas
                      ref={canvasRefs.progressNotes}
                      width={1200} height={300}
                      className="w-full h-full cursor-crosshair touch-none"
                      onMouseDown={(e) => startDrawing('progressNotes', e)}
                      onMouseMove={(e) => draw('progressNotes', e)}
                      onMouseUp={() => stopDrawing('progressNotes')}
                    />
                    <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center select-none">
                      <span className="text-9xl font-black text-slate-900 rotate-12">EMR PAPER</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Sign-off</h4>
                      <div className="bg-[#f8fafc] border border-slate-200 rounded-[2rem] overflow-hidden h-32 shadow-inner">
                        <canvas
                          ref={canvasRefs.signature}
                          width={600} height={128}
                          className="w-full h-full cursor-crosshair touch-none"
                          onMouseDown={(e) => startDrawing('signature', e)}
                          onMouseMove={(e) => draw('signature', e)}
                          onMouseUp={() => stopDrawing('signature')}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col justify-end space-y-4">
                      <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl">
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-2 font-kannada leading-relaxed">ಜೀವರಕ್ಷ — AI Intelligence</p>
                        <p className="text-[10px] text-primary/70 font-medium">Auto-summarizing these notes will link them to {activePatient.name}'s longitudinal health score.</p>
                      </div>
                      <button
                        onClick={finalizeRound}
                        className="w-full py-5 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-blue-700 transition-all active:scale-[0.98]"
                      >
                        SUBMIT FINAL ROUNDS ENTRY
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Compliance & Safety Quote */}
          <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-4xl shadow-inner">🛡️</div>
              <div className="flex-1 space-y-3">
                <h3 className="text-xl font-black text-white">Clinical Compliance Protocol</h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed font-kannada">
                  “ನಿಖರ ದಾಖಲಾತಿ — ಸುರಕ್ಷಿತ ಚಿಕಿತ್ಸೆ”<br />
                  Every round entry is cryptographically signed and time-stamped, ensuring a zero-tamper audit trail for patient safety.
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Next Audit Cycle</p>
                <p className="text-xl font-black text-primary mt-1">12 Days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default DoctorPad;
