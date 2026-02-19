import React, { useState, useEffect } from 'react';
import { Doctor, AppointmentSlot } from '../types';
import api from '../apiClient';

const Appointments: React.FC = () => {
  const mockDoctors: Doctor[] = [
    {
      id: 'DOC-001',
      name: 'Dr. Aditi Sharma',
      specialty: 'General Physician',
      load: 85,
      avgWaitTime: '45 mins',
      slots: [
        { id: 'S1', time: '09:00 AM', status: 'Booked', patientName: 'Vikram Mehta', type: 'Regular' },
        { id: 'S2', time: '09:15 AM', status: 'Booked', patientName: 'Sunita Devi', type: 'Follow-up' },
        { id: 'S3', time: '09:30 AM', status: 'Available' },
        { id: 'S4', time: '09:45 AM', status: 'Cancelled' },
        { id: 'S5', time: '10:00 AM', status: 'Booked', patientName: 'Amit Patel', type: 'Regular' },
        { id: 'S6', time: '10:15 AM', status: 'Available' },
        { id: 'S7', time: '10:30 AM', status: 'Available' },
        { id: 'S8', time: '10:45 AM', status: 'Blocked' },
      ]
    },
    {
      id: 'DOC-002',
      name: 'Dr. Ravi Varma',
      specialty: 'Cardiologist',
      load: 40,
      avgWaitTime: '15 mins',
      slots: [
        { id: 'R1', time: '09:00 AM', status: 'Available' },
        { id: 'R2', time: '09:30 AM', status: 'Booked', patientName: 'Rajesh Kumar', type: 'Regular' },
        { id: 'R3', time: '10:00 AM', status: 'Available' },
        { id: 'R4', time: '10:30 AM', status: 'Available' },
      ]
    },
    {
      id: 'DOC-003',
      name: 'Dr. Priya Das',
      specialty: 'Pediatrician',
      load: 95,
      avgWaitTime: '60 mins',
      slots: [
        { id: 'P1', time: '09:00 AM', status: 'Booked', patientName: 'Baby of Anjali', type: 'Regular' },
        { id: 'P2', time: '09:15 AM', status: 'Booked', patientName: 'Master Rahul', type: 'Regular' },
        { id: 'P3', time: '09:30 AM', status: 'Booked', patientName: 'Miss Sneha', type: 'Follow-up' },
        { id: 'P4', time: '09:45 AM', status: 'Booked', patientName: 'Baby of Mary', type: 'Walk-in' },
      ]
    }
  ];

  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
  const [loading, setLoading] = useState(true);
  const [totalBookings, setTotalBookings] = useState('142');
  const [walkIns, setWalkIns] = useState('28');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await api.getAppointments();
        if (data && data.length > 0) {
          setTotalBookings(String(data.length));
          setWalkIns(String(data.filter((a: any) => a.visit_type === 'Walk-in').length));
        }
      } catch {
        // fallback to mock — already set
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor>(mockDoctors[0]);
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);

  const getStatusStyle = (status: AppointmentSlot['status']) => {
    switch (status) {
      case 'Available': return 'bg-success/5 text-success border-success/20 hover:bg-success/10';
      case 'Booked': return 'bg-primary/5 text-primary border-primary/20 hover:bg-primary/10';
      case 'Cancelled': return 'bg-danger/5 text-danger border-danger/20';
      case 'Blocked': return 'bg-slate-100 text-slate-400 border-slate-200';
      default: return 'bg-slate-50 text-slate-400';
    }
  };

  const aiInsights = [
    { title: 'Overload Alert', text: 'Dr. Priya Das has 95% occupancy. Recommend blocking new regular slots.', icon: '⚠️', color: 'text-danger' },
    { title: 'Slot Optimization', text: 'Dr. Ravi Varma has low load. Suggested to divert 2 general walk-ins to his clinic.', icon: '✨', color: 'text-accent' }
  ];

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500 space-y-8 pb-20">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">OPD Appointment Command</h2>
          <p className="text-sm font-medium text-slate-500 font-kannada">“ಸಮಯೋಚಿತ ಚಿಕಿತ್ಸೆ — ರೋಗಿಗಳ ಹಿತದೃಷ್ಟಿ” — Timely care for patient wellbeing.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
          {[
            { label: 'Total Bookings', value: totalBookings, icon: '📅' },
            { label: 'Today Walk-ins', value: walkIns, icon: '🚶' },
            { label: 'Avg Wait', value: '32m', icon: '⏳' },
            { label: 'Active Doctors', value: String(doctors.length), icon: '👨‍⚕️' },
          ].map(stat => (
            <div key={stat.label} className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs">{stat.icon}</span>
                <span className="text-lg font-black text-slate-800 tracking-tighter">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Doctor Selection List */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[700px]">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consulting Specialists</h3>
              <span className="text-[10px] font-bold text-slate-300 uppercase">{doctors.length} active</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {doctors.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoctor(doc)}
                  className={`p-6 border-b border-slate-50 cursor-pointer transition-all hover:bg-hospital-bg relative ${selectedDoctor.id === doc.id ? 'bg-primary/5' : ''
                    }`}
                >
                  {selectedDoctor.id === doc.id && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lg border border-slate-100 shadow-sm">👨‍⚕️</div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-none">{doc.name}</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1.5 tracking-wider">{doc.specialty}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-2 rounded-xl bg-white border border-slate-50">
                      <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Clinic Load</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${doc.load > 80 ? 'bg-danger' : doc.load > 50 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${doc.load}%` }} />
                        </div>
                        <span className="text-[10px] font-black text-slate-700">{doc.load}%</span>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-50">
                      <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Wait Est.</p>
                      <p className="text-[10px] font-black text-primary">{doc.avgWaitTime}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Slot Grid area */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm min-h-[700px]">
            <div className="flex justify-between items-center mb-10 pb-8 border-b border-slate-50">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedDoctor.name}'s Schedule</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Available slots for today</p>
              </div>
              <div className="flex gap-4">
                <button className="px-5 py-2.5 bg-hospital-bg text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Bulk Reschedule</button>
                <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all">+ Add Walk-in</button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {selectedDoctor.slots.map(slot => (
                <div
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-5 rounded-[2.5rem] border-2 transition-all cursor-pointer relative group ${selectedSlot?.id === slot.id ? 'border-primary ring-4 ring-primary/5' : 'border-transparent ' + getStatusStyle(slot.status)
                    }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest tabular-nums">{slot.time}</span>
                    {slot.status === 'Booked' && (
                      <span className={`w-2 h-2 rounded-full bg-primary`}></span>
                    )}
                  </div>
                  <div className="mt-2">
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 opacity-60`}>{slot.status}</p>
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {slot.patientName || (slot.status === 'Available' ? 'Available' : '---')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {selectedSlot && (
              <div className="mt-12 p-8 bg-hospital-bg rounded-[3rem] border border-slate-100 animate-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Slot Details • {selectedSlot.time}</p>
                    <h4 className="text-xl font-black text-slate-900">{selectedSlot.patientName || 'Vacant Slot'}</h4>
                    <p className="text-xs font-bold text-slate-500 mt-1">{selectedSlot.type ? `${selectedSlot.type} Consultation` : 'No booking yet'}</p>
                  </div>
                  <div className="flex gap-3">
                    {selectedSlot.status === 'Booked' ? (
                      <>
                        <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Reschedule</button>
                        <button className="px-6 py-2.5 bg-danger/10 text-danger border border-danger/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-danger/20 transition-all">Cancel Booking</button>
                      </>
                    ) : selectedSlot.status === 'Available' ? (
                      <button className="px-8 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-blue-700 transition-all">Confirm Booking</button>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Slot Optimization Insight */}
          <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden shadow-2xl group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                <span className="text-2xl group-hover:rotate-12 transition-transform">✨</span>
                <h4 className="text-sm font-black text-white">AI Slot Optimization</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aiInsights.map((insight, idx) => (
                  <div key={idx} className="p-6 bg-white/5 border border-white/5 rounded-[2rem] space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{insight.icon}</span>
                      <h5 className={`text-[10px] font-black uppercase tracking-widest ${insight.color}`}>{insight.title}</h5>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{insight.text}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-500 italic font-kannada">“ಆಪ್ಟಿಮೈಜೇಶನ್ — ವೈದ್ಯಕೀಯ ದಕ್ಷತೆ” — Maximizing clinician reach.</p>
                <button className="px-6 py-2 bg-accent text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-teal-600 transition-all shadow-lg shadow-accent/20">Apply Optimization</button>
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

export default Appointments;
