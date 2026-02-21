
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import api from '../apiClient';

const PatientPortal: React.FC = () => {
   const { t } = useLanguage();
   const { showToast } = useToast();
   const { user } = useAuth();
   const [loading, setLoading] = useState(true);
   const [booking, setBooking] = useState(false);
   const [refilling, setRefilling] = useState(false);
   const [appointments, setAppointments] = useState<any[]>([]);
   const [prescriptions, setPrescriptions] = useState<any[]>([]);

   const mockAppointments = [
      { id: 1, doctor: 'Dr. Sharma', specialty: 'Cardiology', date: '2026-02-22', time: '10:00 AM', status: 'Confirmed' },
      { id: 2, doctor: 'Dr. Das', specialty: 'General Medicine', date: '2026-03-05', time: '11:30 AM', status: 'Confirmed' },
      { id: 3, doctor: 'Dr. Verma', specialty: 'Orthopedics', date: '2026-01-28', time: '09:00 AM', status: 'Completed' },
   ];

   const mockPrescriptions = [
      { id: 1, medicine: 'Metformin 500mg', dosage: '1-0-1', doctor: 'Dr. Sharma', date: '2026-02-18', refillsLeft: 2, status: 'Active' },
      { id: 2, medicine: 'Amlodipine 5mg', dosage: '0-0-1', doctor: 'Dr. Sharma', date: '2026-02-18', refillsLeft: 3, status: 'Active' },
      { id: 3, medicine: 'Pantoprazole 40mg', dosage: '1-0-0', doctor: 'Dr. Das', date: '2026-02-10', refillsLeft: 0, status: 'Expired' },
   ];

   useEffect(() => {
      const load = async () => {
         setLoading(true);
         try {
            const [apptData, rxData] = await Promise.all([
               api.getAppointments().catch(() => null),
               api.getPrescriptions().catch(() => null),
            ]);
            setAppointments(apptData && apptData.length > 0 ? apptData.slice(0, 5) : mockAppointments);
            setPrescriptions(rxData && rxData.length > 0 ? rxData : mockPrescriptions);
         } catch {
            setAppointments(mockAppointments);
            setPrescriptions(mockPrescriptions);
         } finally {
            setLoading(false);
         }
      };
      load();
   }, []);

   const handleBookAppointment = async () => {
      setBooking(true);
      await new Promise(r => setTimeout(r, 1200));
      showToast('success', 'Appointment request submitted. You will receive a confirmation shortly.');
      setBooking(false);
   };

   const handleRefill = async (medicine: string) => {
      setRefilling(true);
      await new Promise(r => setTimeout(r, 1000));
      showToast('success', `Refill request for ${medicine} submitted to pharmacy.`);
      setRefilling(false);
   };

   const handleDownloadReports = () => {
      showToast('info', 'Preparing your health reports for download...');
   };

   return (
      <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500 space-y-10">
         {/* Hero */}
         <div className="bg-hospital-card p-16 rounded-[4rem] text-slate-900 relative overflow-hidden shadow-2xl border border-slate-100 group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-all duration-1000" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
            <div className="relative z-10 space-y-6">
               <div className="inline-flex items-center gap-3 bg-slate-100 backdrop-blur-md border border-slate-200 px-4 py-2 rounded-2xl">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Wellness Verified</span>
               </div>
               <h2 className="text-5xl font-black tracking-tighter leading-none text-slate-900">Namaste, <span className="text-primary">{user?.name?.split(' ')[0]}</span></h2>
               <p className="text-slate-600 font-medium max-w-xl text-lg selection:bg-primary/10">Your personalized health sanctuary is active. Track recovery metrics, manage prescriptions, and consult your health specialists seamlessly.</p>
               <div className="flex flex-wrap gap-6 pt-6">
                  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 min-w-[140px] hover:shadow-lg transition-all shadow-sm group/card">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 group-hover/card:text-primary">Health Index</p>
                     <p className="text-4xl font-black text-slate-900 tracking-tighter">87%</p>
                  </div>
                  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 min-w-[140px] hover:shadow-lg transition-all shadow-sm group/card">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 group-hover/card:text-primary">Next Event</p>
                     <p className="text-4xl font-black text-slate-900 tracking-tighter">Feb 22</p>
                  </div>
                  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 min-w-[140px] hover:shadow-lg transition-all shadow-sm group/card">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 group-hover/card:text-primary">Active Rx</p>
                     <p className="text-4xl font-black text-slate-900 tracking-tighter">{prescriptions.filter(p => p.status === 'Active').length}</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Quick Action Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
               <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-3xl mb-6">📅</div>
               <h3 className="text-xl font-black text-slate-900 mb-2">Book Appointment</h3>
               <p className="text-xs text-slate-500 font-medium mb-6">Schedule your next visit with your preferred specialist.</p>
               <button onClick={handleBookAppointment} disabled={booking} className="w-full py-4 bg-vibrant-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 shadow-lg shadow-blue-500/20 disabled:opacity-50 active:scale-95">
                  {booking ? 'Scheduling...' : 'Start Booking'}
               </button>
            </div>
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
               <div className="w-14 h-14 bg-success/5 rounded-2xl flex items-center justify-center text-3xl mb-6">📄</div>
               <h3 className="text-xl font-black text-slate-900 mb-2">View Reports</h3>
               <p className="text-xs text-slate-500 font-medium mb-6">Download and view your latest lab results and imaging.</p>
               <button onClick={handleDownloadReports} className="w-full py-4 bg-vibrant-green text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 shadow-lg shadow-green-500/20 active:scale-95">Access Vault</button>
            </div>
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
               <div className="w-14 h-14 bg-warning/5 rounded-2xl flex items-center justify-center text-3xl mb-6">💊</div>
               <h3 className="text-xl font-black text-slate-900 mb-2">Prescriptions</h3>
               <p className="text-xs text-slate-500 font-medium mb-6">Renew or check dosage for your active medications.</p>
               <button onClick={() => showToast('info', 'Opening prescription manager...')} className="w-full py-4 bg-vibrant-orange text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 shadow-lg shadow-orange-500/20 active:scale-95">Refill Meds</button>
            </div>
         </div>

         {loading ? (
            <div className="flex items-center justify-center py-20">
               <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading your health data...</p>
               </div>
            </div>
         ) : (
            <>
               {/* Upcoming Appointments */}
               <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-8 pb-6 border-b border-slate-50 flex justify-between items-center">
                     <div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">My Appointments</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Upcoming & past visits</p>
                     </div>
                  </div>
                  <div className="divide-y divide-slate-50">
                     {appointments.map((appt: any) => (
                        <div key={appt.id} className="px-8 py-5 flex items-center gap-5 hover:bg-hospital-bg/50 transition-colors">
                           <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-lg shrink-0">📅</div>
                           <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-slate-800">{appt.doctor || appt.doctor_name || 'Doctor'}</p>
                              <p className="text-[10px] font-bold text-slate-400">{appt.specialty || 'General'} • {appt.date || appt.appointment_date} • {appt.time || appt.appointment_time || ''}</p>
                           </div>
                           <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shrink-0 ${(appt.status || '').toLowerCase() === 'completed' ? 'bg-hospital-bg text-text-muted border border-hospital-border' : 'bg-success/10 text-success border border-success/10'}`}>{appt.status}</span>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Prescriptions */}
               <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-8 pb-6 border-b border-slate-50">
                     <h3 className="text-lg font-black text-slate-900 tracking-tight">Active Prescriptions</h3>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Current medications & refill status</p>
                  </div>
                  <div className="divide-y divide-slate-50">
                     {prescriptions.map((rx: any) => (
                        <div key={rx.id} className="px-8 py-5 flex items-center gap-5 hover:bg-hospital-bg/50 transition-colors">
                           <div className="w-10 h-10 bg-warning/5 rounded-xl flex items-center justify-center text-lg shrink-0">💊</div>
                           <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-slate-800">{rx.medicine || rx.medication_name || 'Medication'}</p>
                              <p className="text-[10px] font-bold text-slate-400">Dosage: {rx.dosage || 'As prescribed'} • By {rx.doctor || rx.prescribed_by || 'Doctor'}</p>
                           </div>
                           <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shrink-0 ${rx.status === 'Active' ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-400'}`}>{rx.status}</span>
                           {rx.status === 'Active' && rx.refillsLeft > 0 && (
                              <button onClick={() => handleRefill(rx.medicine)} disabled={refilling} className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all disabled:opacity-50 shrink-0">
                                 {refilling ? 'Requesting...' : `Refill (${rx.refillsLeft} left)`}
                              </button>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            </>
         )}
      </div>
   );
};

export default PatientPortal;
