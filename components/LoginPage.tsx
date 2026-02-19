import React, { useState } from 'react';

interface LoginPageProps {
    onLogin: (email: string, password: string, remember: boolean) => Promise<void>;
    onDemoLogin: (role: string) => Promise<void>;
    error: string;
    isLoading: boolean;
}

const ROLES_INFO = [
    {
        id: 'admin',
        label: 'Admin',
        icon: (color: string) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        )
    },
    {
        id: 'doctor',
        label: 'Doctor',
        icon: (color: string) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.8 2.3A.3.3 0 1 0 5 2.8l.3-1.1s.8.9 1.8.4c1-.5.7-1 .7-1s-.4.2-1 .2c-.5 0-.9-.3-.9-.3a.3.3 0 1 0-.3.4Z" /><path d="M19 10v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V10c0-3.3 2.7-6 6-6h2c3.3 0 6 2.7 6 6Z" /><path d="M11 20h2" /><path d="M12 11v9" />
            </svg>
        )
    },
    {
        id: 'pharmacist',
        label: 'Pharmacist',
        icon: (color: string) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" />
            </svg>
        )
    },
    {
        id: 'patient',
        label: 'Patient',
        icon: (color: string) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
        )
    },
    {
        id: 'demo',
        label: 'Demo',
        icon: (color: string) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
            </svg>
        )
    },
];

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onDemoLogin, error, isLoading }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRole) return;

        try {
            if (selectedRole === 'demo') {
                await onDemoLogin('demo');
            } else {
                await onLogin(email, password, remember);
            }
        } catch {
            // error handled by parent
        }
    };

    const handleRoleSelect = (roleId: string) => {
        setSelectedRole(roleId);
        // Pre-fill seeded credentials for the role
        switch (roleId) {
            case 'admin':
                setEmail('rajesh.kumar@jeevaraksha.in');
                setPassword('admin123');
                break;
            case 'doctor':
                setEmail('aditi.sharma@jeevaraksha.in');
                setPassword('doctor123');
                break;
            case 'pharmacist':
                setEmail('karthik.iyer@jeevaraksha.in');
                setPassword('pharma123');
                break;
            case 'patient':
                setEmail('meera.nair@jeevaraksha.in');
                setPassword('patient123');
                break;
            case 'demo':
                setEmail('rajesh.kumar@jeevaraksha.in');
                setPassword('admin123'); // Default demo to admin
                break;
            default:
                setEmail('');
                setPassword('');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-6">
            <div className="w-full max-w-md">
                {/* Header with Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-white rounded-3xl shadow-sm border border-slate-100 p-4">
                        <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M32 4L8 14V30C8 44.8 18.24 58.56 32 60C45.76 58.56 56 44.8 56 30V14L32 4Z" fill="#0891b2" />
                            <circle cx="32" cy="32" r="20" fill="white" />
                            <path d="M18 32H24L28 22L36 42L40 32H46" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Jeeva Raksha</h1>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Unified Hospital System</p>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-200/50">
                    {!selectedRole ? (
                        <div className="animate-in">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Select your role</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {ROLES_INFO.map((role) => (
                                    <button
                                        key={role.id}
                                        onClick={() => handleRoleSelect(role.id)}
                                        className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-50 bg-slate-50/50 hover:border-primary hover:bg-primary/5 hover:scale-[1.02] transition-all group"
                                    >
                                        <div className="mb-3 text-slate-400 group-hover:text-primary transition-colors">
                                            {role.icon('currentColor')}
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-primary">{role.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Sign In</h2>
                                    <p className="text-sm text-slate-500 font-medium">Login as <span className="text-primary font-bold">{ROLES_INFO.find(r => r.id === selectedRole)?.label}</span></p>
                                </div>
                                <button
                                    onClick={() => setSelectedRole(null)}
                                    className="text-xs font-bold text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-lg"
                                >
                                    Change Role
                                </button>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-700 font-medium flex items-center gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">!</span>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="user@hospital.com"
                                        required
                                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium placeholder:text-slate-300"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium placeholder:text-slate-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                {showPassword ? (
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24l4.24 4.24Z" />
                                                ) : (
                                                    <>
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </>
                                                )}
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={remember}
                                                onChange={(e) => setRemember(e.target.checked)}
                                                className="w-5 h-5 rounded-lg border-2 border-slate-200 bg-white checked:bg-primary checked:border-primary transition-all appearance-none cursor-pointer"
                                            />
                                            <svg className="absolute left-1 w-3 h-3 text-white pointer-events-none opacity-0 checked-siblings:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Keep me signed in</span>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg shadow-primary/30 transition-all active:scale-[0.98] ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark hover:shadow-primary/40'
                                        }`}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            <span>Authenticating...</span>
                                        </div>
                                    ) : (
                                        'Sign In to System'
                                    )}
                                </button>

                                {selectedRole === 'demo' && (
                                    <p className="text-center text-xs text-slate-400 font-medium pt-2">
                                        Use current demo credentials to explore all features.
                                    </p>
                                )}
                            </form>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-8 text-center space-y-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">© 2026 Jeeva Raksha HIS</p>
                </div>
            </div>

            <style>{`
                .animate-in {
                    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .bg-primary { background-color: #0891b2; }
                .bg-primary-dark { background-color: #0e7490; }
                .border-primary { border-color: #0891b2; }
                .text-primary { color: #0891b2; }
                .checked-siblings:checked + svg { opacity: 1; }
            `}</style>
        </div>
    );
};

export default LoginPage;

