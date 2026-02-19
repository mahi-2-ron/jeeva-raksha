
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
  const [activeView, setActiveView] = useState<ViewType>('HOME');
  const [isLoading, setIsLoading] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-hospital-bg gap-5">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center border border-hospital-border">
          <Hospital size={32} className="text-primary" />
        </div>
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Initializing System...</p>
      </div>
    );
  }

  // ─── Show login page if not authenticated ──────────────────
  if (!isAuthenticated) {
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

  return (
    <div className="flex min-h-screen bg-hospital-bg font-sans text-text-body">
      {!isHome && <Sidebar activeView={activeView} setActiveView={setActiveView} />}

      <main className={`flex-1 h-screen relative flex flex-col overflow-hidden ${isHome ? 'w-full' : 'bg-hospital-bg'}`}>

        {/* Demo Mode Banner */}
        {isDemo && (
          <div className="bg-warning text-white px-4 py-1.5 flex justify-between items-center z-50 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <Eye size={12} />
              <span>Demo Mode — Changes will not be saved</span>
            </span>
            <button
              onClick={logout}
              className="text-[9px] font-bold uppercase tracking-wider bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full border-none cursor-pointer transition-colors"
            >
              Exit Demo
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
            <div className={`text-white py-1.5 px-4 flex justify-between items-center z-[60] transition-colors ${isUrgent ? 'bg-red-800 animate-pulse' : 'bg-danger'
              }`}>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <span className="flex items-center gap-2"><AlertTriangle size={12} /> CRITICAL OVERRIDE ACTIVE</span>
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

        {/* Header */}
        {!isHome && (
          <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-hospital-border bg-white/80 backdrop-blur-md px-8 shadow-sm shrink-0">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveView('HOME')}
                  className="text-[10px] font-bold text-text-muted uppercase tracking-widest hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
                >
                  <HomeIcon size={12} />
                  {t('home')}
                </button>
                <span className="text-hospital-border">/</span>
                <span className={`text-[10px] font-black text-primary uppercase tracking-widest ${t('', activeView).match(/[\u0C80-\u0CFF]/) ? 'font-kannada' : ''}`}>
                  {t('', activeView)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {!overrideState.active && !isDemo && (
                <button
                  onClick={() => setShowOverrideModal(true)}
                  className="px-4 py-2 border border-danger/20 text-danger rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-danger hover:text-white transition-all flex items-center gap-2"
                >
                  <AlertTriangle size={12} />
                  <span>Emergency Override</span>
                </button>
              )}

              <LanguageToggle />

              <div className="flex items-center gap-3 pl-6 border-l border-hospital-border">
                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-bold text-text-main leading-tight">{user?.name}</p>
                  <p className={`text-[8px] font-bold uppercase tracking-tighter ${isDemo ? 'text-warning' : overrideState.active ? 'text-danger' : 'text-primary'}`}>
                    {isDemo ? `DEMO (${user?.role})` : `${currentPermissions} LEVEL`}
                  </p>
                </div>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black border shadow-sm shrink-0 ${isDemo ? 'bg-warning/10 text-warning border-warning/20' :
                  overrideState.active ? 'bg-danger/10 text-danger border-danger/20 animate-pulse' :
                    'bg-primary/10 text-primary border-primary/20'
                  }`}>
                  {user?.name?.split(' ').map(n => n[0]).join('') || '?'}
                </div>
                <button
                  onClick={logout}
                  className="text-text-muted hover:text-danger transition-colors cursor-pointer ml-2"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
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
