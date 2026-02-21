
import React, { useState, useRef } from 'react';
import { aiService } from '../aiService';
import apiClient from '../apiClient';
import {
  Scan, Camera, Upload, BrainCircuit, X, Check,
  Loader2, Sparkles, User, Calendar, Droplet,
  FileDigit, Phone, CheckCircle2, AlertCircle
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

    // Age Validation
    const ageNum = parseInt(patientData.age);
    if (isNaN(ageNum) || ageNum <= 0) {
      setSaveResult({ success: false, message: 'Please enter a valid positive age.' });
      return;
    }

    // Mobile Validation
    if (!/^\d{10}$/.test(patientData.contact)) {
      setSaveResult({ success: false, message: 'Mobile number must be exactly 10 digits.' });
      return;
    }

    // Govt ID Validation (Aadhar / standard 12-digit format)
    if (patientData.idNumber && !/^\d{12}$/.test(patientData.idNumber)) {
      setSaveResult({ success: false, message: 'Govt ID must be exactly 12 digits.' });
      return;
    }

    setSaving(true);
    setSaveResult(null);
    try {
      // Calculate date_of_birth from age
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

    // Stop camera
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in zoom-in duration-500 max-w-[1600px] mx-auto p-8 pb-48">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-black text-text-main tracking-tight">Quick Registration</h2>
          <p className="text-sm font-medium text-text-muted mt-1">Scan ID cards via camera or file upload to auto-populate patient identity.</p>
        </div>

        {!showCamera ? (
          <div className="bg-hospital-card p-12 rounded-[3rem] border-2 border-dashed border-primary/20 text-center space-y-6 hover:border-primary transition-all group shadow-sm hover:shadow-xl hover:bg-white">
            <div className="w-24 h-24 bg-medical-gradient rounded-3xl flex items-center justify-center mx-auto text-white text-4xl group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
              <Scan size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="font-black text-text-main text-lg">Identity Scan Hub</h3>
              <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed">
                Use your device camera or upload an image. AI will verify and extract patient bio-data.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={startCamera}
                disabled={isScanning}
                className="inline-flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 cursor-pointer shadow-xl transition-all active:scale-95 disabled:opacity-50"
              >
                <Camera size={18} /> Take Live Photo
              </button>

              <input
                type="file"
                id="id-scan"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isScanning}
              />
              <label
                htmlFor="id-scan"
                className="inline-flex items-center justify-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 cursor-pointer shadow-xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {isScanning ? 'AI Extracting...' : 'Upload File'}
              </label>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-2xl overflow-hidden relative shadow-2xl border border-slate-800">
            <video ref={videoRef} autoPlay playsInline className="w-full aspect-video object-cover opacity-90" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-40 border-2 border-primary/50 rounded-xl relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary -mt-1 -ml-1"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary -mt-1 -mr-1"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary -mb-1 -ml-1"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary -mb-1 -mr-1"></div>
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute bottom-6 inset-x-0 flex justify-center gap-4">
              <button
                onClick={() => {
                  const stream = videoRef.current?.srcObject as MediaStream;
                  stream?.getTracks().forEach(t => t.stop());
                  setShowCamera(false);
                }}
                className="px-6 py-2.5 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold text-xs uppercase hover:bg-white/20 transition-colors border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={captureAndScan}
                className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold text-xs uppercase shadow-xl hover:bg-primary/90 transition-colors"
              >
                Capture ID
              </button>
            </div>
          </div>
        )}

        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex items-start gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <h4 className="font-black text-primary text-xs uppercase tracking-widest flex items-center gap-2">
              <BrainCircuit size={14} /> Jeeva Raksha AI Tooltip
            </h4>
            <p className="text-xs text-text-muted mt-1 font-medium leading-relaxed font-kannada">
              “ಡೇಟಾದಿಂದ ನಿರ್ಣಯಕ್ಕೆ” — Data entry reduced by 85% via smart vision recognition.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-hospital-card p-10 rounded-2xl border border-hospital-border shadow-card h-fit">
        <div className="flex items-center justify-between mb-8 border-b border-hospital-border pb-6">
          <h3 className="text-lg font-black text-text-main flex items-center gap-2">
            <User size={20} className="text-primary" /> Extracted Patient Profile
          </h3>
          <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/10">Manual Edit Mode</span>
        </div>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Full Name</label>
              <div className="relative">
                <User size={14} className="absolute left-4 top-3.5 text-text-muted" />
                <input
                  value={patientData.name}
                  onChange={e => setPatientData({ ...patientData, name: e.target.value })}
                  className="w-full bg-hospital-input border border-hospital-border rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Extracted Name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Age</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-4 top-3.5 text-text-muted" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={patientData.age}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPatientData({ ...patientData, age: val });
                  }}
                  className="w-full bg-hospital-input border border-hospital-border rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Ex. 25"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Gender</label>
              <select
                value={patientData.gender}
                onChange={e => setPatientData({ ...patientData, gender: e.target.value })}
                className="w-full bg-hospital-input border border-hospital-border rounded-xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Blood Group</label>
              <div className="relative">
                <Droplet size={14} className="absolute left-4 top-3.5 text-text-muted z-10" />
                <select
                  value={patientData.bloodGroup}
                  onChange={e => setPatientData({ ...patientData, bloodGroup: e.target.value })}
                  className="w-full bg-hospital-input border border-hospital-border rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-1 focus:ring-primary/20 outline-none transition-all appearance-none"
                >
                  <option value="">Select Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
                <div className="absolute right-4 top-4 pointer-events-none opacity-50">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Govt ID (12 Digits)</label>
            <div className="relative">
              <FileDigit size={14} className="absolute left-4 top-3.5 text-text-muted" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={12}
                value={patientData.idNumber}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                  setPatientData({ ...patientData, idNumber: val });
                }}
                className="w-full bg-hospital-input border border-hospital-border rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                placeholder="12 Digit Identity No."
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Primary Contact (10 Digits)</label>
            <div className="relative">
              <Phone size={14} className="absolute left-4 top-3.5 text-text-muted" />
              <input
                type="text"
                inputMode="tel"
                maxLength={10}
                value={patientData.contact}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPatientData({ ...patientData, contact: val });
                }}
                className="w-full bg-hospital-input border border-hospital-border rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                placeholder="10 Digit Mobile No."
              />
            </div>
          </div>
          <button
            onClick={handleCheckIn}
            disabled={saving}
            className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl mt-8 hover:bg-blue-700 shadow-2xl shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            {saving ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
            <span className="text-sm uppercase tracking-widest">{saving ? 'Processing Registration...' : 'Complete Final Check-In'}</span>
          </button>
          {saveResult && (
            <div className={`mt-3 p-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 ${saveResult.success ? 'bg-success/5 text-success border border-success/10' : 'bg-danger/5 text-danger border border-danger/10'
              }`}>
              {saveResult.success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {saveResult.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OPDManagement;
