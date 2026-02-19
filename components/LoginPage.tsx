import React, { useState } from 'react';

interface LoginPageProps {
    onLogin: (email: string, password: string, remember: boolean) => Promise<void>;
    onDemoLogin: (role: string) => Promise<void>;
    error: string;
    isLoading: boolean;
}

const DEMO_ROLES = [
    { role: 'admin', label: 'Admin', desc: 'Full access' },
    { role: 'doctor', label: 'Doctor', desc: 'Clinical' },
    { role: 'pharmacist', label: 'Pharmacist', desc: 'Pharmacy' },
    { role: 'patient', label: 'Patient', desc: 'Records' },
    { role: 'demo', label: 'Demo', desc: 'Read-only' },
];

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onDemoLogin, error, isLoading }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onLogin(email, password, remember);
        } catch {
            // error handled by parent
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f1f5f9',
            fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
            padding: '20px',
        }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>
                {/* Header with Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '64px',
                        height: '64px',
                        marginBottom: '16px',
                        position: 'relative'
                    }}>
                        {/* Custom SVG Shield & Heartbeat Logo */}
                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M32 4L8 14V30C8 44.8 18.24 58.56 32 60C45.76 58.56 56 44.8 56 30V14L32 4Z" fill="#0891b2" />
                            <circle cx="32" cy="32" r="20" fill="white" />
                            <path d="M18 32H24L28 22L36 42L40 32H46" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: 800,
                        color: '#0f172a',
                        margin: '0 0 4px',
                        letterSpacing: '-0.025em',
                    }}>Jeeva Raksha</h1>
                    <p style={{
                        fontSize: '14px',
                        color: '#64748b',
                        margin: 0,
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>Unified Hospital Information System</p>
                </div>

                {/* Login Card */}
                <div style={{
                    background: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '28px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}>
                    <h2 style={{
                        fontSize: '16px', fontWeight: 600, color: '#0f172a',
                        margin: '0 0 20px',
                    }}>Sign in to your account</h2>

                    {/* Error */}
                    {error && (
                        <div style={{
                            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
                            padding: '10px 14px', marginBottom: '16px', fontSize: '13px',
                            color: '#991b1b', fontWeight: 500,
                        }}>{error}</div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div style={{ marginBottom: '14px' }}>
                            <label style={{
                                display: 'block', fontSize: '13px', fontWeight: 500,
                                color: '#374151', marginBottom: '6px',
                            }}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@demo.com"
                                required
                                style={{
                                    width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
                                    borderRadius: '8px', fontSize: '14px', color: '#0f172a',
                                    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                                    background: '#fff',
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#0891b2'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '14px' }}>
                            <label style={{
                                display: 'block', fontSize: '13px', fontWeight: 500,
                                color: '#374151', marginBottom: '6px',
                            }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    style={{
                                        width: '100%', padding: '10px 12px', paddingRight: '60px',
                                        border: '1px solid #d1d5db', borderRadius: '8px',
                                        fontSize: '14px', color: '#0f172a', outline: 'none',
                                        fontFamily: 'inherit', boxSizing: 'border-box', background: '#fff',
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#0891b2'}
                                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        fontSize: '12px', color: '#6b7280', fontWeight: 500, fontFamily: 'inherit',
                                    }}
                                >{showPassword ? 'Hide' : 'Show'}</button>
                            </div>
                        </div>

                        {/* Remember me */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                            }}>
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                    style={{ accentColor: '#0891b2' }}
                                />
                                <span style={{ fontSize: '13px', color: '#6b7280' }}>Remember me</span>
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%', padding: '10px', border: 'none', borderRadius: '8px',
                                background: isLoading ? '#94a3b8' : '#0891b2',
                                color: 'white', fontSize: '14px', fontWeight: 600,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                fontFamily: 'inherit',
                            }}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>

                {/* Demo Access */}
                <div style={{
                    marginTop: '16px', background: '#fff', borderRadius: '12px',
                    border: '1px solid #e2e8f0', padding: '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}>
                    <p style={{
                        fontSize: '12px', fontWeight: 600, color: '#64748b',
                        margin: '0 0 12px', textAlign: 'center',
                    }}>Quick Demo Access</p>

                    <div style={{
                        display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center',
                    }}>
                        {DEMO_ROLES.map((d) => (
                            <button
                                key={d.role}
                                onClick={() => onDemoLogin(d.role)}
                                disabled={isLoading}
                                style={{
                                    padding: '8px 14px', border: '1px solid #e2e8f0',
                                    borderRadius: '8px', background: '#f8fafc',
                                    cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                                    color: '#334155', fontFamily: 'inherit',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.background = '#e2e8f0';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.background = '#f8fafc';
                                }}
                            >{d.label}</button>
                        ))}
                    </div>

                    <p style={{
                        fontSize: '11px', color: '#94a3b8', margin: '10px 0 0', textAlign: 'center',
                    }}>Password for all: demo123</p>
                </div>

                {/* Footer */}
                <p style={{
                    textAlign: 'center', fontSize: '11px', color: '#94a3b8',
                    marginTop: '16px',
                }}>
                    © 2026 Jeeva Raksha
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
