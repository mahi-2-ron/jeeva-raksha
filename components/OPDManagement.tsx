
import React, { useState, useRef } from 'react';
import { aiService } from '../aiService';
import api from '../api';

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
    setSaving(true);
    setSaveResult(null);
    try {
      // Calculate date_of_birth from age
      const dob = patientData.age
        ? new Date(Date.now() - parseInt(patientData.age) * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      const patient = await api.createPatient({
        name: patientData.name,
        date_of_birth: dob,
        gender: patientData.gender,
        blood_group: patientData.bloodGroup || null,
        phone: patientData.contact || null,
      });
      setSaveResult({ success: true, message: `✅ Patient registered: ${patient.uhid}` });
      setPatientData({ name: '', age: '', gender: '', idNumber: '', contact: '', bloodGroup: '' });
    } catch (err: any) {
      setSaveResult({ success: false, message: `❌ ${err.message}` });
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in zoom-in duration-500">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Quick Registration</h2>
          <p className="text-sm font-medium text-slate-500">Scan ID cards via camera or file upload to auto-populate patient identity.</p>
        </div>

        {!showCamera ? (
          <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center space-y-6 hover:border-primary/50 transition-all group">
            <div className="w-20 h-20 bg-hospital-bg rounded-[2rem] flex items-center justify-center mx-auto text-primary text-3xl group-hover:scale-110 transition-transform">
              🪪
            </div>
            <div className="space-y-2">
              <h3 className="font-black text-slate-800">Identity Scan Hub</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Use your device camera or upload an image. AI will verify and extract patient bio-data.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={startCamera}
                disabled={isScanning}
                className="inline-flex bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 cursor-pointer shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                📸 Open Camera
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
                className="inline-flex bg-primary text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 cursor-pointer shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isScanning ? '🤖 AI Extracting...' : '📁 Upload File'}
              </label>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden relative shadow-2xl">
            <video ref={videoRef} autoPlay playsInline className="w-full aspect-video object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute bottom-6 inset-x-0 flex justify-center gap-4">
              <button
                onClick={() => {
                  const stream = videoRef.current?.srcObject as MediaStream;
                  stream?.getTracks().forEach(t => t.stop());
                  setShowCamera(false);
                }}
                className="px-6 py-2 bg-white/20 backdrop-blur-md text-white rounded-xl font-bold text-xs uppercase"
              >
                Cancel
              </button>
              <button
                onClick={captureAndScan}
                className="px-8 py-2 bg-primary text-white rounded-xl font-bold text-xs uppercase shadow-xl"
              >
                Capture ID
              </button>
            </div>
          </div>
        )}

        <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 flex items-start gap-4">
          <div className="text-2xl">✨</div>
          <div>
            <h4 className="font-black text-primary text-sm uppercase tracking-widest">Jeeva Raksha AI Tooltip</h4>
            <p className="text-xs text-primary/80 mt-1 font-medium leading-relaxed font-kannada">
              “ಡೇಟಾದಿಂದ ನಿರ್ಣಯಕ್ಕೆ” — Data entry reduced by 85% via smart vision recognition.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
        <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
          <h3 className="text-lg font-black text-slate-800">Extracted Patient Profile</h3>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">Manual Edit Mode</span>
        </div>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
              <input
                value={patientData.name}
                onChange={e => setPatientData({ ...patientData, name: e.target.value })}
                className="w-full bg-hospital-bg border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Age</label>
              <input
                value={patientData.age}
                onChange={e => setPatientData({ ...patientData, age: e.target.value })}
                className="w-full bg-hospital-bg border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Gender</label>
              <select
                value={patientData.gender}
                onChange={e => setPatientData({ ...patientData, gender: e.target.value })}
                className="w-full bg-hospital-bg border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-primary/20 outline-none"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Blood Group</label>
              <input
                value={patientData.bloodGroup}
                onChange={e => setPatientData({ ...patientData, bloodGroup: e.target.value })}
                className="w-full bg-hospital-bg border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Govt ID / Insurance No.</label>
            <input
              value={patientData.idNumber}
              onChange={e => setPatientData({ ...patientData, idNumber: e.target.value })}
              className="w-full bg-hospital-bg border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-primary/20 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Primary Contact</label>
            <input
              value={patientData.contact}
              onChange={e => setPatientData({ ...patientData, contact: e.target.value })}
              className="w-full bg-hospital-bg border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-primary/20 outline-none"
            />
          </div>
          <button
            onClick={handleCheckIn}
            disabled={saving}
            className="w-full bg-primary text-white font-black py-4 rounded-2xl mt-4 hover:bg-blue-700 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? '⏳ Registering...' : 'Complete Final Check-In'}
          </button>
          {saveResult && (
            <div className={`mt-3 p-3 rounded-xl text-xs font-bold text-center ${saveResult.success ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
              }`}>
              {saveResult.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OPDManagement;
