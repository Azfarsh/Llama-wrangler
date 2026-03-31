import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import ThemeToggle from '../components/ThemeToggle';
import BrandLogo from '../components/BrandLogo';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [focused, setFocused] = useState('');
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const { dark, toggle: toggleTheme } = useTheme();

    const handleSignup = (e) => {
        e.preventDefault();
        if (name && email && password) {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', name);
            localStorage.setItem('userData', JSON.stringify({ name, email, password, createdAt: new Date().toISOString() }));
            navigate('/dashboard');
        }
    };

    const wrapStyle = (field) => ({
        background: 'var(--input-bg)',
        borderColor: focused === field ? undefined : 'var(--border-color)',
    });

    const leftTitle = dark ? '#ffffff' : '#0f172a';
    const leftSub = dark ? 'rgba(255,255,255,0.72)' : '#334155';
    const stepActive = dark ? 'text-teal-200' : 'text-teal-800';
    const stepInactive = dark ? 'text-slate-500' : 'text-slate-600';

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
                <div className="absolute inset-0 opacity-25" style={{ background: 'radial-gradient(circle at 70% 20%, rgba(45,212,191,0.35), transparent 45%)' }} />
                <div className="absolute top-24 -right-16 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: dark ? 'rgba(45,212,191,0.1)' : 'rgba(255,255,255,0.4)' }} />

                <div className="relative z-10 text-center px-10 max-w-lg">
                    <div className="mb-10 flex justify-center">
                        <div
                            className="p-6 rounded-3xl border shadow-2xl backdrop-blur-md"
                            style={{
                                background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)',
                                borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(15,118,110,0.2)',
                            }}
                        >
                            <BrandLogo size="hero" />
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold mb-4 tracking-tight" style={{ color: leftTitle }}>Join Axel AI</h2>
                    <p className="text-lg leading-relaxed" style={{ color: leftSub }}>
                        Create your account and start transforming spreadsheets with AI-driven execution and structured answers.
                    </p>

                    <div className="mt-12 space-y-3 max-w-sm mx-auto text-left">
                        {[
                            { num: 1, text: 'Create your account', icon: '👤' },
                            { num: 2, text: 'Upload your workbook', icon: '📄' },
                            { num: 3, text: 'Prompt Axel AI to run changes', icon: '🚀' },
                        ].map((s) => (
                            <div
                                key={s.num}
                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 ${step >= s.num ? 'shadow-lg' : ''}`}
                                style={{
                                    background: step >= s.num
                                        ? (dark ? 'rgba(45,212,191,0.12)' : 'rgba(255,255,255,0.5)')
                                        : (dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.35)'),
                                    borderColor: step >= s.num
                                        ? (dark ? 'rgba(45,212,191,0.35)' : 'rgba(13,148,136,0.35)')
                                        : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,118,110,0.12)'),
                                }}
                            >
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                    style={{ background: step >= s.num ? 'rgba(45,212,191,0.25)' : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.6)') }}
                                >
                                    {s.icon}
                                </div>
                                <div>
                                    <span className={`text-sm font-medium ${step >= s.num ? stepActive : stepInactive}`}>{s.text}</span>
                                    <div className={`text-[10px] mt-0.5 ${step >= s.num ? (dark ? 'text-teal-400/70' : 'text-teal-700') : stepInactive}`}>Step {s.num}</div>
                                </div>
                            </div>
                        ))}
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
                        <h2 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Create account</h2>
                        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Start building dashboards and sheet workflows in minutes.</p>

                        <div className="flex gap-2 mt-7 mb-2">
                            {[1, 2, 3].map((s) => (
                                <div
                                    key={s}
                                    className="h-1.5 flex-1 rounded-full transition-all duration-500"
                                    style={{ background: s <= step ? '#14b8a6' : 'var(--border-color)' }}
                                />
                            ))}
                        </div>

                        <form onSubmit={handleSignup} className="space-y-5 mt-6">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Full name</label>
                                <div
                                    className={`relative rounded-xl border-2 transition-all duration-300 ${focused === 'name' ? 'ring-2 ring-teal-500/30 border-teal-500' : ''}`}
                                    style={wrapStyle('name')}
                                >
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-3.5 bg-transparent rounded-xl focus:outline-none text-sm theme-input"
                                        style={{ color: 'var(--text-primary)' }}
                                        value={name}
                                        onChange={(e) => { setName(e.target.value); if (e.target.value) setStep(Math.max(step, 1)); }}
                                        onFocus={() => setFocused('name')}
                                        onBlur={() => setFocused('')}
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
                                <div
                                    className={`relative rounded-xl border-2 transition-all duration-300 ${focused === 'email' ? 'ring-2 ring-teal-500/30 border-teal-500' : ''}`}
                                    style={wrapStyle('email')}
                                >
                                    <input
                                        type="email" required
                                        className="w-full px-4 py-3.5 bg-transparent rounded-xl focus:outline-none text-sm theme-input"
                                        style={{ color: 'var(--text-primary)' }}
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); if (e.target.value) setStep(Math.max(step, 2)); }}
                                        onFocus={() => setFocused('email')}
                                        onBlur={() => setFocused('')}
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
                                <div
                                    className={`relative rounded-xl border-2 transition-all duration-300 ${focused === 'password' ? 'ring-2 ring-teal-500/30 border-teal-500' : ''}`}
                                    style={wrapStyle('password')}
                                >
                                    <input
                                        type="password" required
                                        className="w-full px-4 py-3.5 bg-transparent rounded-xl focus:outline-none text-sm theme-input"
                                        style={{ color: 'var(--text-primary)' }}
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); if (e.target.value) setStep(3); }}
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
                                Create account & launch workspace
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                            Already registered?{' '}
                            <Link to="/login" className="text-teal-600 dark:text-teal-400 font-semibold hover:underline">Sign in</Link>
                        </p>
                    </div>

                    <p className="text-xs text-center mt-6" style={{ color: 'var(--text-muted)' }}>
                        Axel AI can add columns, formulas, summaries, and charts when your prompt asks for workbook changes.
                    </p>
                </div>
            </div>
        </div>
    );
}
