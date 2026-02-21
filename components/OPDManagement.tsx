import React, { useState, useRef } from 'react';
import { aiService } from '../aiService';
import apiClient from '../apiClient';
import {
  Scan, Camera, Upload, BrainCircuit, X, Check,
  Loader2, Sparkles, User, Calendar, Droplet,
  FileDigit, Phone, CheckCircle2, AlertCircle, ChevronRight
} from 'lucide-react';

const OPDManagement: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [patientData, setPatientData] = useState({
    name: '',
    age: '',
    gender: '',
    idNumber: '',
    contact: '',
    bloodGroup: ''
  });

  const handleCheckIn = async () => {
    if (!patientData.name || !patientData.gender) {
      setSaveResult({ success: false, message: 'Name and Gender are required.' });
      return;
    }

    const ageNum = parseInt(patientData.age);
    if (isNaN(ageNum) || ageNum <= 0) {
      setSaveResult({ success: false, message: 'Please enter a valid positive age.' });
      return;
    }

    if (!/^\d{10}$/.test(patientData.contact)) {
      setSaveResult({ success: false, message: 'Mobile number must be exactly 10 digits.' });
      return;
    }

    if (patientData.idNumber && !/^\d{12}$/.test(patientData.idNumber)) {
      setSaveResult({ success: false, message: 'Govt ID must be exactly 12 digits.' });
      return;
    }

    setSaving(true);
    setSaveResult(null);
    try {
      const dob = patientData.age
        ? new Date(Date.now() - parseInt(patientData.age) * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      const patient = await apiClient.createPatient({
        name: patientData.name,
        date_of_birth: dob,
        gender: patientData.gender,
        blood_group: patientData.bloodGroup || null,
        phone: patientData.contact || null,
      });
      setSaveResult({ success: true, message: `Patient registered: ${patient.uhid}` });
      setPatientData({ name: '', age: '', gender: '', idNumber: '', contact: '', bloodGroup: '' });
    } catch (err: any) {
      setSaveResult({ success: false, message: `${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const extracted = await aiService.extractPatientFromID(base64);
        setPatientData(prev => ({ ...prev, ...extracted }));
      } catch (err) {
        console.error(err);
        alert("OCR Scan failed. Please enter details manually.");
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Could not access camera. Please check permissions.");
      setShowCamera(false);
    }
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsScanning(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);

    const base64 = canvas.toDataURL('image/jpeg').split(',')[1];

    const stream = video.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
    setShowCamera(false);

    try {
      const extracted = await aiService.extractPatientFromID(base64);
      setPatientData(prev => ({ ...prev, ...extracted }));
    } catch (err) {
      console.error(err);
      alert("AI Scan failed. Please try a clearer photo.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-500 max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 md:space-y-12 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">OPD Rapid Check-in</h2>
          <p className="text-xs md:text-sm font-bold text-slate-400 mt-2 font-kannada">“ತ್ವರಿತ ನೋಂದಣಿ — ಸುಗಮ ಸೇವೆ”</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live AI Vision Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        <div className="space-y-8">
          {!showCamera ? (
            <div className="bg-white p-8 md:p-12 rounded-[3rem] border-2 border-dashed border-slate-200 text-center space-y-8 hover:border-primary/50 transition-all group shadow-sm hover:shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="w-20 h-20 md:w-24 md:h-24 bg-medical-gradient rounded-[2rem] flex items-center justify-center mx-auto text-white text-3xl md:text-4xl group-hover:scale-110 transition-transform shadow-xl shadow-primary/20">
                <Scan size={40} />
              </div>
              <div className="space-y-3">
                <h3 className="font-black text-slate-900 text-lg md:text-xl tracking-tight leading-none">Smart Identity Hub</h3>
                <p className="text-xs md:text-sm text-slate-400 max-w-xs mx-auto leading-relaxed font-medium">
                  Automate bio-data extraction from Government IDs. Zero contact, zero errors.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <button
                  onClick={startCamera}
                  disabled={isScanning}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 shadow-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  <Camera size={18} /> Take Live Photo
                </button>

                <input type="file" id="id-scan" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isScanning} />
                <label
                  htmlFor="id-scan"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-3 bg-primary text-white px-8 py-4 px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-800 cursor-pointer shadow-xl shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {isScanning ? 'Synchronizing...' : 'Upload Asset'}
                </label>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden relative shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-300">
              <video ref={videoRef} autoPlay playsInline className="w-full aspect-[4/3] md:aspect-video object-cover opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-10">
                <div className="w-full h-full max-w-sm max-h-56 border-2 border-white/20 rounded-3xl relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary -mt-1 -ml-1 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary -mt-1 -mr-1 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary -mb-1 -ml-1 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary -mb-1 -mr-1 rounded-br-xl" />
                </div>
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute bottom-8 inset-x-0 flex justify-center gap-4 px-6">
                <button
                  onClick={() => {
                    const stream = videoRef.current?.srcObject as MediaStream;
                    stream?.getTracks().forEach(t => t.stop());
                    setShowCamera(false);
                  }}
                  className="px-6 py-4 bg-white/10 backdrop-blur-xl text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-white/20 transition-all border border-white/10"
                >
                  <X size={16} /> Cancel
                </button>
                <button
                  onClick={captureAndScan}
                  className="flex-1 md:flex-none px-10 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/40 hover:bg-teal-800 active:scale-95 transition-all"
                >
                  Extract Data
                </button>
              </div>
            </div>
          )}

          <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 flex items-start gap-5 group hover:bg-primary/10 transition-all">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shrink-0 shadow-sm border border-primary/10 group-hover:rotate-12 transition-transform">
              <Sparkles size={24} />
            </div>
            <div>
              <h4 className="font-black text-primary text-[10px] uppercase tracking-widest flex items-center gap-2 mb-1.5">
                <BrainCircuit size={14} /> Cognitive Intelligence
              </h4>
              <p className="text-xs text-slate-500 mt-1 font-bold leading-relaxed font-kannada">
                "ದತ್ತಾಂಶ ದೃಢೀಕರಣ" — AI validates records against the central clinical repository in real-time.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-xl h-fit space-y-10">
          <div className="flex items-center justify-between border-b border-slate-50 pb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <User size={24} className="text-primary" /> Profile Manifest
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Review & Local Validation</p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[9px] font-black text-slate-500 uppercase">Ready</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Legal Identity</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                  <input
                    value={patientData.name}
                    onChange={e => setPatientData({ ...patientData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-xs font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300"
                    placeholder="Extracted Full Name"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Observed Age</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={patientData.age}
                    onChange={e => setPatientData({ ...patientData, age: e.target.value.replace(/\D/g, '') })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-xs font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    placeholder="Ex. 28"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Biological Sex</label>
                <select
                  value={patientData.gender}
                  onChange={e => setPatientData({ ...patientData, gender: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all cursor-pointer appearance-none"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Critical Blood Type</label>
                <div className="relative">
                  <Droplet size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400" />
                  <select
                    value={patientData.bloodGroup}
                    onChange={e => setPatientData({ ...patientData, bloodGroup: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-xs font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select Marker</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Govt ID Reference (Aadhar)</label>
              <div className="relative">
                <FileDigit size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="text"
                  maxLength={12}
                  value={patientData.idNumber}
                  onChange={e => setPatientData({ ...patientData, idNumber: e.target.value.replace(/\D/g, '') })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-xs font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  placeholder="12 Digit Identification Number"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Primary Telecom Marker</label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="text"
                  maxLength={10}
                  value={patientData.contact}
                  onChange={e => setPatientData({ ...patientData, contact: e.target.value.replace(/\D/g, '') })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-xs font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  placeholder="Mobile Connectivity"
                />
              </div>
            </div>

            <button
              onClick={handleCheckIn}
              disabled={saving}
              className="w-full bg-primary text-white font-black py-5 rounded-[2rem] mt-4 hover:bg-teal-800 shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden group text-sm uppercase tracking-widest"
            >
              {saving ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
              {saving ? 'Synchronizing Cluster...' : 'Commit Check-in'}
            </button>

            {saveResult && (
              <div className={`mt-4 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2 animate-in slide-in-from-top-2 duration-300 ${saveResult.success ? 'bg-success/5 text-success border border-success/10' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                {saveResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {saveResult.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OPDManagement;
