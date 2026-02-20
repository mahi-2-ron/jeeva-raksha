
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { OVERRIDE_DURATION_SECONDS } from '../types.ts';

interface EmergencyOverrideProps {
  onClose: () => void;
}

const EmergencyOverride: React.FC<EmergencyOverrideProps> = ({ onClose }) => {
  const { triggerEmergencyOverride } = useAuth();
  const [reason, setReason] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  const durationMinutes = Math.floor(OVERRIDE_DURATION_SECONDS / 60);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 10 || !acknowledged) return;
    triggerEmergencyOverride(reason);
    onClose();
  };

  const canSubmit = reason.trim().length >= 10 && acknowledged;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl space-y-6">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-inner animate-pulse">🚨</div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Emergency Access Request</h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Activating this override will grant full <span className="text-red-600 font-bold">Administrative privileges</span> for <span className="font-bold text-slate-800">{durationMinutes} minutes</span>.
          </p>
        </div>

        {/* Warning Banner */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-red-600 text-sm">⚠️</span>
            <span className="text-[9px] font-black text-red-700 uppercase tracking-widest">Audit Notice</span>
          </div>
          <p className="text-[10px] text-red-700 leading-relaxed font-medium">
            This action is <span className="font-bold">permanently logged</span>. The override will <span className="font-bold">auto-expire after {durationMinutes} minutes</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Reason for Override (Min 10 chars)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the clinical emergency..."
              className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-medium h-24 focus:ring-2 focus:ring-red-500/20 outline-none resize-none"
              required
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-2 border-slate-300 text-red-600 focus:ring-red-500/30 accent-red-600 shrink-0 cursor-pointer"
            />
            <span className="text-[10px] text-slate-600 font-semibold leading-relaxed group-hover:text-slate-800 transition-colors">
              I confirm this is a <span className="text-red-600 font-bold">medical emergency</span> and I accept full accountability.
            </span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-slate-100 text-slate-500 rounded-xl font-black text-[10px] uppercase transition-all hover:bg-slate-200">Cancel</button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${canSubmit
                  ? 'bg-white text-red-600 border-2 border-red-600 hover:bg-red-600 hover:text-white shadow-red-600/10'
                  : 'bg-slate-50 text-slate-300 border-2 border-slate-100 cursor-not-allowed opacity-50'
                }`}
            >
              Activate STAT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmergencyOverride;
