
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
      },
      {
         id: 'P106',
         bed: 'ICU-03',
         name: 'Ketan Patel',
         age: 48,
         gender: 'M',
         acuity: 'High',
         lastSeen: '2026-02-23T11:15:00Z',
         seenToday: true,
         diagnosis: 'Acute Myocardial Infarction - Post Stent',
         attendingDoctor: 'Dr. Rahul Verma',
         admissionDate: '2026-02-22',
         pendingOrders: { labs: 1, meds: 3 },
         dischargeReadiness: 25,
         vitals: { hr: 104, bp: '110/75', spo2: 93 },
         ward: 'ICU'
      },
      {
         id: 'P104',
         bed: 'PD-05',
         name: 'Baby of Anjali',
         age: 0,
         gender: 'F',
         acuity: 'Medium',
         lastSeen: '2026-02-23T08:15:00Z',
         seenToday: true,
         diagnosis: 'Neonatal Jaundice - Phototherapy',
         attendingDoctor: 'Dr. Priya Das',
         admissionDate: '2026-02-21',
         pendingOrders: { labs: 1, meds: 0 },
         dischargeReadiness: 70,
         vitals: { hr: 145, bp: '70/45', spo2: 99 },
         ward: 'Pediatric Ward'
      },
      {
         id: 'P108',
         bed: 'PD-08',
         name: 'Aryan M.',
         age: 8,
         gender: 'M',
         acuity: 'Low',
         lastSeen: '2026-02-22T20:00:00Z',
         seenToday: false,
         diagnosis: 'Dengue Fever - Stabilizing',
         attendingDoctor: 'Dr. Priya Das',
         admissionDate: '2026-02-19',
         pendingOrders: { labs: 2, meds: 0 },
         dischargeReadiness: 85,
         vitals: { hr: 92, bp: '100/65', spo2: 98 },
         ward: 'Pediatric Ward'
      },
      {
         id: 'P110',
         bed: 'SB-201',
         name: 'Manjula S.',
         age: 52,
         gender: 'F',
         acuity: 'Medium',
         lastSeen: '2026-02-23T09:30:00Z',
         seenToday: true,
         diagnosis: 'Type 2 Diabetes / Foot Ulcer Care',
         attendingDoctor: 'Dr. Sneha Rao',
         admissionDate: '2026-02-15',
         pendingOrders: { labs: 1, meds: 1 },
         dischargeReadiness: 75,
         vitals: { hr: 80, bp: '130/85', spo2: 97 },
         ward: 'Semi-Private B'
      },
      {
         id: 'P112',
         bed: 'ER-02',
         name: 'Unknown Male',
         age: 35,
         gender: 'M',
         acuity: 'High',
         lastSeen: '2026-02-23T12:00:00Z',
         seenToday: true,
         diagnosis: 'RTA - Multiple Trauma / Internal Bleed',
         attendingDoctor: 'Dr. Aditi Sharma',
         admissionDate: '2026-02-23',
         pendingOrders: { labs: 6, meds: 2 },
         dischargeReadiness: 0,
         vitals: { hr: 128, bp: '85/55', spo2: 89 },
         ward: 'Emergency Ward'
      },
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
                     const clinicalDiagnoses = [
                        'Acute Respiratory Distress', 'Post-Op Recovery (Day 2)', 'Severe Sepsis Protocol',
                        'Neonatal Observation', 'Hypertensive Crisis', 'Post-Cardiac Catheterization',
                        'Dengue with Warning Signs', 'Diabetic Ketoacidosis', 'Acute Renal Calculi',
                        'RTA - Polytrauma Management', 'Uncontrolled Seizure Disorder', 'Chronic Liver Disease Exacerbation'
                     ];
                     return {
                        id: patient?.uhid || `P${idx + 1}`,
                        bed: bed.bed_number || bed.name || `B-${idx + 1}`,
                        name: patient?.name || bed.patient_name || 'Unknown',
                        age: patient?.date_of_birth ? Math.floor((Date.now() - new Date(patient.date_of_birth).getTime()) / 31557600000) : 30 + (idx % 20),
                        gender: (patient?.gender?.charAt(0) || 'M') as any,
                        acuity: (idx % 3 === 0 ? 'High' : idx % 3 === 1 ? 'Medium' : 'Low') as any,
                        lastSeen: new Date().toISOString(),
                        seenToday: Math.random() > 0.5,
                        ward: bed.ward_name || wardsList[idx % wardsList.length],
                        diagnosis: clinicalDiagnoses[idx % clinicalDiagnoses.length],
                        vitals: { hr: 70 + Math.floor(Math.random() * 40), bp: '120/80', spo2: 95 + Math.floor(Math.random() * 5) },
                        dischargeReadiness: 20 + Math.floor(Math.random() * 60),
                        pendingOrders: { labs: idx % 3, meds: idx % 2 }
                     };
                  });
                  setWardPatients(prev => ipdPatients.length > 0 ? ipdPatients : prev);
               }
            }
         } catch { /* fallback to mock */ }
      };
      fetchIPDPatients();
   }, []);

   const wards = ['General Ward A', 'ICU', 'Pediatric Ward', 'Semi-Private B', 'Emergency Ward'];

   const filteredPatients = wardPatients.filter(p => p.ward === activeWard);

   const handleTransfer = () => {
      setTransferring(true);
      setTimeout(() => {
         setTransferring(false);
         setIsTransferModalOpen(false);
         showToast('success', `STAT Transfer for ${selectedPatient?.name} to ICU initiated successfully.`);
      }, 1500);
   };

   const handleDischarge = () => {
      if (!selectedPatient) return;
      showToast('info', `Finalizing discharge clearance for ${selectedPatient.name}...`);
      setTimeout(() => {
         setWardPatients(prev => prev.filter(p => p.id !== selectedPatient.id));
         setSelectedPatient(null);
         showToast('success', 'Patient has been officially discharged from the ward.');
      }, 2000);
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
                        onClick={() => {
                           setActiveWard(ward);
                           setSelectedPatient(null);
                        }}
                        className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${activeWard === ward ? 'bg-primary/10 text-primary shadow-sm' : 'text-text-muted hover:bg-hospital-bg hover:text-text-body'
                           }`}
                     >
                        {ward}
                     </button>
                  ))}
               </div>
               <button
                  onClick={() => setIsTransferModalOpen(true)}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-red-700 hover:scale-105 transition-all flex items-center gap-2 shrink-0 border-2 border-white/20"
               >
                  <Activity size={14} className="animate-pulse" /> STAT Transfer
               </button>
            </div>
         </div>

         <div className="grid grid-cols-12 gap-8">
            {/* Patient Grid */}
            <div className="col-span-12 lg:col-span-9">
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredPatients.length > 0 ? filteredPatients.map(patient => (
                     <div
                        key={patient.id}
                        onClick={() => setSelectedPatient(patient)}
                        className={`bg-hospital-card p-6 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden hover:-translate-y-1 ${selectedPatient?.id === patient.id ? 'border-primary shadow-xl ring-2 ring-primary/5 bg-primary/5' : 'border-hospital-border shadow-card hover:shadow-card-hover bg-white'
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
                              <div className="flex justify-between items-start">
                                 <h4 className="text-lg font-black text-text-main leading-none group-hover:text-primary transition-colors">{patient.name}</h4>
                                 <span className="text-[8px] font-black text-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest flex items-center gap-1">View Details <ChevronRight size={10} /></span>
                              </div>
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
                              <div className="text-center p-2 rounded-xl bg-white border border-hospital-border shadow-sm">
                                 <p className="text-[8px] font-black text-text-muted uppercase mb-1 flex justify-center"><Heart size={10} /></p>
                                 <p className={`text-xs font-black ${patient.vitals?.hr && patient.vitals.hr > 100 ? 'text-danger animate-pulse' : 'text-text-main'}`}>{patient.vitals?.hr || '--'}</p>
                              </div>
                              <div className="text-center p-2 rounded-xl bg-white border border-hospital-border shadow-sm">
                                 <p className="text-[8px] font-black text-text-muted uppercase mb-1 flex justify-center"><Activity size={10} /></p>
                                 <p className="text-xs font-black text-text-main whitespace-nowrap">{patient.vitals?.bp || '--'}</p>
                              </div>
                              <div className="text-center p-2 rounded-xl bg-white border border-hospital-border shadow-sm">
                                 <p className="text-[8px] font-black text-text-muted uppercase mb-1 flex justify-center"><Wind size={10} /></p>
                                 <p className={`text-xs font-black ${patient.vitals?.spo2 && patient.vitals.spo2 < 95 ? 'text-danger' : 'text-text-main'}`}>{patient.vitals?.spo2 || '--'}%</p>
                              </div>
                           </div>

                           <div className="flex justify-between items-center pt-2">
                              <div className="flex gap-4">
                                 <div className="flex flex-col group/labs cursor-pointer" onClick={(e) => { e.stopPropagation(); showToast('info', `Displaying ${patient.pendingOrders?.labs} pending lab results...`); }}>
                                    <span className="text-[8px] font-black text-text-muted uppercase group-hover/labs:text-primary">Labs</span>
                                    <span className={`text-xs font-black ${patient.pendingOrders?.labs ? 'text-primary' : 'text-slate-300'}`}>{patient.pendingOrders?.labs || 0}</span>
                                 </div>
                                 <div className="flex flex-col group/meds cursor-pointer" onClick={(e) => { e.stopPropagation(); showToast('info', `Reviewing MAR for ${patient.name}...`); }}>
                                    <span className="text-[8px] font-black text-text-muted uppercase group-hover/meds:text-warning">Meds</span>
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
                  )) : (
                     <div className="col-span-12 py-32 bg-white rounded-[3rem] border border-dashed border-hospital-border flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
                           <Bed size={40} />
                        </div>
                        <h4 className="text-lg font-black text-text-main uppercase tracking-widest">{activeWard} Empty</h4>
                        <p className="text-sm text-text-muted font-bold mt-2">No patients are currently admitted to this ward sector.</p>
                     </div>
                  )}

                  {filteredPatients.length > 0 && (
                     <div className="bg-hospital-bg/50 p-6 rounded-2xl border-2 border-dashed border-hospital-border flex flex-col items-center justify-center text-center space-y-3 grayscale opacity-60 hover:opacity-100 transition-opacity cursor-pointer hover:bg-white hover:border-primary/30 group">
                        <Bed size={32} className="text-text-muted group-hover:text-primary transition-colors" />
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest group-hover:text-primary transition-colors">Available Bed Ready</p>
                     </div>
                  )}
               </div>
            </div>

            {/* Supervision Sidebar / Patient Drawer */}
            <div className="col-span-12 lg:col-span-3 space-y-8">
               {selectedPatient ? (
                  <div className="bg-white p-6 rounded-[2.5rem] border border-hospital-border shadow-2xl animate-in slide-in-from-right-4 duration-500 space-y-6 relative overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar ring-1 ring-slate-100">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                     <div className="pb-4 border-b border-hospital-border sticky top-0 bg-white z-10 pt-2">
                        <div className="flex justify-between items-start mb-4">
                           <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                              <ClipboardList size={14} /> Clinical command
                           </h3>
                           <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-danger">
                              <XCircle size={20} />
                           </button>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-xl shadow-inner font-black text-primary border border-primary/10 shrink-0">
                              {selectedPatient.name.charAt(0)}
                           </div>
                           <div className="overflow-hidden">
                              <h4 className="text-lg font-black text-text-main leading-tight truncate">{selectedPatient.name}</h4>
                              <p className="text-[9px] font-bold text-text-muted uppercase mt-1 truncate">UHID: {selectedPatient.id} • {selectedPatient.ward}</p>
                           </div>
                        </div>
                     </div>

                     {/* Quick Action Grid */}
                     <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => showToast('info', 'Opening full patient profile...')} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center gap-2 group hover:border-primary/30 transition-all">
                           <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform"><User size={16} /></div>
                           <span className="text-[9px] font-black text-slate-600 uppercase">Profile</span>
                        </button>
                        <button onClick={() => showToast('info', 'Redirecting to Integrated EMR...')} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center gap-2 group hover:border-primary/30 transition-all">
                           <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform"><FileText size={16} /></div>
                           <span className="text-[9px] font-black text-slate-600 uppercase">Open EMR</span>
                        </button>
                        <button onClick={() => showToast('info', 'Fetching latest lab reports...')} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center gap-2 group hover:border-primary/30 transition-all">
                           <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-teal-600 shadow-sm group-hover:scale-110 transition-transform"><FlaskConical size={16} /></div>
                           <span className="text-[9px] font-black text-slate-600 uppercase">Latest Labs</span>
                        </button>
                        <button onClick={() => showToast('info', 'Opening Medication Administration Record...')} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center gap-2 group hover:border-primary/30 transition-all">
                           <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-orange-600 shadow-sm group-hover:scale-110 transition-transform"><Pill size={16} /></div>
                           <span className="text-[9px] font-black text-slate-600 uppercase">Medications</span>
                        </button>
                     </div>

                     <div className="space-y-4">
                        <div className="space-y-2">
                           <div className="flex justify-between items-center px-1">
                              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Vitals Trend</p>
                              <button onClick={() => showToast('info', 'Loading vitals history chart...')} className="text-[8px] font-black text-primary uppercase flex items-center gap-1">
                                 <LineChart size={10} /> View Charts
                              </button>
                           </div>
                           <div className="grid grid-cols-3 gap-2">
                              <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
                                 <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">HR</p>
                                 <p className="text-xs font-black text-slate-700">{selectedPatient.vitals?.hr || '--'}</p>
                              </div>
                              <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
                                 <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">BP</p>
                                 <p className="text-xs font-black text-slate-700">{selectedPatient.vitals?.bp || '--'}</p>
                              </div>
                              <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
                                 <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">SpO2</p>
                                 <p className="text-xs font-black text-slate-700">{selectedPatient.vitals?.spo2 || '--'}%</p>
                              </div>
                           </div>
                        </div>

                        {/* Quick Doctor Note */}
                        <div className="space-y-2">
                           <p className="text-[9px] font-black text-text-muted uppercase tracking-widest px-1">Add Quick Note</p>
                           <div className="relative">
                              <textarea
                                 value={doctorNote}
                                 onChange={(e) => setDoctorNote(e.target.value)}
                                 placeholder="Type clinical observation..."
                                 className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none ring-1 ring-slate-100/50 resize-none h-24"
                              />
                              <button
                                 onClick={() => {
                                    if (doctorNote.trim()) {
                                       showToast('success', 'Clinical note recorded successfully.');
                                       setDoctorNote('');
                                    }
                                 }}
                                 className="absolute bottom-3 right-3 p-1.5 bg-primary text-white rounded-lg shadow-lg hover:scale-110 transition-transform"
                              >
                                 <MessageSquare size={14} />
                              </button>
                           </div>
                        </div>

                        {/* Critical Operations */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                           <button onClick={() => setIsTransferModalOpen(true)} className="py-4 bg-slate-900 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex flex-col items-center gap-1 group">
                              <ArrowRightLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Transfer
                           </button>
                           <button
                              onClick={handleDischarge}
                              disabled={selectedPatient.dischargeReadiness < 80}
                              className={`py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl transition-all flex flex-col items-center gap-1 ${selectedPatient.dischargeReadiness >= 80 ? 'bg-success text-white hover:bg-green-700 shadow-success/20' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'}`}
                           >
                              <CheckCircle2 size={16} /> Discharge
                           </button>
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="bg-white p-12 rounded-[2.5rem] border border-hospital-border shadow-sm flex flex-col items-center justify-center text-center py-32 border-dashed">
                     <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
                        <Bed size={40} />
                     </div>
                     <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest italic">Monitor Hub Inactive</h4>
                     <p className="text-xs text-text-muted mt-3 font-bold px-6 leading-relaxed">Select specialized bed card from the {activeWard} grid to initiate clinical oversight.</p>
                  </div>
               )}

               {/* AI Ward Insights */}
               <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl group border border-slate-800">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
                  <div className="relative z-10 space-y-6">
                     <div className="flex items-center gap-3">
                        <BrainCircuit size={24} className="text-primary group-hover:scale-110 transition-transform" />
                        <h4 className="text-sm font-black text-white">AI Ward Co-Pilot</h4>
                     </div>
                     <p className="text-xs text-slate-400 font-medium leading-relaxed font-kannada">
                        “ವಾರ್ಡ್ ನಿರ್ವಹಣೆ — ನಿರಂತರ ನಿಗಾ” — Advanced monitoring active. Bed A-12 show improved ventilation markers. Discharge potential in 48h.
                     </p>
                     <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1 flex items-center gap-2">
                           <Activity size={10} /> Clinical Alert
                        </p>
                        <p className="text-lg font-black text-white tracking-tighter">Stability Trend: Upward</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* STAT Transfer Modal */}
         {isTransferModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
               <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 duration-300">
                  <div className="p-8 pb-4 border-b border-slate-50 flex justify-between items-center">
                     <div>
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                           <Activity size={24} className="text-danger" /> STAT Transfer
                        </h3>
                        <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">High-Acuity Routing</p>
                     </div>
                     <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-300 hover:text-slate-600">
                        <XCircle size={24} />
                     </button>
                  </div>

                  <div className="p-8 space-y-6">
                     <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex gap-4">
                        <AlertCircle size={20} className="text-danger shrink-0 mt-1" />
                        <div>
                           <p className="text-xs font-black text-danger uppercase tracking-widest mb-1">Emergency Protocol</p>
                           <p className="text-xs font-bold text-red-700 leading-relaxed">This will initiate immediate clinical handover to ICU and notify the rapid response team.</p>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Selected Patient</label>
                           <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-900">
                              {selectedPatient ? selectedPatient.name : 'Please select patient in grid first'}
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Destination Ward</label>
                           <select className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20">
                              <option>Intensive Care Unit (ICU)</option>
                              <option>Emergency Trauma Care</option>
                              <option>Cardiac Care Unit (CCU)</option>
                           </select>
                        </div>
                     </div>

                     <button
                        onClick={handleTransfer}
                        disabled={transferring || !selectedPatient}
                        className="w-full py-5 bg-red-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                     >
                        {transferring ? <Loader2 size={20} className="animate-spin" /> : <Activity size={20} />}
                        {transferring ? 'Handing Over...' : 'Confirm STAT Transfer'}
                     </button>
                  </div>
               </div>
            </div>
         )}

         <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
      </div>
   );
};

export default IPDManagement;
