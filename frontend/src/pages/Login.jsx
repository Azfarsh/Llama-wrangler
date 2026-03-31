import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import ThemeToggle from '../components/ThemeToggle';
import BrandLogo from '../components/BrandLogo';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [focused, setFocused] = useState('');
    const navigate = useNavigate();
    const { dark, toggle: toggleTheme } = useTheme();

    const handleLogin = (e) => {
        e.preventDefault();
        if (email && password) {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userEmail', email);
            navigate('/dashboard');
        }
    };

    const leftTitle = dark ? '#ffffff' : '#0f172a';
    const leftSub = dark ? 'rgba(255,255,255,0.72)' : '#334155';
    const leftMuted = dark ? 'rgba(45,212,191,0.55)' : '#0d9488';

    return (
        <div className="flex min-h-screen relative overflow-hidden" style={{ background: 'var(--page-bg)' }}>
            <div className="absolute inset-0 grid-pattern pointer-events-none opacity-40" />

            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle dark={dark} toggle={toggleTheme} />
            </div>

            <div
                className="hidden lg:flex lg:w-[48%] xl:w-1/2 relative overflow-hidden items-center justify-center"
                style={{
                    background: dark
                        ? 'linear-gradient(145deg, #0a0f18 0%, #0d2832 45%, #0d4a45 100%)'
                        : 'linear-gradient(145deg, #ccfbf1 0%, #99f6e4 35%, #5eead4 70%, #2dd4bf 100%)',
                }}
            >
                <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 20% 30%, rgba(45,212,191,0.35), transparent 50%), radial-gradient(circle at 80% 70%, rgba(20,184,166,0.25), transparent 45%)' }} />
                <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full blur-3xl" style={{ background: dark ? 'rgba(45,212,191,0.12)' : 'rgba(255,255,255,0.45)' }} />
                <div className="absolute bottom-0 right-0 w-[380px] h-[380px] rounded-full blur-3xl" style={{ background: dark ? 'rgba(13,148,136,0.2)' : 'rgba(13,148,136,0.15)' }} />

                <div className="relative z-10 text-center px-10 max-w-lg">
                    <div className="mb-10 flex justify-center">
                        <div
                            className="p-6 rounded-3xl border shadow-2xl backdrop-blur-md"
                            style={{
                                background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)',
                                borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(15,118,110,0.2)',
                                boxShadow: dark ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 25px 50px -12px rgba(13,148,136,0.2)',
                            }}
                        >
                            <BrandLogo size="hero" />
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold mb-4 tracking-tight" style={{ color: leftTitle }}>Welcome to Axel AI</h2>
                    <p className="text-lg leading-relaxed mb-10" style={{ color: leftSub }}>
                        Your intelligent data workspace. Upload workbooks, describe changes in plain language, and let Gemini-powered Axel AI execute them in the sheet.
                    </p>

                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { icon: '📊', label: 'Dashboards', desc: 'KPI-ready' },
                            { icon: '🧠', label: 'Gemini', desc: 'Understands intent' },
                            { icon: '⚡', label: 'Live preview', desc: 'See updates' },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="p-4 rounded-2xl border backdrop-blur-sm transition-transform hover:-translate-y-0.5"
                                style={{
                                    background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.45)',
                                    borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(15,118,110,0.15)',
                                }}
                            >
                                <div className="text-2xl mb-1.5">{item.icon}</div>
                                <p className="text-sm font-semibold" style={{ color: leftTitle }}>{item.label}</p>
                                <p className="text-[10px] mt-0.5" style={{ color: leftMuted }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                        <span className="text-sm" style={{ color: leftMuted }}>Built for analysts and ops teams</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center px-6 py-14 relative" style={{ background: dark ? 'linear-gradient(180deg, #0c0e16 0%, #0f1119 100%)' : 'var(--panel-bg)' }}>
                <div className="w-full max-w-md relative z-10">
                    <div className="lg:hidden flex justify-center mb-8">
                        <div className="p-3 rounded-2xl border shadow-lg" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                            <BrandLogo size="xl" />
                        </div>
                    </div>

                    <div
                        className="rounded-2xl border p-8 sm:p-9 shadow-xl"
                        style={{
                            background: 'var(--glass-bg)',
                            borderColor: 'var(--glass-border)',
                            boxShadow: dark ? '0 25px 50px -12px rgba(0,0,0,0.45)' : '0 25px 50px -12px rgba(15,23,42,0.08)',
                        }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium mb-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--teal-accent)' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                            Axel AI Studio
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
                        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Sign in to open your workspace and continue with your files.</p>

                        <form onSubmit={handleLogin} className="space-y-5 mt-8">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
                                <div
                                    className={`relative rounded-xl border-2 transition-all duration-300 ${focused === 'email' ? 'ring-2 ring-teal-500/30 border-teal-500' : ''}`}
                                    style={{ background: 'var(--input-bg)', borderColor: focused === 'email' ? undefined : 'var(--border-color)' }}
                                >
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-3.5 bg-transparent rounded-xl focus:outline-none text-sm theme-input"
                                        style={{ color: 'var(--text-primary)' }}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setFocused('email')}
                                        onBlur={() => setFocused('')}
                                        placeholder="you@company.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
                                <div
                                    className={`relative rounded-xl border-2 transition-all duration-300 ${focused === 'password' ? 'ring-2 ring-teal-500/30 border-teal-500' : ''}`}
                                    style={{ background: 'var(--input-bg)', borderColor: focused === 'password' ? undefined : 'var(--border-color)' }}
                                >
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-4 py-3.5 bg-transparent rounded-xl focus:outline-none text-sm theme-input"
                                        style={{ color: 'var(--text-primary)' }}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocused('password')}
                                        onBlur={() => setFocused('')}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3.5 font-bold text-white rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm"
                                style={{ background: 'linear-gradient(135deg, #0d9488, #14b8a6)', boxShadow: '0 12px 36px rgba(13, 148, 136, 0.35)' }}
                            >
                                Sign in to workspace
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                            No account?{' '}
                            <Link to="/signup" className="text-teal-600 dark:text-teal-400 font-semibold hover:underline">Create one</Link>
                        </p>
                    </div>

                    <p className="text-xs text-center mt-6" style={{ color: 'var(--text-muted)' }}>
                        Upload a workbook, prompt Axel AI, and download the updated file when you are done.
                    </p>
                </div>
            </div>
        </div>
    );
}
