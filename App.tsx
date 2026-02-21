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
import Logo from './components/Logo.tsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.tsx';
import { AuthProvider, useAuth, ROLE_DEFAULT_VIEW } from './context/AuthContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { ViewType } from './types.ts';
import { Eye, LogOut, AlertTriangle, Hospital, Loader2, Home as HomeIcon, Menu, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>(() => {
    const hash = window.location.hash.replace('#/', '').toUpperCase();
    return (hash as ViewType) || 'HOME';
  });

  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const currentHash = window.location.hash.replace('#/', '').toUpperCase();
    if (currentHash !== activeView) {
      window.location.hash = `#/${activeView.toLowerCase()}`;
    }
  }, [activeView]);

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
  const [showOverrideModal, setShowOverrideModal] = useState(false);

  useEffect(() => {
    (window as any).dispatchSetShowOverrideModal = (val: boolean) => setShowOverrideModal(val);
    return () => { delete (window as any).dispatchSetShowOverrideModal; };
  }, []);

  const [loginError, setLoginError] = useState('');
  const { t } = useLanguage();
  const {
    user, isAuthenticated, isLoading: authLoading, isDemo,
    login, loginAsDemo, logout,
    overrideState, remainingOverrideTime, deactivateOverride
  } = useAuth();

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

  const handleLogin = async (email: string, password: string, remember: boolean) => {
    setLoginError('');
    try {
      await login(email, password, remember);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
      throw err;
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50 gap-5">
        <div className="w-20 h-20 rounded-[2.5rem] bg-white shadow-2xl flex items-center justify-center border border-slate-100 animate-in zoom-in duration-500">
          <Hospital size={40} className="text-primary" />
        </div>
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Initializing Bios-Grid...</p>
      </div>
    );
  }

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

  const renderView = () => {
    switch (activeView) {
      case 'HOME': return <LandingPage onNavigate={setActiveView} />;
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
  const isPortal = activeView === 'PORTAL';
  const isFullScreen = isHome || isPortal;

  return (
    <div className="flex min-h-screen bg-sky-50 font-sans text-slate-800 relative overflow-hidden">
      {!isFullScreen && (
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <main className={`flex-1 flex flex-col min-w-0 h-screen relative overflow-hidden ${isFullScreen ? 'w-full' : ''}`}>
        {/* Banners */}
        {isDemo && (
          <div className="bg-medical-gradient text-white px-4 py-2 flex justify-between items-center z-50 animate-in slide-in-from-top duration-500">
            <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
              <Eye size={12} /> Live Demo Session
            </span>
            <button onClick={logout} className="text-[8px] font-black uppercase bg-white/20 px-3 py-1 rounded-full border border-white/20">Exit</button>
          </div>
        )}

        {overrideState.active && (
          <div className={`bg-red-600 text-white py-2 px-6 flex justify-between items-center z-[60] shadow-xl animate-pulse`}>
            <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2"><AlertTriangle size={14} /> OVERRIDE ACTIVE</span>
            <button onClick={deactivateOverride} className="text-[8px] font-black uppercase bg-white text-red-600 px-4 py-1 rounded-full">Terminate</button>
          </div>
        )}

        {/* Header - Mobile Responsive */}
        {!isFullScreen && (
          <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-4 md:px-8 z-40 shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2.5 text-slate-500 hover:text-primary active:scale-95 transition-all md:hidden bg-slate-50 rounded-xl border border-slate-100"
              >
                <Menu size={20} />
              </button>

              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveView('HOME')}>
                <Logo size={36} className="group-hover:scale-105 transition-transform" />
                <span className="text-lg font-black text-slate-900 tracking-tighter hidden sm:block">Jeeva Raksha</span>
              </div>

              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Module</span>
                <span className="text-slate-200">/</span>
                <span className="text-[9px] font-black text-primary uppercase tracking-widest">{t('', activeView)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {!overrideState.active && (
                <button
                  onClick={() => setShowOverrideModal(true)}
                  className="hidden sm:flex px-4 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all items-center gap-2 shadow-sm"
                >
                  <AlertTriangle size={14} /> Emergency
                </button>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveView('HOME')}
                  className="w-10 h-10 flex items-center justify-center bg-white text-slate-400 border border-slate-200 rounded-xl hover:text-primary transition-all active:scale-95 shadow-sm"
                >
                  <HomeIcon size={18} />
                </button>
                <div className="hidden sm:block">
                  <LanguageToggle />
                </div>
              </div>

              <div className="h-8 w-px bg-slate-100 mx-1 hidden md:block" />

              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-black text-slate-900 leading-none truncate max-w-[100px]">{user?.name}</p>
                  <p className="text-[8px] font-black text-primary uppercase mt-1 tracking-widest">Active</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-xs font-black shadow-lg shadow-primary/20 hover:scale-110 transition-transform cursor-pointer">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              </div>
            </div>
          </header>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col">
          <div className="flex-1">
            {isLoading && !isHome && (
              <div className="absolute inset-x-0 top-0 h-1 z-[70] bg-slate-100 overflow-hidden">
                <div className="h-full bg-primary animate-[loading_1s_infinite_linear]" style={{ width: '40%', position: 'absolute' }}></div>
              </div>
            )}
            {renderView()}
          </div>
          <Footer />
        </div>
      </main>

      {showOverrideModal && <EmergencyOverride onClose={() => setShowOverrideModal(false)} />}

      <style>{`
        @keyframes loading {
            0% { left: -40%; }
            100% { left: 100%; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
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
