
import React, { useState, useEffect } from 'react';
import { OTRoom, Surgery } from '../types';
import api from '../apiClient';

const OTManagement: React.FC = () => {
  const [rooms, setRooms] = useState<OTRoom[]>([
    { id: 'OT-1', name: 'Surgical Suite 1', status: 'In-Use', currentSurgery: 'SURG-101' },
    { id: 'OT-2', name: 'Cardiac Suite', status: 'Available' },
    { id: 'OT-3', name: 'Neuro Suite', status: 'Cleaning' },
    { id: 'OT-4', name: 'General OT', status: 'Available' },
  ]);

  const [surgeries, setSurgeries] = useState<Surgery[]>([
    {
      id: 'SURG-101',
      otId: 'OT-1',
      patientName: 'Vikram Mehta',
      procedure: 'Laparoscopic Cholecystectomy',
      surgeon: 'Dr. Sanjay Kapoor',
      anesthetist: 'Dr. Priya Das',
      startTime: '08:30 AM',
      duration: '90 mins',
      status: 'In-Progress',
      checklist: {
        consentObtained: true,
        siteMarked: true,
        anesthesiaSafetyCheck: true,
        pulseOxOn: true
      }
    },
    {
      id: 'SURG-102',
      otId: 'OT-2',
      patientName: 'Anjali Sharma',
      procedure: 'Mitral Valve Replacement',
      surgeon: 'Dr. Vikram Seth',
      anesthetist: 'Dr. Meera Nair',
      startTime: '10:30 AM',
      duration: '180 mins',
      status: 'Scheduled',
      checklist: {
        consentObtained: true,
        siteMarked: true,
        anesthesiaSafetyCheck: false,
        pulseOxOn: false
      }
    },
    {
      id: 'SURG-103',
      otId: 'OT-4',
      patientName: 'Rajesh Kumar',
      procedure: 'Hernia Repair',
      surgeon: 'Dr. Aditi Sharma',
      anesthetist: 'Dr. Ravi Varma',
      startTime: '09:00 AM',
      duration: '60 mins',
      status: 'Delayed',
      checklist: {
        consentObtained: true,
        siteMarked: true,
        anesthesiaSafetyCheck: true,
        pulseOxOn: true
      }
    }
  ]);

  useEffect(() => {
    const enrichWithPatients = async () => {
      try {
        const patients = await api.getPatients();
        if (patients && patients.length > 0) {
          setSurgeries(prev => prev.map((surg, idx) => ({
            ...surg,
            patientName: patients[idx % patients.length]?.name || surg.patientName,
          })));
        }
      } catch { /* keep mock data */ }
    };
    enrichWithPatients();
  }, []);

  const [selectedSurgery, setSelectedSurgery] = useState<Surgery | null>(surgeries[0]);

  const getStatusStyle = (status: Surgery['status'] | OTRoom['status']) => {
    switch (status) {
      case 'In-Progress':
      case 'In-Use': return 'bg-primary/10 text-primary border-primary/20';
      case 'Available':
      case 'Completed': return 'bg-success/10 text-success border-success/20';
      case 'Cleaning':
      case 'Post-Op': return 'bg-warning/10 text-warning border-warning/20';
      case 'Delayed':
      case 'Maintenance': return 'bg-danger/10 text-danger border-danger/20 animate-pulse';
      case 'Scheduled': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500 space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Operation Theatre Command</h2>
          <p className="text-sm font-medium text-slate-500 font-kannada">“ಶಸ್ತ್ರಚಿಕಿತ್ಸಾ ಸುರಕ್ಷತೆ — ಜೀವ ಉಳಿಸುವ ತಂತ್ರ” — Precision and safety in every cut.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">
            Print Schedule
          </button>
          <button className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-blue-700 transition-all">
            + Book Emergency OT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* OT Room Status Grid */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Real-time Suite Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rooms.map(room => (
              <div key={room.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">{room.id}</span>
                  <span className={`w-2 h-2 rounded-full ${room.status === 'Available' ? 'bg-success' :
                    room.status === 'In-Use' ? 'bg-primary' :
                      room.status === 'Cleaning' ? 'bg-warning' : 'bg-danger'
                    }`}></span>
                </div>
                <h4 className="text-sm font-black text-slate-900 mb-4">{room.name}</h4>
                <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border text-center ${getStatusStyle(room.status)}`}>
                  {room.status}
                </div>
                {room.currentSurgery && (
                  <div className="mt-4 pt-4 border-t border-slate-50">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Ongoing</p>
                    <p className="text-[10px] font-black text-slate-700 truncate">{surgeries.find(s => s.id === room.currentSurgery)?.procedure}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl mt-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <h3 className="text-lg font-black text-white">Efficiency Pulse</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    <span>OT Utilization</span>
                    <span className="text-white">78%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[78%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    <span>Cleaning TAT</span>
                    <span className="text-white">18m</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-success w-[90%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Surgery Schedule */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Today's Surgical Roadmap</h3>
              <div className="flex gap-2">
                <button className="px-4 py-1.5 bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest rounded-lg border border-primary/10">Active</button>
                <button className="px-4 py-1.5 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-50">All</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                    <th className="px-8 py-4">Time / OT</th>
                    <th className="px-8 py-4">Procedure & Patient</th>
                    <th className="px-8 py-4">Surgical Team</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {surgeries.map(surg => (
                    <tr
                      key={surg.id}
                      onClick={() => setSelectedSurgery(surg)}
                      className={`group transition-all cursor-pointer hover:bg-hospital-bg ${selectedSurgery?.id === surg.id ? 'bg-primary/5' : ''}`}
                    >
                      <td className="px-8 py-6">
                        <p className="text-sm font-black text-slate-900">{surg.startTime}</p>
                        <p className="text-[9px] font-bold text-primary uppercase mt-1">{surg.otId}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-black text-slate-900 leading-tight">{surg.procedure}</p>
                        <p className="text-xs font-medium text-slate-500 mt-1">{surg.patientName}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400">SRG:</span>
                          <span className="text-[10px] font-black text-slate-700">{surg.surgeon}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-slate-400">ANS:</span>
                          <span className="text-[10px] font-black text-slate-700">{surg.anesthetist}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(surg.status)}`}>
                          {surg.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:text-primary hover:border-primary transition-all">➔</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedSurgery && (
            <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-start mb-10 border-b border-slate-50 pb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedSurgery.procedure}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Patient: {selectedSurgery.patientName}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">UID: {selectedSurgery.id}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Surgical Status</span>
                  <span className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(selectedSurgery.status)}`}>
                    {selectedSurgery.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Pre-Op WHO Safety Checklist</h4>
                    <div className="space-y-4">
                      {[
                        { id: 'consentObtained', label: 'Informed Consent Obtained' },
                        { id: 'siteMarked', label: 'Surgical Site Marked' },
                        { id: 'anesthesiaSafetyCheck', label: 'Anesthesia Machine & Medication Check' },
                        { id: 'pulseOxOn', label: 'Pulse Oximeter Applied and Functioning' },
                      ].map(item => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-hospital-bg rounded-2xl border border-slate-50">
                          <span className="text-xs font-bold text-slate-700">{item.label}</span>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${(selectedSurgery.checklist as any)[item.id] ? 'bg-success text-white' : 'bg-slate-200 text-slate-400'
                            }`}>
                            {(selectedSurgery.checklist as any)[item.id] ? '✓' : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="p-8 bg-hospital-bg rounded-[3rem] border border-slate-100 flex flex-col justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-sm">⏱️</div>
                    <h4 className="text-lg font-black text-slate-900">Time to Incision</h4>
                    <div className="text-4xl font-black text-primary tabular-nums tracking-tighter">
                      01 : 24 : 10
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Projected Finish: 12:45 PM</p>
                  </div>

                  <div className="flex gap-4">
                    <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">Start Procedure</button>
                    <button className="flex-1 py-4 bg-danger text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-danger/20">Emergency Stop</button>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-center gap-6">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">🤖</div>
                <div className="flex-1">
                  <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">AI Surgical Assistant</p>
                  <p className="text-xs text-primary/70 font-medium font-kannada">“ನಿಖರ ರೋಗನಿರ್ಣಯ — ಉತ್ತಮ ಚಿಕಿತ್ಸೆ” — Based on pre-op scans, the lesion depth is estimated at 12mm. Site marking matches imaging. Proceed with confidence.</p>
                </div>
              </div>
            </div>
          )}
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

export default OTManagement;
