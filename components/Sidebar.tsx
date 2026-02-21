import React, { useEffect } from 'react';
import { ViewType } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import Logo from './Logo.tsx';
import LanguageToggle from './LanguageToggle.tsx';
import {
  LayoutDashboard, Stethoscope, Bed, Activity, Scissors,
  FileText, ClipboardList, Globe, Users, TestTube,
  ScanLine, Pill, Package, CreditCard, Shield,
  UserCog, BedDouble, BarChart3, CheckCircle2,
  Cpu, Landmark, Home, Lock, ShieldAlert,
  ArrowLeft, X
} from 'lucide-react';

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavCategory {
  titleKey: string;
  items: { id: ViewType; icon: React.ReactNode }[];
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, onClose }) => {
  const { t } = useLanguage();
  const { hasModuleAccess, getModuleRequiredLevel, logModuleAccess } = useAuth();

  const categories: NavCategory[] = [
    {
      titleKey: 'categories.CLINICAL_OPS',
      items: [
        { id: 'DASHBOARD', icon: <LayoutDashboard size={18} /> },
        { id: 'OPD', icon: <Stethoscope size={18} /> },
        { id: 'IPD', icon: <Bed size={18} /> },
        { id: 'EMERGENCY', icon: <Activity size={18} /> },
        { id: 'OT', icon: <Scissors size={18} /> },
      ]
    },
    {
      titleKey: 'categories.PATIENT_CARE',
      items: [
        { id: 'EMR', icon: <FileText size={18} /> },
        { id: 'ROUNDS', icon: <ClipboardList size={18} /> },
        { id: 'PORTAL', icon: <Globe size={18} /> },
        { id: 'PATIENTS', icon: <Users size={18} /> },
      ]
    },
    {
      titleKey: 'categories.DIAGNOSTICS',
      items: [
        { id: 'LABORATORY', icon: <TestTube size={18} /> },
        { id: 'RADIOLOGY', icon: <ScanLine size={18} /> },
      ]
    },
    {
      titleKey: 'categories.PHARMACY_SUPPLIES',
      items: [
        { id: 'PHARMACY', icon: <Pill size={18} /> },
        { id: 'INVENTORY', icon: <Package size={18} /> },
      ]
    },
    {
      titleKey: 'categories.FINANCIAL_OPS',
      items: [
        { id: 'BILLING', icon: <CreditCard size={18} /> },
        { id: 'INSURANCE', icon: <Shield size={18} /> },
      ]
    },
    {
      titleKey: 'categories.WORKFORCE_ADMIN',
      items: [
        { id: 'HR', icon: <UserCog size={18} /> },
        { id: 'BEDS', icon: <BedDouble size={18} /> },
      ]
    },
    {
      titleKey: 'categories.INSIGHTS_GOV',
      items: [
        { id: 'ANALYTICS', icon: <BarChart3 size={18} /> },
        { id: 'QUALITY', icon: <CheckCircle2 size={18} /> },
      ]
    },
    {
      titleKey: 'categories.INTEGRATIONS',
      items: [
        { id: 'INTEGRATIONS_DEVICES', icon: <Cpu size={18} /> },
        { id: 'INTEGRATIONS_GOVT', icon: <Landmark size={18} /> },
      ]
    }
  ];

  const handleNavClick = (id: ViewType) => {
    if (hasModuleAccess(id)) {
      logModuleAccess(id);
      setActiveView(id);
      if (onClose) onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside className={`fixed md:relative w-72 bg-white text-slate-600 flex flex-col border-r border-slate-100 h-screen transition-all duration-300 z-[110] md:z-50 shadow-2xl md:shadow-xl shadow-blue-900/5 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div
          onClick={() => { setActiveView('HOME'); if (onClose) onClose(); }}
          className="h-24 flex items-center gap-4 px-6 border-b border-slate-50 cursor-pointer hover:bg-blue-50/30 transition-all relative overflow-hidden group bg-gradient-to-r from-blue-50 to-white"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <Logo size={48} className="shrink-0 relative z-10" />
          <div className="overflow-hidden relative z-10 flex-1">
            <h2 className="text-slate-900 font-black text-lg tracking-tighter leading-none group-hover:scale-105 transition-transform">Jeeva Raksha</h2>
            <p className="text-[10px] font-black text-blue-600 mt-1 font-kannada whitespace-nowrap tracking-[0.2em] uppercase opacity-80 underline decoration-blue-600/20">Universal Health Hub</p>
          </div>
          <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:text-danger active:scale-95 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pt-8 pb-10 bg-gradient-to-b from-white to-blue-50/20">
          {categories.map((cat, idx) => (
            <div key={idx} className="mb-10 px-4">
              <h3 className="px-5 mb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <span className="w-3 h-0.5 rounded-full bg-blue-600/40"></span>
                {t(cat.titleKey)}
              </h3>
              <div className="px-3 space-y-0.5">
                {cat.items.map((item) => {
                  const label = t('', item.id);
                  const accessible = hasModuleAccess(item.id);
                  const requiredLevel = getModuleRequiredLevel(item.id);
                  const isActive = activeView === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      disabled={!accessible}
                      title={!accessible ? `Requires ${requiredLevel} access` : undefined}
                      className={`w-full group relative flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-300 ${!accessible
                        ? 'opacity-20 cursor-not-allowed'
                        : isActive
                          ? 'bg-blue-50 text-blue-600 font-bold'
                          : 'hover:bg-slate-50 text-slate-500 hover:text-blue-600'
                        }`}
                    >
                      {isActive && <div className="absolute left-0 top-2 bottom-2 w-1.5 bg-blue-600 rounded-r-full" />}
                      <span className={`${accessible ? (isActive ? 'text-blue-600' : 'text-blue-500 group-hover:scale-110 transition-transform') : 'grayscale opacity-50'}`}>{item.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden flex-1 text-left">
                        {label}
                      </span>
                      {!accessible && (
                        <Lock size={12} className="opacity-40 text-slate-300" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-blue-50 bg-white space-y-3">
          <div className="flex items-center justify-between gap-2 px-2">
            <LanguageToggle />
            <button
              onClick={() => { setActiveView('HOME'); if (onClose) onClose(); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-500 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              <span>Return Home</span>
            </button>
          </div>

          <button
            onClick={() => (window as any).dispatchSetShowOverrideModal?.(true)}
            className="w-full py-4 bg-white text-red-600 border-2 border-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3 group shadow-lg shadow-red-600/10 active:scale-95"
          >
            <ShieldAlert size={16} className="text-red-600 group-hover:text-white animate-pulse" />
            <span>Emergency Request</span>
          </button>
        </div>

        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        `}</style>
      </aside>
    </>
  );
};

export default Sidebar;
