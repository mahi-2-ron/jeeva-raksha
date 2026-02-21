
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import {
  AccessLevel,
  AuditLogEntry,
  ModulePermissionMap,
  OverrideState,
  ViewType,
  OVERRIDE_DURATION_SECONDS
} from '../types.ts';

// ==================== Constants ====================

export const ROLES = {
  VIEW: 'VIEW' as AccessLevel,
  EDIT: 'EDIT' as AccessLevel,
  ADMIN: 'ADMIN' as AccessLevel,
} as const;

export type Role = AccessLevel;

const ROLE_HIERARCHY: AccessLevel[] = ['VIEW', 'EDIT', 'ADMIN'];

/** Map database roles to access levels */
const ROLE_TO_ACCESS: Record<string, AccessLevel> = {
  admin: 'ADMIN',
  administrator: 'ADMIN',
  'super admin': 'ADMIN',
  doctor: 'EDIT',
  surgeon: 'EDIT',
  hod: 'EDIT',
  nurse: 'EDIT',
  pharmacist: 'EDIT',
  lab_tech: 'VIEW',
  'lab technician': 'VIEW',
  radiologist: 'VIEW',
  receptionist: 'VIEW',
  staff: 'VIEW',
  patient: 'VIEW',
  demo: 'VIEW',
};

function normalizeDBRole(role: string): string {
  if (!role) return 'staff';
  const r = role.toLowerCase();
  if (r.includes('admin')) return 'admin';
  if (r.includes('doctor') || r.includes('surgeon') || r.includes('hod')) return 'doctor';
  if (r.includes('nurse')) return 'nurse';
  if (r.includes('pharmacist')) return 'pharmacist';
  if (r.includes('lab')) return 'lab_tech';
  if (r.includes('radio')) return 'radiologist';
  if (r.includes('receptionist')) return 'receptionist';
  return r;
}

/** Per-module minimum access level required */
const MODULE_PERMISSIONS: ModulePermissionMap = {
  HOME: 'VIEW',
  DASHBOARD: 'VIEW',
  OPD: 'VIEW',
  IPD: 'VIEW',
  EMERGENCY: 'VIEW',
  OT: 'EDIT',
  EMR: 'VIEW',
  ROUNDS: 'EDIT',
  PORTAL: 'VIEW',
  PATIENTS: 'VIEW',
  LABORATORY: 'VIEW',
  RADIOLOGY: 'VIEW',
  PHARMACY: 'EDIT',
  INVENTORY: 'EDIT',
  BILLING: 'ADMIN',
  INSURANCE: 'ADMIN',
  HR: 'ADMIN',
  BEDS: 'EDIT',
  ANALYTICS: 'ADMIN',
  QUALITY: 'ADMIN',
  INTEGRATIONS_DEVICES: 'VIEW',
  INTEGRATIONS_GOVT: 'ADMIN',
};

/** Default views by role after login */
export const ROLE_DEFAULT_VIEW: Record<string, ViewType> = {
  admin: 'DASHBOARD',
  doctor: 'DASHBOARD',
  nurse: 'DASHBOARD',
  pharmacist: 'DASHBOARD',
  patient: 'PORTAL',
  demo: 'DASHBOARD',
  staff: 'DASHBOARD',
  receptionist: 'DASHBOARD',
};

// ==================== Types ====================

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;       // database role: admin, doctor, pharmacist, patient, demo
  employee_id?: string;
  department?: string;
  specialization?: string;
}

interface AuthContextType {
  // Auth state
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemo: boolean;
  token: string | null;

  // Auth actions
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  loginAsDemo: (role: string) => Promise<void>;
  logout: () => void;

  // RBAC (keep existing interface)
  currentPermissions: AccessLevel;
  overrideState: OverrideState;
  remainingOverrideTime: number;
  auditLog: AuditLogEntry[];
  triggerEmergencyOverride: (reason: string) => void;
  deactivateOverride: () => void;
  hasPermission: (requiredRole: AccessLevel) => boolean;
  hasModuleAccess: (module: ViewType) => boolean;
  canPerformAction: (module: ViewType, requiredLevel: AccessLevel) => boolean;
  getModuleRequiredLevel: (module: ViewType) => AccessLevel;
  changeRole: (newRole: AccessLevel) => void;
  logModuleAccess: (module: ViewType) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==================== Helpers ====================

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const SESSION_ID = generateId();

function getRoleIndex(role: AccessLevel): number {
  return ROLE_HIERARCHY.indexOf(role);
}

// ==================== Provider ====================

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ─── Auth State ────────────────────────────────────────────
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // starts loading to check saved token
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('VIEW');

  const isAuthenticated = !!authUser && !!token;

  // ─── RBAC State ────────────────────────────────────────────
  const [overrideState, setOverrideState] = useState<OverrideState>({
    active: false,
    reason: '',
    activatedAt: null,
    expiresAt: null,
    activatedBy: null,
  });
  const [remainingOverrideTime, setRemainingOverrideTime] = useState(0);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const overrideTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentPermissions: AccessLevel = overrideState.active ? ROLES.ADMIN : accessLevel;

  // ─── Persist token to localStorage ─────────────────────────
  const saveToken = (t: string, remember: boolean) => {
    if (remember) {
      localStorage.setItem('jrk_token', t);
    } else {
      sessionStorage.setItem('jrk_token', t);
    }
  };

  const clearToken = () => {
    localStorage.removeItem('jrk_token');
    sessionStorage.removeItem('jrk_token');
    localStorage.removeItem('jrk_user_id');
    localStorage.removeItem('jrk_user_role');
    localStorage.removeItem('jrk_user_name');
  };

  const getStoredToken = (): string | null => {
    return localStorage.getItem('jrk_token') || sessionStorage.getItem('jrk_token');
  };

  // ─── Set user + update access level ────────────────────────
  const setUserAndAccess = (user: AuthUser, t: string, demo: boolean) => {
    setAuthUser(user);
    setToken(t);
    setIsDemo(demo);
    const normalizedRole = normalizeDBRole(user.role);
    setAccessLevel(ROLE_TO_ACCESS[normalizedRole] || 'VIEW');

    // Also set legacy localStorage keys for api.ts compatibility
    localStorage.setItem('jrk_user_id', user.id);
    localStorage.setItem('jrk_user_role', normalizedRole);
    localStorage.setItem('jrk_user_name', user.name);
  };

  // ─── Mock users (offline fallback when backend is not running) ──
  const MOCK_USERS: Record<string, AuthUser> = {
    admin: { id: 'mock-admin-001', name: 'System Administrator', email: 'admin@demo.com', role: 'admin', employee_id: 'ADMIN-001', department: 'Administration' },
    doctor: { id: 'mock-doc-001', name: 'Dr. Aditi Sharma', email: 'doctor@demo.com', role: 'doctor', employee_id: 'DOC-001', department: 'Cardiology', specialization: 'Cardiologist' },
    pharmacist: { id: 'mock-pharm-001', name: 'Ravi Pharmacist', email: 'pharma@demo.com', role: 'pharmacist', employee_id: 'PHARM-001', department: 'Pharmacy' },
    patient: { id: 'mock-pat-001', name: 'Ramesh Gowda', email: 'patient@demo.com', role: 'patient', employee_id: 'PAT-001' },
    demo: { id: 'mock-demo-001', name: 'Demo User', email: 'demo@demo.com', role: 'demo', employee_id: 'DEMO-001' },
  };

  const MOCK_CREDENTIALS: Record<string, string> = {
    'patient@demo.com': 'demo123',
    'doctor@demo.com': 'demo123',
    'admin@demo.com': 'demo123',
    'pharma@demo.com': 'demo123',
    'demo@demo.com': 'demo123',
    // Production default fallbacks
    'admin@jeevaraksha.in': 'admin123',
    'aditi.sharma@jeevaraksha.in': 'doctor123',
    'ravi.pharm@jeevaraksha.in': 'pharma123',
    'ramesh.gowda@jeevaraksha.in': 'patient123',
  };

  const EMAIL_TO_ROLE: Record<string, string> = {
    'patient@demo.com': 'patient',
    'doctor@demo.com': 'doctor',
    'admin@demo.com': 'admin',
    'pharma@demo.com': 'pharmacist',
    'demo@demo.com': 'demo',
    // Production default fallbacks
    'admin@jeevaraksha.in': 'admin',
    'aditi.sharma@jeevaraksha.in': 'doctor',
    'ravi.pharm@jeevaraksha.in': 'pharmacist',
    'ramesh.gowda@jeevaraksha.in': 'patient',
  };

  // ─── Login ─────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    setIsLoading(true);
    try {
      // Try real backend first
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
          const data = await res.json();
          saveToken(data.token, remember);
          setUserAndAccess(data.user, data.token, false);
          return;
        }

        // If not a 404, it's a real auth error from the backend
        if (res.status !== 404) {
          // If server error (5xx), consider it as backend unreachable to trigger fallback
          if (res.status >= 500) {
            throw new Error('Failed to fetch (Server Error)');
          }

          const data = await res.json().catch(() => ({}));
          const msg = data.hint || data.message || data.error || 'Login failed';
          throw new Error(msg);
        }
      } catch (err: any) {
        // Only fall through to mock if it's a network/404 error
        if (err.message && !err.message.includes('fetch') && err.message !== 'Failed to fetch') {
          if (!err.message.includes('404') && !err.message.includes('Not Found')) {
            throw err;
          }
        }
      }

      // Fallback: offline mock login
      console.warn('[AUTH] Backend unreachable — using offline mock login');
      const emailLower = email.toLowerCase().trim();
      const expectedPassword = MOCK_CREDENTIALS[emailLower];
      if (!expectedPassword || expectedPassword !== password) {
        throw new Error('Invalid email or password');
      }
      const role = EMAIL_TO_ROLE[emailLower];
      const mockUser = MOCK_USERS[role];
      const mockToken = `mock-token-${role}-${Date.now()}`;
      saveToken(mockToken, remember);
      setUserAndAccess(mockUser, mockToken, false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Demo Login ────────────────────────────────────────────
  const loginAsDemo = useCallback(async (role: string) => {
    setIsLoading(true);
    try {
      // Try real backend first
      try {
        const res = await fetch(`${API_BASE}/auth/demo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role }),
        });

        if (res.ok) {
          const data = await res.json();
          saveToken(data.token, false);
          setUserAndAccess(data.user, data.token, true);
          return;
        }
      } catch {
        // Backend unreachable — fall through to mock
      }

      // Fallback: offline mock demo login
      console.warn(`[AUTH] Backend unreachable — using offline mock demo (${role})`);
      const mockUser = MOCK_USERS[role] || MOCK_USERS['demo'];
      const demoUser: AuthUser = { ...mockUser }; // Preserve the role for proper access levels
      const mockToken = `mock-demo-token-${role}-${Date.now()}`;
      saveToken(mockToken, false);
      setUserAndAccess(demoUser, mockToken, true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Logout ────────────────────────────────────────────────
  const logout = useCallback(() => {
    // Fire and forget logout API call
    if (token) {
      fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      }).catch(() => { });
    }

    clearToken();
    setAuthUser(null);
    setToken(null);
    setIsDemo(false);
    setAccessLevel('VIEW');
    setOverrideState({
      active: false,
      reason: '',
      activatedAt: null,
      expiresAt: null,
      activatedBy: null,
    });
  }, [token]);

  // ─── Auto-verify saved token on mount ──────────────────────
  useEffect(() => {
    const savedToken = getStoredToken();
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    // Mock tokens can't be verified via API — clear and show login
    if (savedToken.startsWith('mock-')) {
      clearToken();
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout for initial check

    fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${savedToken}` },
      signal: controller.signal
    })
      .then(async (res) => {
        if (!res.ok) {
          clearToken();
          return;
        }
        const data = await res.json();
        setUserAndAccess(data.user, savedToken, data.isDemo || false);
      })
      .catch((err) => {
        console.warn('[AUTH] Initial check failed or timed out:', err.message);
        // Don't clear token if it's just a timeout (maybe transient network issue)
        // But if it's a 401/403, clear it. 
        // For simplicity, if it fails, we clear it so they can re-login.
        clearToken();
      })
      .finally(() => {
        clearTimeout(timeout);
        setIsLoading(false);
      });
  }, []);

  // ─── Audit Logger ──────────────────────────────────────────
  const addAuditEntry = useCallback((
    entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'userId' | 'userName' | 'sessionId'>
  ) => {
    const fullEntry: AuditLogEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      userId: authUser?.id || 'unknown',
      userName: authUser?.name || 'Unknown',
      sessionId: SESSION_ID,
      ...entry,
    };
    setAuditLog(prev => [fullEntry, ...prev]);
    console.log(`[RBAC AUDIT] ${fullEntry.action}`, fullEntry);
  }, [authUser?.id, authUser?.name]);

  // ─── Override Auto-Expiry Timer ────────────────────────────
  useEffect(() => {
    if (overrideState.active && overrideState.expiresAt) {
      const expiresAt = new Date(overrideState.expiresAt).getTime();

      const tick = () => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((expiresAt - now) / 1000));
        setRemainingOverrideTime(remaining);

        if (remaining <= 0) {
          const activatedAt = overrideState.activatedAt ? new Date(overrideState.activatedAt).getTime() : now;
          const durationSeconds = Math.round((now - activatedAt) / 1000);

          setOverrideState({
            active: false,
            reason: '',
            activatedAt: null,
            expiresAt: null,
            activatedBy: null,
          });
          setRemainingOverrideTime(0);

          addAuditEntry({
            action: 'OVERRIDE_EXPIRED',
            reason: 'Auto-expired after 15 minutes',
            durationSeconds,
          });
        }
      };

      tick();
      overrideTimerRef.current = setInterval(tick, 1000);

      return () => {
        if (overrideTimerRef.current) clearInterval(overrideTimerRef.current);
      };
    } else {
      setRemainingOverrideTime(0);
    }
  }, [overrideState.active, overrideState.expiresAt, overrideState.activatedAt, addAuditEntry]);

  // ─── Emergency Override ────────────────────────────────────
  const triggerEmergencyOverride = useCallback((reason: string) => {
    // Enable for all roles including demo to allow feature testing
    const now = new Date();
    const expiresAt = new Date(now.getTime() + OVERRIDE_DURATION_SECONDS * 1000);

    setOverrideState({
      active: true,
      reason,
      activatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      activatedBy: authUser?.id || null,
    });

    addAuditEntry({
      action: 'OVERRIDE_ACTIVATED',
      reason,
      previousLevel: accessLevel,
      newLevel: 'ADMIN',
    });
  }, [authUser?.id, accessLevel, addAuditEntry, isDemo]);

  const deactivateOverride = useCallback(() => {
    const activatedAt = overrideState.activatedAt ? new Date(overrideState.activatedAt).getTime() : Date.now();
    const durationSeconds = Math.round((Date.now() - activatedAt) / 1000);

    setOverrideState({
      active: false,
      reason: '',
      activatedAt: null,
      expiresAt: null,
      activatedBy: null,
    });

    addAuditEntry({
      action: 'OVERRIDE_DEACTIVATED',
      reason: 'Manual deactivation',
      newLevel: accessLevel,
      durationSeconds,
    });
  }, [overrideState.activatedAt, accessLevel, addAuditEntry]);

  // ─── Permission Checks ────────────────────────────────────
  const hasPermission = useCallback((requiredRole: AccessLevel): boolean => {
    return getRoleIndex(currentPermissions) >= getRoleIndex(requiredRole);
  }, [currentPermissions]);

  const hasModuleAccess = useCallback((module: ViewType): boolean => {
    const required = MODULE_PERMISSIONS[module] || 'VIEW';
    return getRoleIndex(currentPermissions) >= getRoleIndex(required);
  }, [currentPermissions]);

  const canPerformAction = useCallback((module: ViewType, requiredLevel: AccessLevel): boolean => {
    // If override is active, allow all actions regardless of demo mode
    if (isDemo && !overrideState.active) return false;
    const moduleRequired = MODULE_PERMISSIONS[module] || 'VIEW';
    const effectiveRequired = getRoleIndex(requiredLevel) > getRoleIndex(moduleRequired) ? requiredLevel : moduleRequired;
    return getRoleIndex(currentPermissions) >= getRoleIndex(effectiveRequired);
  }, [currentPermissions, isDemo, overrideState.active]);

  const getModuleRequiredLevel = useCallback((module: ViewType): AccessLevel => {
    return MODULE_PERMISSIONS[module] || 'VIEW';
  }, []);

  const logModuleAccess = useCallback((module: ViewType) => {
    addAuditEntry({ action: 'MODULE_ACCESSED', module });
  }, [addAuditEntry]);

  // ─── Role Change ──────────────────────────────────────────
  const changeRole = useCallback((newRole: AccessLevel) => {
    const prevRole = accessLevel;
    setAccessLevel(newRole);
    addAuditEntry({
      action: 'ROLE_CHANGED',
      previousLevel: prevRole,
      newLevel: newRole,
    });
  }, [accessLevel, addAuditEntry]);

  return (
    <AuthContext.Provider value={{
      // Auth
      user: authUser,
      isAuthenticated,
      isLoading,
      isDemo,
      token,
      login,
      loginAsDemo,
      logout,
      // RBAC
      currentPermissions,
      overrideState,
      remainingOverrideTime,
      auditLog,
      triggerEmergencyOverride,
      deactivateOverride,
      hasPermission,
      hasModuleAccess,
      canPerformAction,
      getModuleRequiredLevel,
      changeRole,
      logModuleAccess,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ==================== ProtectedAction Component ====================

interface ProtectedActionProps {
  requiredLevel: AccessLevel;
  module?: ViewType;
  children: ReactNode;
  fallback?: ReactNode;
}

export const ProtectedAction: React.FC<ProtectedActionProps> = ({
  requiredLevel,
  module,
  children,
  fallback,
}) => {
  const { hasPermission, canPerformAction } = useAuth();

  const allowed = module
    ? canPerformAction(module, requiredLevel)
    : hasPermission(requiredLevel);

  if (allowed) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest">
      🔒 Insufficient Permissions
    </span>
  );
};

// ==================== Hook ====================

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
