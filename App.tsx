
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Home from './components/Home.tsx';
import Dashboard from './components/Dashboard.tsx';
import OPDManagement from './components/OPDManagement.tsx';
import IPDManagement from './components/IPDManagement.tsx';
import Emergency from './components/Emergency.tsx';
import OTManagement from './components/OTManagement.tsx';
import DoctorPad from './components/DoctorPad.tsx';
import Laboratory from './components/LabAnalytics.tsx';
import Radiology from './components/Radiology.tsx';
import BedManagement from './components/BedManagement.tsx';
import BillingInventory from './components/BillingInventory.tsx';
import Reports from './components/Reports.tsx';
import ModuleDashboard from './components/ModuleDashboard.tsx';
import Footer from './components/Footer.tsx';
import LanguageToggle from './components/LanguageToggle.tsx';
import Patients from './components/Patients.tsx';
import PatientPortal from './components/PatientPortal.tsx';
import EmergencyOverride from './components/EmergencyOverride.tsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.tsx';
import { AuthProvider, useAuth, ROLES } from './context/AuthContext.tsx';
import { ViewType } from './types.ts';

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('HOME');
  const [isLoading, setIsLoading] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);

  const { t } = useLanguage();
  const { user, currentPermissions, overrideState, remainingOverrideTime, deactivateOverride, changeRole } = useAuth();

  useEffect(() => {
    setHasKey(true);
  }, []);



  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [activeView]);

  const renderView = () => {
    switch (activeView) {
      case 'HOME': return <Home onNavigate={setActiveView} />;
      case 'DASHBOARD': return <Dashboard />;
      case 'OPD': return <OPDManagement />;
      case 'IPD': return <IPDManagement />;
      case 'EMERGENCY': return <Emergency />;
      case 'OT': return <OTManagement />;
      case 'ROUNDS': return <DoctorPad />;
      case 'LABORATORY': return <Laboratory />;
      case 'RADIOLOGY': return <Radiology />;
      case 'BEDS': return <BedManagement />;
      case 'BILLING': return <BillingInventory />;
      case 'ANALYTICS': return <Reports />;
      case 'PATIENTS': return <Patients />;
      case 'PORTAL': return <PatientPortal />;

      case 'EMR':
      case 'PHARMACY':
      case 'INVENTORY':
      case 'INSURANCE':
      case 'HR':
      case 'QUALITY':
      case 'INTEGRATIONS_DEVICES':
      case 'INTEGRATIONS_GOVT':
        return <ModuleDashboard view={activeView} />;

      default: return <Home onNavigate={setActiveView} />;
    }
  };

  const isHome = activeView === 'HOME';




  return (
    <div className="flex min-h-screen bg-hospital-bg font-sans">
      {!isHome && <Sidebar activeView={activeView} setActiveView={setActiveView} />}

      <main className={`flex-1 h-screen relative flex flex-col overflow-hidden ${isHome ? 'w-full' : 'bg-hospital-bg'}`}>
        {overrideState.active && (() => {
          const mins = Math.floor(remainingOverrideTime / 60);
          const secs = remainingOverrideTime % 60;
          const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
          const isUrgent = remainingOverrideTime < 120;
          return (
            <div className={`text-white py-1.5 px-4 flex justify-between items-center z-[60] transition-colors ${isUrgent ? 'bg-red-800 animate-pulse' : 'bg-danger'
              }`}>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <span>🚨 CRITICAL OVERRIDE ACTIVE</span>
                <span className={`font-mono px-2 py-0.5 rounded-md text-[10px] ${isUrgent ? 'bg-white/30 text-white' : 'bg-white/15 text-white/90'
                  }`}>{timeStr}</span>
              </span>
              <button
                onClick={deactivateOverride}
                className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-4 py-0.5 rounded-full hover:bg-white/30 transition-all"
              >
                Exit Override
              </button>
            </div>
          );
        })()}

        {!isHome && (
          <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-white/80 backdrop-blur-md px-8 shadow-sm shrink-0">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveView('HOME')}
                  className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-primary transition-colors cursor-pointer"
                >
                  {t('home')}
                </button>
                <span className="text-slate-200">/</span>
                <span className={`text-[10px] font-black text-primary uppercase tracking-widest ${t('', activeView).match(/[\u0C80-\u0CFF]/) ? 'font-kannada' : ''}`}>
                  {t('', activeView)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-100 p-1 rounded-xl">
                {(Object.values(ROLES)).map(role => (
                  <button
                    key={role}
                    onClick={() => changeRole(role as any)}
                    className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${user.role === role ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'
                      }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              {!overrideState.active && (
                <button
                  onClick={() => setShowOverrideModal(true)}
                  className="px-4 py-2 border border-danger/20 text-danger rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-danger hover:text-white transition-all"
                >
                  Emergency Override
                </button>
              )}

              <LanguageToggle />

              <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-black text-slate-800 leading-tight">{user.name}</p>
                  <p className={`text-[8px] font-black uppercase tracking-tighter ${overrideState.active ? 'text-danger' : 'text-primary'}`}>
                    {currentPermissions} LEVEL
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black border shadow-inner shrink-0 ${overrideState.active ? 'bg-danger/10 text-danger border-danger/20 animate-pulse' : 'bg-primary/10 text-primary border-primary/20'
                  }`}>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
            </div>
          </header>
        )}

        <div className={`flex-1 overflow-y-auto custom-scrollbar flex flex-col ${isHome ? '' : 'relative'}`}>
          <div className={isHome ? '' : 'p-8 pb-12 flex-1'}>
            {isLoading && !isHome && (
              <div className="absolute inset-0 z-50 bg-hospital-bg/50 backdrop-blur-[2px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Module...</p>
                </div>
              </div>
            )}
            {renderView()}
          </div>
          <Footer />
        </div>
      </main>

      {showOverrideModal && <EmergencyOverride onClose={() => setShowOverrideModal(false)} />}
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  </AuthProvider>
);

export default App;
