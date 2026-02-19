
import React, { useState, useEffect } from 'react';
import { WardPatient } from '../types';
import api from '../apiClient';
import {
   Bed, Activity, Heart, Thermometer, Wind,
   User, Stethoscope, ClipboardList, AlertCircle,
   CheckCircle2, Clock, BrainCircuit, ChevronRight,
   Droplet, Pill, Syringe
} from 'lucide-react';

const IPDManagement: React.FC = () => {
   const [activeWard, setActiveWard] = useState<string>('General Ward A');
   const [selectedPatient, setSelectedPatient] = useState<WardPatient | null>(null);

   const mockWardPatients: WardPatient[] = [
      {
         id: 'P101',
         bed: 'A-12',
         name: 'Vikram Mehta',
         age: 42,
         gender: 'M',
         acuity: 'High',
         lastSeen: '2026-02-23T10:00:00Z',
         seenToday: true,
         diagnosis: 'Severe Pneumonia with Acute Respiratory Distress',
         attendingDoctor: 'Dr. Aditi Sharma',
         admissionDate: '2026-02-18',
         pendingOrders: { labs: 2, meds: 1 },
         dischargeReadiness: 45,
         vitals: { hr: 98, bp: '138/92', spo2: 94 }
      },
      {
         id: 'P102',
         bed: 'A-14',
         name: 'Suresh Raina',
         age: 29,
         gender: 'M',
         acuity: 'Low',
         lastSeen: '2026-02-22T18:30:00Z',
         seenToday: false,
         diagnosis: 'Post-Op Recovery (Appendectomy)',
         attendingDoctor: 'Dr. Rahul Verma',
         admissionDate: '2026-02-21',
         pendingOrders: { labs: 0, meds: 0 },
         dischargeReadiness: 85,
         vitals: { hr: 72, bp: '118/78', spo2: 98 }
      },
      {
         id: 'P103',
         bed: 'A-15',
         name: 'Meena Kumari',
         age: 64,
         gender: 'F',
         acuity: 'Medium',
         lastSeen: '2026-02-22T09:00:00Z',
         seenToday: false,
         diagnosis: 'Uncontrolled Diabetes Mellitus with UTI',
         attendingDoctor: 'Dr. Sneha Rao',
         admissionDate: '2026-02-19',
         pendingOrders: { labs: 4, meds: 2 },
         dischargeReadiness: 30,
         vitals: { hr: 88, bp: '154/96', spo2: 96 }
      },
      {
         id: 'P104',
         bed: 'B-02',
         name: 'Anjali Sharma',
         age: 34,
         gender: 'F',
         acuity: 'Medium',
         lastSeen: '2026-02-23T08:15:00Z',
         seenToday: true,
         diagnosis: 'Elective C-Section Post-Op Day 2',
         attendingDoctor: 'Dr. Priya Das',
         admissionDate: '2026-02-21',
         pendingOrders: { labs: 1, meds: 0 },
         dischargeReadiness: 70,
         vitals: { hr: 78, bp: '112/72', spo2: 99 }
      },
   ];

   const [wardPatients, setWardPatients] = useState<WardPatient[]>(mockWardPatients);

   useEffect(() => {
      const fetchIPDPatients = async () => {
         try {
            const [patients, beds] = await Promise.all([
               api.getPatients().catch(() => null),
               api.getBeds().catch(() => null),
            ]);
            if (patients && patients.length > 0 && beds && beds.length > 0) {
               const occupiedBeds = beds.filter((b: any) => b.status === 'Occupied' || b.status === 'occupied');
               if (occupiedBeds.length > 0) {
                  const ipdPatients: WardPatient[] = occupiedBeds.map((bed: any, idx: number) => {
                     const patient = patients.find((p: any) => p.id === bed.patient_id);
                     return {
                        id: patient?.uhid || `P${idx + 1}`,
                        bed: bed.bed_number || bed.name || `B-${idx + 1}`,
                        name: patient?.name || bed.patient_name || 'Unknown',
                        age: patient?.date_of_birth ? Math.floor((Date.now() - new Date(patient.date_of_birth).getTime()) / 31557600000) : 0,
                        gender: patient?.gender?.charAt(0) || '?',
                        acuity: 'Medium' as const,
                        lastSeen: new Date().toISOString(),
                        seenToday: Math.random() > 0.5,
                     };
                  });
                  setWardPatients(prev => ipdPatients.length > 0 ? ipdPatients : prev);
               }
            }
         } catch { /* fallback to mock */ }
      };
      fetchIPDPatients();
   }, []);

   const wards = ['General Ward A', 'ICU', 'Semi-Private B', 'Emergency Ward'];

   const getAcuityColor = (acuity: WardPatient['acuity']) => {
      switch (acuity) {
         case 'High': return 'text-danger bg-danger/5 border-danger/10';
         case 'Medium': return 'text-warning bg-warning/5 border-warning/10';
         case 'Low': return 'text-success bg-success/5 border-success/10';
         default: return 'text-text-muted bg-slate-100';
      }
   };

   return (
      <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500 space-y-8 pb-20 p-8">
         {/* Header & Ward Selector */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
               <h2 className="text-2xl font-black text-text-main tracking-tight">Inpatient Supervision</h2>
               <p className="text-sm font-bold text-text-muted mt-1 font-kannada flex items-center gap-2">
                  <span>“ವಾರ್ಡ್ ನಿರ್ವಹಣೆ — ನಿರಂತರ ನಿಗಾ”</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span>24/7 Clinical command.</span>
               </p>
            </div>
            <div className="flex gap-4">
               <div className="flex bg-hospital-card rounded-xl p-1 shadow-sm border border-hospital-border overflow-x-auto max-w-full custom-scrollbar">
                  {wards.map(ward => (
                     <button
                        key={ward}
                        onClick={() => setActiveWard(ward)}
                        className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${activeWard === ward ? 'bg-primary/10 text-primary shadow-sm' : 'text-text-muted hover:bg-hospital-bg hover:text-text-body'
                           }`}
                     >
                        {ward}
                     </button>
                  ))}
               </div>
               <button className="px-5 py-2.5 bg-text-main text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2">
                  <Activity size={14} /> STAT Transfer
               </button>
            </div>
         </div>

         <div className="grid grid-cols-12 gap-8">
            {/* Patient Grid */}
            <div className="col-span-12 lg:col-span-9">
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {wardPatients.map(patient => (
                     <div
                        key={patient.id}
                        onClick={() => setSelectedPatient(patient)}
                        className={`bg-hospital-card p-6 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden hover:-translate-y-1 ${selectedPatient?.id === patient.id ? 'border-primary shadow-xl ring-2 ring-primary/5' : 'border-hospital-border shadow-card hover:shadow-card-hover'
                           }`}
                     >
                        <div className="flex justify-between items-start mb-6">
                           <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10 flex items-center gap-1.5">
                                 <Bed size={12} /> Bed {patient.bed}
                              </span>
                              <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter border ${getAcuityColor(patient.acuity)}`}>
                                 {patient.acuity}
                              </span>
                           </div>
                           <div className="flex items-center gap-1.5">
                              {patient.seenToday ? <CheckCircle2 size={12} className="text-success" /> : <AlertCircle size={12} className="text-danger animate-pulse" />}
                              <span className="text-[8px] font-black text-text-muted uppercase">{patient.seenToday ? 'Seen' : 'Unseen'}</span>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <div>
                              <h4 className="text-lg font-black text-text-main leading-none group-hover:text-primary transition-colors">{patient.name}</h4>
                              <p className="text-[10px] font-bold text-text-muted uppercase mt-1.5 flex items-center gap-1.5">
                                 <span>{patient.age}y</span>
                                 <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                                 <span>{patient.gender}</span>
                                 <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                                 <span>{patient.id}</span>
                              </p>
                           </div>

                           <div className="p-3 bg-hospital-bg rounded-xl border border-hospital-border space-y-1.5">
                              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none">Primary Diagnosis</p>
                              <p className="text-xs font-bold text-text-body leading-relaxed truncate">{patient.diagnosis}</p>
                           </div>

                           <div className="grid grid-cols-3 gap-2">
                              <div className="text-center p-2 rounded-xl bg-hospital-bg border border-hospital-border">
                                 <p className="text-[8px] font-black text-text-muted uppercase mb-1 flex justify-center"><Heart size={10} /></p>
                                 <p className={`text-xs font-black ${patient.vitals?.hr && patient.vitals.hr > 100 ? 'text-danger animate-pulse' : 'text-text-main'}`}>{patient.vitals?.hr}</p>
                              </div>
                              <div className="text-center p-2 rounded-xl bg-hospital-bg border border-hospital-border">
                                 <p className="text-[8px] font-black text-text-muted uppercase mb-1 flex justify-center"><Activity size={10} /></p>
                                 <p className="text-xs font-black text-text-main whitespace-nowrap">{patient.vitals?.bp}</p>
                              </div>
                              <div className="text-center p-2 rounded-xl bg-hospital-bg border border-hospital-border">
                                 <p className="text-[8px] font-black text-text-muted uppercase mb-1 flex justify-center"><Wind size={10} /></p>
                                 <p className={`text-xs font-black ${patient.vitals?.spo2 && patient.vitals.spo2 < 95 ? 'text-danger' : 'text-text-main'}`}>{patient.vitals?.spo2}%</p>
                              </div>
                           </div>

                           <div className="flex justify-between items-center pt-2">
                              <div className="flex gap-4">
                                 <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-text-muted uppercase">Labs</span>
                                    <span className={`text-xs font-black ${patient.pendingOrders?.labs ? 'text-primary' : 'text-slate-300'}`}>{patient.pendingOrders?.labs || 0}</span>
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-text-muted uppercase">Meds</span>
                                    <span className={`text-xs font-black ${patient.pendingOrders?.meds ? 'text-warning' : 'text-slate-300'}`}>{patient.pendingOrders?.meds || 0}</span>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-[8px] font-black text-text-muted uppercase mb-1">Discharge Readiness</p>
                                 <div className="w-24 h-1.5 bg-hospital-bg rounded-full overflow-hidden border border-hospital-border/50">
                                    <div className={`h-full bg-success transition-all duration-1000`} style={{ width: `${patient.dischargeReadiness}%` }} />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}

                  {/* Empty Bed Placeholder */}
                  <div className="bg-hospital-bg/50 p-6 rounded-2xl border-2 border-dashed border-hospital-border flex flex-col items-center justify-center text-center space-y-3 grayscale opacity-60 hover:opacity-100 transition-opacity cursor-pointer hover:bg-white hover:border-primary/30 group">
                     <Bed size={32} className="text-text-muted group-hover:text-primary transition-colors" />
                     <p className="text-[10px] font-black text-text-muted uppercase tracking-widest group-hover:text-primary transition-colors">A-16 Available</p>
                  </div>
               </div>
            </div>

            {/* Supervision Sidebar */}
            <div className="col-span-12 lg:col-span-3 space-y-8">
               {selectedPatient ? (
                  <div className="bg-hospital-card p-8 rounded-2xl border border-hospital-border shadow-card animate-in slide-in-from-right-4 duration-500 space-y-8 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                     <div className="pb-6 border-b border-hospital-border">
                        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
                           <ClipboardList size={14} /> Patient Master Detail
                        </h3>
                        <div className="flex items-center gap-5">
                           <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-xl shadow-inner font-black text-primary border border-primary/10">
                              {selectedPatient.name.charAt(0)}
                           </div>
                           <div>
                              <h4 className="text-lg font-black text-text-main leading-tight">{selectedPatient.name}</h4>
                              <p className="text-[10px] font-bold text-text-muted uppercase mt-1">Adm Date: {selectedPatient.admissionDate}</p>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="space-y-2">
                           <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Attending Physician</p>
                           <div className="flex items-center gap-3 p-3 bg-hospital-bg rounded-xl border border-hospital-border">
                              <Stethoscope size={18} className="text-text-muted" />
                              <span className="text-sm font-bold text-text-body">{selectedPatient.attendingDoctor}</span>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                           <button className="py-3 bg-text-main text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex flex-col items-center gap-1">
                              <ClipboardList size={14} /> Daily Rounds
                           </button>
                           <button className="py-3 bg-primary text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-primary/20 flex flex-col items-center gap-1">
                              <Activity size={14} /> Order STAT
                           </button>
                        </div>

                        <div className="space-y-3">
                           <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Pending Directives</p>
                           <div className="space-y-2">
                              {[
                                 { task: 'IV Fluids Update', status: 'Pending', type: 'meds' },
                                 { task: 'Electrolytes Panel', status: 'In-Transit', type: 'labs' },
                              ].map((directive, i) => (
                                 <div key={i} className="flex justify-between items-center p-2.5 bg-hospital-bg rounded-lg border border-hospital-border">
                                    <div className="flex items-center gap-2">
                                       {directive.type === 'meds' ? <Pill size={12} className="text-text-muted" /> : <Droplet size={12} className="text-text-muted" />}
                                       <span className="text-[10px] font-bold text-text-body">{directive.task}</span>
                                    </div>
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border ${directive.status === 'Pending' ? 'bg-warning/10 text-warning border-warning/10' : 'bg-primary/10 text-primary border-primary/10'
                                       }`}>{directive.status}</span>
                                 </div>
                              ))}
                           </div>
                        </div>

                        <button className="w-full py-4 bg-success text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-700 shadow-xl shadow-success/20 transition-all flex items-center justify-center gap-2">
                           <CheckCircle2 size={16} /> Finalize Discharge
                        </button>
                     </div>
                  </div>
               ) : (
                  <div className="bg-hospital-card p-12 rounded-2xl border border-hospital-border shadow-sm flex flex-col items-center justify-center text-center py-24 border-dashed">
                     <div className="w-16 h-16 bg-hospital-bg rounded-full flex items-center justify-center mb-6 text-text-muted opacity-50">
                        <Bed size={32} />
                     </div>
                     <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest">Select Patient Bed</h4>
                     <p className="text-xs text-text-muted mt-2 font-bold px-4">Click on an occupied bed card to monitor specific clinical progress.</p>
                  </div>
               )}

               {/* AI Ward Insights */}
               <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl group border border-slate-800">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
                  <div className="relative z-10 space-y-6">
                     <div className="flex items-center gap-3">
                        <BrainCircuit size={24} className="text-primary group-hover:scale-110 transition-transform" />
                        <h4 className="text-sm font-black text-white">AI Ward Co-Pilot</h4>
                     </div>
                     <p className="text-xs text-slate-400 font-medium leading-relaxed font-kannada">
                        “ವಾರ್ಡ್ ನಿರ್ವಹಣೆ — ನಿರಂತರ ನಿಗಾ” — Patient P101 shows SpO2 stability for 4 hours. Automated recommendation: Down-titrate oxygen flow to 2L/min.
                     </p>
                     <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1 flex items-center gap-2">
                           <Activity size={10} /> Acuity alert
                        </p>
                        <p className="text-lg font-black text-white tracking-tighter">Stabilization Detected</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
      </div>
   );
};

export default IPDManagement;
