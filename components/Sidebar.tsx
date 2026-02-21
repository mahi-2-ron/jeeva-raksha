import React from 'react';
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
  ArrowLeft
} from 'lucide-react';

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

interface NavCategory {
  titleKey: string;
  items: { id: ViewType; icon: React.ReactNode }[];
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
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
    }
  };

  return (
    <aside className="w-66 bg-white text-slate-600 flex flex-col border-r border-blue-100 h-screen transition-all duration-300 z-50 shadow-xl shadow-blue-900/5">
      <div
        onClick={() => setActiveView('HOME')}
        className="h-24 flex items-center gap-4 px-6 border-b border-blue-50 cursor-pointer hover:bg-blue-50/30 transition-all relative overflow-hidden group bg-gradient-to-r from-blue-50 to-white"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <Logo size={48} className="shrink-0 relative z-10" />
        <div className="overflow-hidden relative z-10">
          <h2 className="text-slate-900 font-black text-lg tracking-tighter leading-none group-hover:scale-105 transition-transform">{t('brand')}</h2>
          <p className="text-[10px] font-black text-primary mt-1 font-kannada whitespace-nowrap tracking-[0.2em] uppercase opacity-80">Universal Health Hub</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pt-8 pb-10 bg-gradient-to-b from-white to-blue-50/20">
        {categories.map((cat, idx) => (
          <div key={idx} className="mb-10 px-4">
            <h3 className="px-4 mb-4 text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="w-3 h-0.5 rounded-full bg-primary/40"></span>
              {t(cat.titleKey)}
            </h3>
            <div className="px-3 space-y-0.5">
              {cat.items.map((item) => {
                const label = t('', item.id);
                const accessible = hasModuleAccess(item.id);
                const requiredLevel = getModuleRequiredLevel(item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    disabled={!accessible}
                    title={!accessible ? `Requires ${requiredLevel} access` : undefined}
                    className={`w-full group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${!accessible
                      ? 'opacity-20 cursor-not-allowed'
                      : activeView === item.id
                        ? 'bg-blue-600 text-white font-black shadow-2xl shadow-blue-500/30 scale-[1.05]'
                        : 'hover:bg-blue-50 text-slate-500 hover:text-blue-600'
                      }`}
                  >
                    <span className={`${accessible ? (activeView === item.id ? 'text-white' : 'text-blue-500 group-hover:scale-125 transition-transform') : 'grayscale opacity-50'}`}>{item.icon}</span>
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
            onClick={() => setActiveView('HOME')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-500 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Return Home</span>
          </button>
        </div>

        <button
          onClick={() => (window as any).dispatchSetShowOverrideModal?.(true)}
          className="w-full py-3.5 bg-white text-red-600 border-2 border-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3 group shadow-lg shadow-red-600/10"
        >
          <ShieldAlert size={16} className="text-red-600 group-hover:text-white animate-pulse" />
          <span>Emergency Request</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
