import React, { useState, useEffect } from 'react';
import { WardPatient } from '../types';
import api from '../apiClient';
import { useToast } from '../context/ToastContext';
import {
   Bed, Activity, Heart, Thermometer, Wind,
   User, Stethoscope, ClipboardList, AlertCircle,
   CheckCircle2, Clock, BrainCircuit, ChevronRight,
   Droplet, Pill, Syringe, XCircle, Loader2,
   FileText, FlaskConical, LineChart, MessageSquare, ArrowRightLeft
} from 'lucide-react';

const IPDManagement: React.FC = () => {
   const { showToast } = useToast();
   const [activeWard, setActiveWard] = useState<string>('General Ward A');
   const [selectedPatient, setSelectedPatient] = useState<WardPatient | null>(null);
   const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
   const [transferring, setTransferring] = useState(false);
   const [doctorNote, setDoctorNote] = useState('');
   const [isDrawerOpen, setIsDrawerOpen] = useState(false);

   const mockWardPatients: (WardPatient & { ward: string })[] = [
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
         vitals: { hr: 98, bp: '138/92', spo2: 94 },
         ward: 'General Ward A'
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
         dischargeReadiness: 92,
         vitals: { hr: 72, bp: '118/78', spo2: 98 },
         ward: 'General Ward A'
      },
      {
         id: 'P105',
         bed: 'A-22',
         name: 'Ramesh Kumar',
         age: 55,
         gender: 'M',
         acuity: 'Medium',
         lastSeen: '2026-02-23T06:45:00Z',
         seenToday: true,
         diagnosis: 'Hypertension Crisis / Kidney Stones',
         attendingDoctor: 'Dr. Sneha Rao',
         admissionDate: '2026-02-20',
         pendingOrders: { labs: 3, meds: 2 },
         dischargeReadiness: 55,
         vitals: { hr: 84, bp: '165/105', spo2: 97 },
         ward: 'General Ward A'
      },
      {
         id: 'P103',
         bed: 'ICU-01',
         name: 'Meena Kumari',
         age: 64,
         gender: 'F',
         acuity: 'High',
         lastSeen: '2026-02-22T09:00:00Z',
         seenToday: false,
         diagnosis: 'Septic Shock / Multi-organ Failure',
         attendingDoctor: 'Dr. Aditi Sharma',
         admissionDate: '2026-02-19',
         pendingOrders: { labs: 4, meds: 2 },
         dischargeReadiness: 10,
         vitals: { hr: 112, bp: '90/60', spo2: 91 },
         ward: 'ICU'
      }
   ];

   const [wardPatients, setWardPatients] = useState<(WardPatient & { ward: string })[]>(mockWardPatients);

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
                  const ipdPatients = occupiedBeds.map((bed: any, idx: number) => {
                     const patient = patients.find((p: any) => p.id === bed.patient_id);
                     const wardsList = ['General Ward A', 'ICU', 'Pediatric Ward', 'Semi-Private B', 'Emergency Ward'];
                     return {
                        id: patient?.uhid || `P${idx + 1}`,
                        bed: bed.bed_number || bed.name || `B-${idx + 1}`,
                        name: patient?.name || bed.patient_name || 'Unknown',
                        age: patient?.date_of_birth ? Math.floor((Date.now() - new Date(patient.date_of_birth).getTime()) / 31557600000) : 30,
                        gender: (patient?.gender?.charAt(0) || 'M') as any,
                        acuity: (idx % 3 === 0 ? 'High' : 'Medium') as any,
                        lastSeen: new Date().toISOString(),
                        seenToday: Math.random() > 0.5,
                        ward: bed.ward_name || wardsList[idx % wardsList.length],
                        diagnosis: 'Acute Condition',
                        vitals: { hr: 80, bp: '120/80', spo2: 98 },
                        dischargeReadiness: 50,
                        pendingOrders: { labs: 0, meds: 0 }
                     };
                  });
                  setWardPatients(ipdPatients);
               }
            }
         } catch { /* fallback */ }
      };
      fetchIPDPatients();
   }, []);

   const wards = ['General Ward A', 'ICU', 'Pediatric Ward', 'Semi-Private B', 'Emergency Ward'];
   const filteredPatients = wardPatients.filter(p => p.ward === activeWard);

   useEffect(() => {
      if (selectedPatient && window.innerWidth < 1024) {
         setIsDrawerOpen(true);
      }
   }, [selectedPatient]);

   const handleTransfer = () => {
      setTransferring(true);
      setTimeout(() => {
         setTransferring(false);
         setIsTransferModalOpen(false);
         showToast('success', `STAT Transfer for ${selectedPatient?.name} initiated.`);
      }, 1500);
   };

   const handleDischarge = () => {
      if (!selectedPatient) return;
      showToast('success', 'Patient discharged.');
      setWardPatients(prev => prev.filter(p => p.id !== selectedPatient.id));
      setSelectedPatient(null);
      setIsDrawerOpen(false);
   };

   const getAcuityColor = (acuity: WardPatient['acuity']) => {
      switch (acuity) {
         case 'High': return 'text-danger bg-danger/5 border-danger/10';
         case 'Medium': return 'text-warning bg-warning/5 border-warning/10';
         case 'Low': return 'text-success bg-success/5 border-success/10';
         default: return 'text-text-muted bg-slate-100';
      }
   };

   return (
      <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500 space-y-6 md:space-y-8 p-4 md:p-8 pb-32">
         {/* Header & Ward Selector - Mobile Optimized */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
            <div>
               <h2 className="text-xl md:text-2xl font-black text-text-main tracking-tight">Inpatient Supervision</h2>
               <p className="text-[10px] md:text-sm font-bold text-text-muted mt-1 font-kannada">“ವಾರ್ಡ್ ನಿರ್ವಹಣೆ — ನಿರಂತರ ನಿಗಾ”</p>
            </div>

            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
               <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-hospital-border overflow-x-auto no-scrollbar">
                  {wards.map(ward => (
                     <button
                        key={ward}
                        onClick={() => { setActiveWard(ward); setSelectedPatient(null); }}
                        className={`px-4 py-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${activeWard === ward ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-text-body'}`}
                     >
                        {ward}
                     </button>
                  ))}
               </div>
               <button
                  onClick={() => setIsTransferModalOpen(true)}
                  className="flex-1 sm:flex-none px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
               >
                  <Activity size={14} className="animate-pulse" /> STAT Transfer
               </button>
            </div>
         </div>

         <div className="grid grid-cols-12 gap-6 md:gap-8">
            {/* Patient Grid - Full width on mobile/tablet */}
            <div className="col-span-12 lg:col-span-9">
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
                  {filteredPatients.length > 0 ? filteredPatients.map(patient => (
                     <div
                        key={patient.id}
                        onClick={() => setSelectedPatient(patient)}
                        className={`bg-white p-5 md:p-6 rounded-[2rem] border transition-all cursor-pointer group relative overflow-hidden active:scale-95 md:active:scale-100 ${selectedPatient?.id === patient.id ? 'border-primary shadow-xl ring-2 ring-primary/5 bg-primary/5' : 'border-hospital-border shadow-sm hover:shadow-xl'}`}
                     >
                        <div className="flex justify-between items-start mb-5">
                           <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black text-primary uppercase bg-primary/5 px-2.5 py-1.5 rounded-xl border border-primary/10 flex items-center gap-1.5">
                                 <Bed size={12} /> {patient.bed}
                              </span>
                              <span className={`px-2.5 py-1.5 rounded-xl text-[8px] font-black uppercase border ${getAcuityColor(patient.acuity)}`}>
                                 {patient.acuity}
                              </span>
                           </div>
                           <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-full">
                              <span className={`w-1.5 h-1.5 rounded-full ${patient.seenToday ? 'bg-success' : 'bg-danger animate-pulse'}`} />
                              <span className="text-[8px] font-black text-text-muted uppercase">{patient.seenToday ? 'Seen' : 'Pending'}</span>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <div>
                              <h4 className="text-base md:text-lg font-black text-text-main leading-none group-hover:text-primary transition-colors">{patient.name}</h4>
                              <p className="text-[9px] font-bold text-text-muted uppercase mt-2 flex items-center gap-1.5">
                                 <span>{patient.age}y</span>
                                 <span className="w-1 h-1 rounded-full bg-slate-300" />
                                 <span>{patient.gender}</span>
                                 <span className="w-1 h-1 rounded-full bg-slate-300" />
                                 <span className="text-primary/70">{patient.id}</span>
                              </p>
                           </div>

                           <div className="p-3 bg-hospital-bg rounded-xl border border-hospital-border/50">
                              <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1.5">Diagnosis</p>
                              <p className="text-xs font-bold text-text-body leading-relaxed truncate">{patient.diagnosis}</p>
                           </div>

                           <div className="grid grid-cols-3 gap-2">
                              {/* Enlarged touch targets for vitals */}
                              <div className="text-center p-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                                 <p className="text-[7px] font-black text-slate-400 uppercase mb-1 flex justify-center"><Heart size={10} /></p>
                                 <p className="text-sm font-black text-slate-700">{patient.vitals?.hr || '--'}</p>
                              </div>
                              <div className="text-center p-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                                 <p className="text-[7px] font-black text-slate-400 uppercase mb-1 flex justify-center"><Activity size={10} /></p>
                                 <p className="text-sm font-black text-slate-700">{patient.vitals?.bp || '--'}</p>
                              </div>
                              <div className="text-center p-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                                 <p className="text-[7px] font-black text-slate-400 uppercase mb-1 flex justify-center"><Wind size={10} /></p>
                                 <p className="text-sm font-black text-slate-700">{patient.vitals?.spo2 || '--'}%</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  )) : (
                     <div className="col-span-12 py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-hospital-border flex flex-col items-center justify-center text-center">
                        <Bed size={40} className="text-slate-200 mb-4" />
                        <h4 className="text-sm font-black text-text-muted uppercase tracking-widest">No Patients in {activeWard}</h4>
                     </div>
                  )}
               </div>
            </div>

            {/* Supervision Sidebar - Mobile Responsive Drawer */}
            <div className={`col-span-12 lg:col-span-3 lg:block fixed lg:relative inset-0 z-[100] lg:z-auto transition-all duration-500 ease-in-out ${isDrawerOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'} ${!selectedPatient && 'lg:block hidden'}`}>
               {/* Mobile Overlay */}
               <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={() => setIsDrawerOpen(false)} />

               <div className="absolute bottom-0 lg:sticky lg:top-8 bg-white p-6 md:p-8 rounded-t-[3rem] lg:rounded-[2.5rem] border border-hospital-border shadow-2xl lg:shadow-sm w-full h-[85vh] lg:h-auto overflow-hidden flex flex-col">
                  {/* Drawer Handle */}
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 lg:hidden shrink-0" onClick={() => setIsDrawerOpen(false)} />

                  {selectedPatient ? (
                     <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-1">
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg shadow-primary/20 shrink-0">
                                 {selectedPatient.name.charAt(0)}
                              </div>
                              <div className="overflow-hidden">
                                 <h4 className="text-xl font-black text-text-main leading-tight truncate">{selectedPatient.name}</h4>
                                 <p className="text-[10px] font-bold text-text-muted uppercase mt-1 truncate">{selectedPatient.id} • {selectedPatient.bed}</p>
                              </div>
                           </div>
                           <button onClick={() => { setSelectedPatient(null); setIsDrawerOpen(false); }} className="text-slate-300 hover:text-danger lg:block hidden">
                              <XCircle size={20} />
                           </button>
                        </div>

                        {/* Quick Action Grid - Larger targets */}
                        <div className="grid grid-cols-2 gap-3">
                           {[
                              { icon: <User size={18} />, label: 'Profile', color: 'text-primary' },
                              { icon: <FileText size={18} />, label: 'EMR', color: 'text-indigo-600' },
                              { icon: <FlaskConical size={18} />, label: 'Labs', color: 'text-teal-600' },
                              { icon: <Pill size={18} />, label: 'Meds', color: 'text-orange-600' }
                           ].map(action => (
                              <button key={action.label} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center gap-2 active:bg-slate-100 transition-all">
                                 <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center ${action.color} shadow-sm`}>{action.icon}</div>
                                 <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{action.label}</span>
                              </button>
                           ))}
                        </div>

                        <div className="space-y-6">
                           <div className="space-y-3">
                              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest px-1">Observed Vitals</p>
                              <div className="grid grid-cols-3 gap-2">
                                 <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-center">
                                    <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">HR</p>
                                    <p className="text-xs font-black text-slate-700">{selectedPatient.vitals?.hr || '--'}</p>
                                 </div>
                                 <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-center">
                                    <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">BP</p>
                                    <p className="text-xs font-black text-slate-700">{selectedPatient.vitals?.bp || '--'}</p>
                                 </div>
                                 <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-center">
                                    <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">SpO2</p>
                                    <p className="text-xs font-black text-slate-700">{selectedPatient.vitals?.spo2 || '--'}%</p>
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-3">
                              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest px-1">Clinical Observation</p>
                              <div className="relative">
                                 <textarea
                                    value={doctorNote}
                                    onChange={(e) => setDoctorNote(e.target.value)}
                                    placeholder="Annotate patient status..."
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none h-28 resize-none"
                                 />
                                 <button className="absolute bottom-3 right-3 p-2 bg-primary text-white rounded-xl shadow-lg active:scale-90 transition-all">
                                    <MessageSquare size={16} />
                                 </button>
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-3 pt-2">
                              <button onClick={() => setIsTransferModalOpen(true)} className="py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex flex-col items-center gap-1 shadow-lg active:scale-95 transition-all">
                                 <ArrowRightLeft size={18} /> Transfer
                              </button>
                              <button
                                 onClick={handleDischarge}
                                 className="py-5 bg-success text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex flex-col items-center gap-1 shadow-lg shadow-success/20 active:scale-95 transition-all"
                              >
                                 <CheckCircle2 size={18} /> Discharge
                              </button>
                           </div>
                        </div>
                     </div>
                  ) : (
                     <div className="flex flex-col items-center justify-center text-center h-full text-slate-300 p-10">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                           <Activity size={32} />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Select Patient</h4>
                        <p className="text-xs font-bold mt-2 leading-relaxed">Choose a bed from the ward grid to monitor patient details.</p>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* STAT Transfer Modal - Fixed for Mobile */}
         {isTransferModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-900/60 backdrop-blur-md">
               <div className="w-full max-w-md bg-white rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                  <div className="p-8 pb-4 border-b border-slate-50 flex justify-between items-center">
                     <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><Activity className="text-danger" /> STAT Transfer</h3>
                     <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-300"><XCircle size={24} /></button>
                  </div>
                  <div className="p-8 space-y-6">
                     <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex gap-4">
                        <AlertCircle size={20} className="text-danger shrink-0 mt-1" />
                        <p className="text-xs font-bold text-red-700 leading-relaxed">Immediate clinical handover to ICU and rapid response team notification.</p>
                     </div>
                     <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-black text-slate-800 text-sm">
                           {selectedPatient ? selectedPatient.name : 'No Patient Selected'}
                        </div>
                        <select className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-800 outline-none">
                           <option>Intensive Care Unit (ICU)</option>
                           <option>Cardiac Care Unit (CCU)</option>
                           <option>Emergency Trauma</option>
                        </select>
                     </div>
                     <button onClick={handleTransfer} disabled={transferring || !selectedPatient} className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3">
                        {transferring ? <Loader2 className="animate-spin" /> : <Activity />} Confirm STAT
                     </button>
                  </div>
               </div>
            </div>
         )}

         <style>{`
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
         `}</style>
      </div>
   );
};

export default IPDManagement;
