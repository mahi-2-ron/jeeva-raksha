
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Home from './components/Home.tsx';
import LandingPage from './components/LandingPage.tsx';
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
import Footer from './components/Footer.tsx';
import LanguageToggle from './components/LanguageToggle.tsx';
import Patients from './components/Patients.tsx';
import PatientPortal from './components/PatientPortal.tsx';
import EmergencyOverride from './components/EmergencyOverride.tsx';
import EMRManagement from './components/EMRManagement.tsx';
import PharmacyManagement from './components/PharmacyManagement.tsx';
import InventoryManagement from './components/InventoryManagement.tsx';
import InsuranceManagement from './components/InsuranceManagement.tsx';
import HRManagement from './components/HRManagement.tsx';
import QualityManagement from './components/QualityManagement.tsx';
import DeviceIntegrations from './components/DeviceIntegrations.tsx';
import GovtIntegrations from './components/GovtIntegrations.tsx';
import LoginPage from './components/LoginPage.tsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.tsx';
import { AuthProvider, useAuth, ROLES, ROLE_DEFAULT_VIEW } from './context/AuthContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { ViewType } from './types.ts';
import { Eye, LogOut, AlertTriangle, Hospital, Loader2, Home as HomeIcon } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>(() => {
    const hash = window.location.hash.replace('#/', '').toUpperCase();
    return (hash as ViewType) || 'HOME';
  });

  // Sync state to URL Hash
  useEffect(() => {
    const currentHash = window.location.hash.replace('#/', '').toUpperCase();
    if (currentHash !== activeView) {
      window.location.hash = `#/${activeView.toLowerCase()}`;
    }
  }, [activeView]);

  // Handle browser back/forward and manual URL entry
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').toUpperCase();
      if (hash && hash !== activeView) {
        setActiveView(hash as ViewType);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeView]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);

  // Expose global dispatcher for the override modal
  useEffect(() => {
    (window as any).dispatchSetShowOverrideModal = (val: boolean) => setShowOverrideModal(val);
    return () => { delete (window as any).dispatchSetShowOverrideModal; };
  }, []);
  const [loginError, setLoginError] = useState('');

  const { t } = useLanguage();
  const {
    user, isAuthenticated, isLoading: authLoading, isDemo,
    login, loginAsDemo, logout,
    currentPermissions, overrideState, remainingOverrideTime,
    deactivateOverride, changeRole
  } = useAuth();

  useEffect(() => {
    setHasKey(true);
  }, []);

  // Set default view based on role after login
  useEffect(() => {
    if (isAuthenticated && user) {
      const defaultView = ROLE_DEFAULT_VIEW[user.role] || 'DASHBOARD';
      setActiveView(defaultView);
    }
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [activeView]);

  // ─── Login handlers ────────────────────────────────────────
  const handleLogin = async (email: string, password: string, remember: boolean) => {
    setLoginError('');
    try {
      await login(email, password, remember);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
      throw err; // re-throw for shake animation
    }
  };

  const handleDemoLogin = async (role: string) => {
    setLoginError('');
    try {
      await loginAsDemo(role);
    } catch (err: any) {
      setLoginError(err.message || 'Demo login failed');
    }
  };

  // ─── Show loading spinner while checking saved token ───────
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-soft-blue gap-5">
        <div className="w-20 h-20 rounded-[2rem] bg-white shadow-2xl flex items-center justify-center border border-hospital-border animate-in zoom-in duration-500">
          <Hospital size={40} className="text-primary" />
        </div>
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Initializing System...</p>
      </div>
    );
  }

  // ─── Authentication Gateway ───────────────────────────────
  // If not authenticated AND not looking at the Landing Page, force login
  if (!isAuthenticated && activeView !== 'HOME') {
    return (
      <LoginPage
        onLogin={handleLogin}
        onDemoLogin={handleDemoLogin}
        error={loginError}
        isLoading={authLoading}
      />
    );
  }

  // ─── Main app (authenticated) ─────────────────────────────
  const renderView = () => {
    switch (activeView) {
      case 'HOME': return <LandingPage onNavigate={setActiveView} onAdminLogin={async () => { await handleDemoLogin('admin'); setActiveView('DASHBOARD'); }} />;
      case 'DASHBOARD': return <Home onNavigate={setActiveView} />;
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
      case 'EMR': return <EMRManagement />;
      case 'PHARMACY': return <PharmacyManagement />;
      case 'INVENTORY': return <InventoryManagement />;
      case 'INSURANCE': return <InsuranceManagement />;
      case 'HR': return <HRManagement />;
      case 'QUALITY': return <QualityManagement />;
      case 'INTEGRATIONS_DEVICES': return <DeviceIntegrations />;
      case 'INTEGRATIONS_GOVT': return <GovtIntegrations />;
      default: return <Home onNavigate={setActiveView} />;
    }
  };

  const isHome = activeView === 'HOME';

  return (
    <div className="flex min-h-screen bg-sky-50 font-sans text-text-body relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(at_0%_0%,rgba(37,99,235,0.1)_0,transparent_50%),radial-gradient(at_50%_0%,rgba(14,165,233,0.1)_0,transparent_50%),radial-gradient(at_100%_0%,rgba(22,163,74,0.1)_0,transparent_50%)] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mb-64 pointer-events-none" />
      {!isHome && <Sidebar activeView={activeView} setActiveView={setActiveView} />}

      <main className={`flex-1 h-screen relative flex flex-col overflow-hidden ${isHome ? 'w-full' : ''}`}>

        {/* Demo Mode Banner */}
        {isDemo && (
          <div className="bg-medical-gradient text-white px-4 py-2 flex justify-between items-center z-50 shadow-xl border-b border-white/10">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
              <Eye size={14} className="animate-pulse" />
              <span>Secure Demo Session — Sandbox Environment</span>
            </span>
            <button
              onClick={logout}
              className="text-[9px] font-black uppercase tracking-widest bg-white/20 hover:bg-white/40 text-white px-4 py-1.5 rounded-full border border-white/20 cursor-pointer transition-all active:scale-95"
            >
              Terminate Session
            </button>
          </div>
        )}

        {/* Emergency Override Banner */}
        {overrideState.active && (() => {
          const mins = Math.floor(remainingOverrideTime / 60);
          const secs = remainingOverrideTime % 60;
          const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
          const isUrgent = remainingOverrideTime < 120;
          return (
            <div className={`text-white py-2 px-6 flex justify-between items-center z-[60] shadow-2xl transition-colors ${isUrgent ? 'bg-red-600 animate-pulse' : 'bg-red-700'
              }`}>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-4">
                <span className="flex items-center gap-2"><AlertTriangle size={16} /> SYSTEM OVERRIDE ACTIVE</span>
                <span className={`font-mono px-3 py-1 rounded-lg text-[11px] bg-white/20 border border-white/20`}>{timeStr}</span>
              </span>
              <button
                onClick={deactivateOverride}
                className="text-[10px] font-black uppercase tracking-widest bg-white text-red-700 px-6 py-1.5 rounded-full hover:bg-white/90 transition-all shadow-lg active:scale-95"
              >
                Exit Emergency Mode
              </button>
            </div>
          );
        })()}

        {/* Header */}
        {!isHome && (
          <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between bg-white/90 backdrop-blur-xl px-8 shadow-2xl shadow-blue-900/5 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-medical-gradient opacity-50" />
            <div className="flex items-center gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveView('HOME')}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-primary hover:border-primary/30 transition-all shadow-sm group"
                >
                  <HomeIcon size={16} className="group-hover:scale-110 transition-transform" />
                  <span>Return Home</span>
                </button>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-hospital-bg rounded-2xl border border-hospital-border">
                  <span className="text-[10px] font-black text-text-muted tracking-widest uppercase">System Path</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-[10px] font-black text-primary tracking-widest uppercase">{t('', activeView)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-2xl border border-success/20">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Network Live</span>
                </div>
              </div>

              {!overrideState.active && (
                <button
                  onClick={() => setShowOverrideModal(true)}
                  className="px-6 py-2.5 bg-white text-red-600 border-2 border-red-600 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 shadow-lg shadow-red-600/10"
                >
                  <AlertTriangle size={14} className="text-red-600 group-hover:text-white" />
                  <span>Emergency Access Request</span>
                </button>
              )}

              <LanguageToggle />

              <div className="flex items-center gap-4 pl-6 border-l border-hospital-border">
                <div className="text-right hidden md:block">
                  <p className="text-[11px] font-black text-text-main leading-tight">{user?.name}</p>
                  <p className={`text-[8px] font-black uppercase tracking-[0.2em] ${isDemo ? 'text-warning' : overrideState.active ? 'text-danger' : 'text-primary'}`}>
                    {isDemo ? `Demo Access` : `Secure Connection`}
                  </p>
                </div>
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black border-2 shadow-xl shrink-0 transition-transform hover:scale-105 cursor-pointer ${isDemo ? 'bg-amber-500 text-white border-amber-200' :
                  overrideState.active ? 'bg-danger text-white border-red-200 animate-pulse' :
                    'bg-medical-gradient text-white border-white/20'
                  }`}>
                  {user?.name?.split(' ').map(n => n[0]).join('') || '?'}
                </div>
              </div>
            </div>
          </header>
        )}

        <div className={`flex-1 overflow-y-auto custom-scrollbar flex flex-col ${isHome ? '' : 'relative'}`}>
          <div className={isHome ? '' : 'p-8 pb-12 flex-1'}>
            {isLoading && !isHome && (
              <div className="absolute inset-0 z-50 bg-hospital-bg/50 backdrop-blur-[2px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-2xl shadow-xl border border-hospital-border">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Synchronizing Module...</p>
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
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </LanguageProvider>
  </AuthProvider>
);

export default App;
