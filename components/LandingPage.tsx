
import React, { useState, useEffect, useRef } from 'react';
import { ViewType } from '../types.ts';

interface LandingPageProps {
    onNavigate: (view: ViewType) => void;
}

/* ── Animated counter hook ── */
const useCounter = (target: number, duration = 2000) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true;
                const start = performance.now();
                const step = (now: number) => {
                    const progress = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    setCount(Math.floor(eased * target));
                    if (progress < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
            }
        }, { threshold: 0.3 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target, duration]);

    return { count, ref };
};

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
    const [lang, setLang] = useState<'EN' | 'KN'>('EN');
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const stat1 = useCounter(50000);
    const stat2 = useCounter(280);
    const stat3 = useCounter(99);
    const stat4 = useCounter(24);

    const features = [
        { icon: '🏥', title: 'OPD & IPD Management', desc: 'Streamlined outpatient and inpatient workflows from registration to discharge.', color: 'from-blue-500 to-cyan-400' },
        { icon: '🚨', title: 'Emergency & OT Tracking', desc: 'Real-time emergency triage and operation theatre scheduling.', color: 'from-red-500 to-orange-400' },
        { icon: '📁', title: 'Electronic Medical Records', desc: 'Digitized, searchable patient records with full audit trails.', color: 'from-violet-500 to-purple-400' },
        { icon: '🧪', title: 'Laboratory & Radiology', desc: 'Integrated diagnostics with automated result publishing.', color: 'from-emerald-500 to-green-400' },
        { icon: '💊', title: 'Pharmacy & Inventory', desc: 'Drug dispensation tracking with batch-level stock management.', color: 'from-amber-500 to-yellow-400' },
        { icon: '💰', title: 'Billing & Insurance', desc: 'Multi-payer billing with cashless TPA and claims automation.', color: 'from-teal-500 to-cyan-400' },
        { icon: '🤖', title: 'AI Clinical Insights', desc: 'Machine-learning driven alerts, predictions, and clinical support.', color: 'from-pink-500 to-rose-400' },
        { icon: '📊', title: 'Real-time Analytics', desc: 'Live dashboards with KPIs, trends, and compliance reports.', color: 'from-indigo-500 to-blue-400' },
    ];

    const workflow = [
        { step: '01', title: 'Patient Arrives', desc: 'Digital registration with ABHA ID linkage', icon: '👤' },
        { step: '02', title: 'Clinical Assessment', desc: 'AI-assisted triage and doctor allocation', icon: '🩺' },
        { step: '03', title: 'Diagnostics & Treatment', desc: 'Integrated lab, pharmacy, and EMR workflows', icon: '💉' },
        { step: '04', title: 'Billing & Discharge', desc: 'Automated billing with insurance settlement', icon: '✅' },
    ];

    return (
        <div className="min-h-screen bg-white overflow-x-hidden">

            {/* ═══════════ HEADER ═══════════ */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrollY > 50 ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-black/[0.03] border-b border-slate-100' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/30">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L3 7V12C3 17.25 6.75 22.05 12 23C17.25 22.05 21 17.25 21 12V7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" fill="rgba(255,255,255,0.15)" />
                                <path d="M8 13H16M12 9V17" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                        </div>
                        <span className="text-lg font-black text-slate-900 tracking-tight">Jeeva Raksha</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        {['Features', 'Workflow', 'Stats'].map(item => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="text-[11px] font-bold text-slate-500 uppercase tracking-widest hover:text-blue-600 transition-colors">{item}</a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => (window as any).dispatchSetShowOverrideModal?.(true)}
                            className="flex px-4 py-2 bg-white text-red-600 border-2 border-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all items-center gap-2 shadow-lg shadow-red-600/10"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m12 8 4 4" /><path d="m16 8-4 4" /></svg>
                            Emergency Access
                        </button>
                        <div className="hidden sm:flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
                            <button onClick={() => setLang('EN')} className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${lang === 'EN' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>EN</button>
                            <button onClick={() => setLang('KN')} className={`px-3 py-1.5 text-[10px] font-black tracking-widest rounded-md transition-all ${lang === 'KN' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>ಕನ್ನಡ</button>
                        </div>
                        <button onClick={() => onNavigate('DASHBOARD')} className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5 transition-all active:scale-95">Login</button>
                    </div>
                </div>
            </header>

            {/* ═══════════ HERO ═══════════ */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-100 rounded-full blur-[150px] opacity-40 animate-pulse" style={{ animationDuration: '4s' }} />
                    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[120px] opacity-30 animate-pulse" style={{ animationDuration: '6s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-50 rounded-full blur-[160px] opacity-50" />

                    {/* Floating grid dots */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                    {/* Floating medical icons */}
                    <div className="absolute top-[15%] left-[10%] text-4xl opacity-10 animate-bounce" style={{ animationDuration: '3s' }}>🏥</div>
                    <div className="absolute top-[20%] right-[15%] text-3xl opacity-10 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>🧬</div>
                    <div className="absolute bottom-[25%] left-[15%] text-3xl opacity-10 animate-bounce" style={{ animationDuration: '5s', animationDelay: '0.5s' }}>💊</div>
                    <div className="absolute bottom-[20%] right-[10%] text-4xl opacity-10 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1.5s' }}>🩺</div>
                    <div className="absolute top-[40%] left-[5%] text-2xl opacity-10 animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '2s' }}>🧪</div>
                    <div className="absolute top-[35%] right-[8%] text-2xl opacity-10 animate-bounce" style={{ animationDuration: '3.8s', animationDelay: '0.8s' }}>📊</div>
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-8">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                            {lang === 'KN' ? 'ಆಧುನಿಕ ಆರೋಗ್ಯ ವ್ಯವಸ್ಥೆ' : 'Next-Gen Hospital Platform'}
                        </span>
                    </div>

                    {/* Shield icon */}
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-[28px] bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 shadow-2xl shadow-blue-600/30 mb-10 relative">
                        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-white/20 to-transparent" />
                        <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L3 7V12C3 17.25 6.75 22.05 12 23C17.25 22.05 21 17.25 21 12V7L12 2Z" stroke="white" strokeWidth="1.5" fill="rgba(255,255,255,0.1)" />
                            <path d="M8 13H16M12 9V17" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                        {/* Glow ring */}
                        <div className="absolute -inset-2 rounded-[32px] border border-blue-200/30 animate-pulse" style={{ animationDuration: '3s' }} />
                    </div>

                    {/* Title with gradient */}
                    <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-6" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Jeeva Raksha
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl md:text-2xl font-medium text-slate-500 max-w-2xl mx-auto mb-4 leading-relaxed">
                        Unified Digital Shield for{' '}
                        <span className="text-blue-600 font-bold">Smart Healthcare</span>
                    </p>

                    {/* Tagline */}
                    <p className="text-sm text-slate-400 font-medium mb-12 italic">
                        {lang === 'KN' ? '"ಆರೋಗ್ಯ ರಕ್ಷಣೆಯ ಡಿಜಿಟಲ್ ಕವಚ — ಜೀವರಕ್ಷೆ"' : '"Trust the Digital Shield of Healthcare"'}
                    </p>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <button onClick={() => onNavigate('DASHBOARD')} className="group relative px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-600/25 hover:shadow-2xl hover:shadow-blue-600/35 hover:-translate-y-1 transition-all active:scale-[0.97] min-w-[240px] overflow-hidden">
                            <span className="relative z-10 flex items-center justify-center gap-2">Enter Dashboard <span className="group-hover:translate-x-1 transition-transform">→</span></span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <a href="#features" className="px-10 py-4 bg-white text-slate-700 rounded-2xl text-sm font-black uppercase tracking-widest border-2 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:-translate-y-1 transition-all active:scale-[0.97] min-w-[240px]">Explore Features</a>
                    </div>

                    {/* Scroll indicator */}
                    <div className="flex flex-col items-center gap-2 opacity-40 animate-bounce" style={{ animationDuration: '2s' }}>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scroll</span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-slate-400" /></svg>
                    </div>
                </div>
            </section>

            {/* ═══════════ LIVE STATS ═══════════ */}
            <section id="stats" className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />

                <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-20">
                    <div className="text-center mb-14">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-3">Impact</p>
                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Trusted Across Karnataka</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
                        {[
                            { ref: stat1.ref, count: stat1.count, suffix: '+', label: 'Patients Served', icon: '👥' },
                            { ref: stat2.ref, count: stat2.count, suffix: '+', label: 'Hospital Beds Managed', icon: '🛏️' },
                            { ref: stat3.ref, count: stat3.count, suffix: '.9%', label: 'System Uptime', icon: '⚡' },
                            { ref: stat4.ref, count: stat4.count, suffix: '/7', label: 'Monitoring', icon: '🛡️' },
                        ].map((s, i) => (
                            <div key={i} ref={s.ref} className="text-center group">
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-4 text-2xl group-hover:bg-white/10 group-hover:scale-110 transition-all">{s.icon}</div>
                                <p className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
                                    {s.count.toLocaleString()}<span className="text-blue-400">{s.suffix}</span>
                                </p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ FEATURES ═══════════ */}
            <section id="features" className="relative bg-white">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                <div className="max-w-7xl mx-auto px-6 md:px-10 py-28">
                    <div className="text-center mb-20">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-3">Modules</p>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                            Everything a Hospital Needs
                        </h2>
                        <p className="text-base text-slate-500 font-medium max-w-xl mx-auto">
                            Comprehensive modules covering every clinical, operational, and administrative workflow.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((f, i) => (
                            <div
                                key={i}
                                className="group relative bg-white p-8 rounded-3xl border border-slate-100 hover:border-transparent shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-default overflow-hidden"
                            >
                                {/* Hover gradient bg */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 rounded-3xl`} />

                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                                    <span className="drop-shadow-sm">{f.icon}</span>
                                </div>
                                <h3 className="text-sm font-black text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">{f.title}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>

                                {/* Bottom accent */}
                                <div className={`absolute bottom-0 left-8 right-8 h-0.5 bg-gradient-to-r ${f.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-full`} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ WORKFLOW ═══════════ */}
            <section id="workflow" className="relative bg-slate-50 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6 md:px-10 py-28">
                    <div className="text-center mb-20">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-3">How It Works</p>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                            Seamless Patient Journey
                        </h2>
                        <p className="text-base text-slate-500 font-medium max-w-xl mx-auto">
                            From arrival to discharge — every step is digitized, tracked, and optimized.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-0 relative">
                        {/* Connecting line */}
                        <div className="hidden md:block absolute top-14 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200" />

                        {workflow.map((w, i) => (
                            <div key={i} className="relative flex flex-col items-center text-center px-6 py-6 group">
                                {/* Step circle */}
                                <div className="relative w-28 h-28 rounded-full bg-white border-2 border-blue-100 flex flex-col items-center justify-center mb-6 shadow-lg group-hover:shadow-xl group-hover:border-blue-300 group-hover:-translate-y-2 transition-all duration-500 z-10">
                                    <span className="text-3xl mb-1">{w.icon}</span>
                                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{w.step}</span>
                                </div>
                                <h4 className="text-sm font-black text-slate-900 mb-2">{w.title}</h4>
                                <p className="text-xs text-slate-500 leading-relaxed">{w.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ COMPLIANCE BANNER ═══════════ */}
            <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />

                <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-20 text-center">
                    <h3 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-6">
                        Ready to Transform Your Hospital?
                    </h3>
                    <p className="text-base text-blue-100 font-medium max-w-2xl mx-auto mb-10">
                        Join hospitals across India running on Jeeva Raksha — NABH compliant, ABDM integrated, and HIPAA-ready.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={() => onNavigate('DASHBOARD')} className="px-10 py-4 bg-white text-blue-700 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-[0.97]">
                            Get Started Free →
                        </button>
                        <button onClick={() => onNavigate('DASHBOARD')} className="px-10 py-4 bg-transparent text-white rounded-2xl text-sm font-black uppercase tracking-widest border-2 border-white/30 hover:border-white/60 hover:-translate-y-1 transition-all active:scale-[0.97]">
                            Request Demo
                        </button>
                    </div>
                </div>
            </section>

            {/* ═══════════ TRUST STRIP ═══════════ */}
            <section className="bg-slate-900 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
                    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
                        {[
                            { icon: '🔒', label: 'AES-256 Encrypted' },
                            { icon: '⚡', label: 'Real-time Sync' },
                            { icon: '📋', label: 'Audit-ready Logs' },
                            { icon: '🛡️', label: 'Role-based RBAC' },
                            { icon: '🏅', label: 'NABH Compliant' },
                            { icon: '🏛️', label: 'ABDM Integrated' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="text-lg">{item.icon}</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ FOOTER ═══════════ */}
            <footer className="bg-slate-950">
                <div className="max-w-7xl mx-auto px-6 md:px-10 py-14">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        {/* Brand */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/20">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L3 7V12C3 17.25 6.75 22.05 12 23C17.25 22.05 21 17.25 21 12V7L12 2Z" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.15)" />
                                    <path d="M9 13H15M12 10V16" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-base font-black text-white tracking-tight">Jeeva Raksha</p>
                                <p className="text-[10px] font-medium text-slate-500">Unified Hospital Information System</p>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">All Systems Operational</span>
                            </div>
                        </div>

                        {/* Copyright */}
                        <p className="text-[10px] font-medium text-slate-600">© 2026 Jeeva Raksha. All rights reserved.</p>
                    </div>

                    <div className="mt-10 pt-8 border-t border-white/5 flex flex-wrap items-center justify-center gap-6">
                        {['Privacy Policy', 'Terms of Service', 'HIPAA Compliance', 'Contact Support'].map(link => (
                            <button key={link} className="text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:text-blue-400 transition-colors">{link}</button>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
