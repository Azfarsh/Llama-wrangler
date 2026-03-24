import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AxelLogo from '../assets/Axellogo.png';
import { useTheme } from '../hooks/useTheme';
import ThemeToggle from '../components/ThemeToggle';

function useInView(threshold = 0.15) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true); }, { threshold });
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, visible];
}

export default function About() {
    const [heroRef, heroVisible] = useInView(0.1);
    const [archRef, archVisible] = useInView(0.1);
    const [featRef, featVisible] = useInView(0.1);
    const [techRef, techVisible] = useInView(0.1);
    const [mobileMenu, setMobileMenu] = useState(false);
    const { dark, toggle: toggleTheme } = useTheme();

    const agents = [
        { name: 'Intent Understanding', desc: 'Analyzes your natural language query to understand what you need.', icon: '🧠', color: 'from-blue-500/20 to-blue-600/5' },
        { name: 'Planning Agent', desc: 'Creates a step-by-step transformation and analysis plan.', icon: '📋', color: 'from-purple-500/20 to-purple-600/5' },
        { name: 'Execution Agent', desc: 'Performs safe, deterministic data operations on your sheet.', icon: '⚡', color: 'from-teal-500/20 to-teal-600/5' },
        { name: 'Validation Agent', desc: 'Validates results and generates insights from processed data.', icon: '✅', color: 'from-green-500/20 to-green-600/5' },
    ];

    const features = [
        { text: 'Natural language interface - no coding required', icon: '💬' },
        { text: 'Automatic dataset profiling and understanding', icon: '📊' },
        { text: 'Comprehensive data transformations', icon: '🔄' },
        { text: 'ML-ready output formats', icon: '🤖' },
        { text: 'Rich visualizations and insights', icon: '📈' },
        { text: 'Safe, deterministic execution', icon: '🛡️' },
    ];

    return (
        <div className="min-h-screen" style={{ background: 'var(--page-bg)' }}>
            <nav className="glass px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <Link to="/" className="flex items-center gap-3">
                    <img src={AxelLogo} alt="Axel AI" className="h-9 w-9 rounded-xl object-contain" />
                    <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Axel <span style={{ color: 'var(--teal-accent)' }}>AI</span></span>
                </Link>
                <div className="hidden sm:flex items-center gap-4">
                    <Link to="/how-it-works" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>How It Works</Link>
                    <Link to="/" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>Home</Link>
                    <ThemeToggle dark={dark} toggle={toggleTheme} />
                </div>
                <div className="sm:hidden flex items-center gap-2">
                    <ThemeToggle dark={dark} toggle={toggleTheme} />
                    <button className="p-2 hover:text-teal-400" style={{ color: 'var(--text-secondary)' }} onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            {mobileMenu ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
                        </svg>
                    </button>
                </div>
            </nav>
            {mobileMenu && (
                <div className="sm:hidden glass-dark px-4 py-3 space-y-2 z-40 relative" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <Link to="/how-it-works" onClick={() => setMobileMenu(false)} className="block text-sm font-medium py-1 hover:text-teal-400" style={{ color: 'var(--text-secondary)' }}>How It Works</Link>
                    <Link to="/" onClick={() => setMobileMenu(false)} className="block text-sm font-medium py-1 hover:text-teal-400" style={{ color: 'var(--text-secondary)' }}>Home</Link>
                </div>
            )}

            <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
                {/* Hero */}
                <div ref={heroRef} className={`text-center mb-16 transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium mb-6" style={{ background: 'var(--teal-soft-bg)', borderColor: 'var(--teal-soft-border)', color: 'var(--teal-accent)' }}>
                        <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                        About the Platform
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                        Built for the Future of <span className="gradient-text">Data Intelligence</span>
                    </h1>
                    <p className="text-base sm:text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        Axel AI is an agentic, LLM-powered data wrangling system that democratizes data preparation.
                        It eliminates the need for manual coding and complex spreadsheet operations.
                    </p>
                </div>

                {/* Problem / Solution */}
                <div className={`grid sm:grid-cols-2 gap-6 mb-16 transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
                    <div className="rounded-2xl p-6" style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-color)' }}>
                        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl mb-4">🔴</div>
                        <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>The Problem</h3>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            Data professionals spend 70-80% of their time cleaning and preparing data. Traditional tools require technical expertise and are time-consuming.
                        </p>
                    </div>
                    <div className="rounded-2xl p-6" style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-color)' }}>
                        <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-2xl mb-4">🟢</div>
                        <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Our Solution</h3>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            Axel AI uses intelligent agents to understand your intent and automatically transform your data with natural language instructions.
                        </p>
                    </div>
                </div>

                {/* Architecture diagram */}
                <div ref={archRef} className={`mb-16 transition-all duration-700 ${archVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3" style={{ color: 'var(--text-primary)' }}>Multi-Agent Architecture</h2>
                    <p className="text-center mb-10" style={{ color: 'var(--text-muted)' }}>Powered by Google Gemini 2.5 Flash</p>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {agents.map((agent, i) => (
                            <div
                                key={agent.name}
                                className={`rounded-2xl p-5 card-hover transition-all duration-700 ${archVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                                style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-color)', transitionDelay: `${i * 100}ms` }}
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-2xl mb-4 border border-white/5`}>
                                    {agent.icon}
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 font-medium border border-teal-500/20">{i + 1}</span>
                                    <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{agent.name}</h4>
                                </div>
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{agent.desc}</p>
                                {i < 3 && <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 text-teal-500/30 text-xl">&rarr;</div>}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 text-center">
                        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                            <span className="text-lg">📄</span>
                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Based on:</span>
                            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>AutoDW: Automatic Data Wrangling (ASE 2024)</span>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div ref={featRef} className={`mb-16 transition-all duration-700 ${featVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10" style={{ color: 'var(--text-primary)' }}>Key Features</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {features.map((feat, i) => (
                            <div
                                key={feat.text}
                                className={`flex items-center gap-4 p-4 rounded-xl card-hover transition-all duration-500 ${featVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                                style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-color)', transitionDelay: `${i * 80}ms` }}
                            >
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>{feat.icon}</div>
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{feat.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tech Stack */}
                <div ref={techRef} className={`mb-12 transition-all duration-700 ${techVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10" style={{ color: 'var(--text-primary)' }}>Technology Stack</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="rounded-2xl p-6" style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-color)' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-lg">⚙️</div>
                                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Backend</h3>
                            </div>
                            <div className="space-y-2">
                                {['FastAPI (Python)', 'Pandas & NumPy', 'Google Gemini API', 'scikit-learn', 'openpyxl'].map((t) => (
                                    <div key={t} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm" style={{ background: 'var(--card-bg)' }}>
                                        <span className="w-2 h-2 rounded-full bg-teal-400" />
                                        <span style={{ color: 'var(--text-secondary)' }}>{t}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-2xl p-6" style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-color)' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-lg">🎨</div>
                                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Frontend</h3>
                            </div>
                            <div className="space-y-2">
                                {['React 19', 'Tailwind CSS v4', 'React Router v7', 'Vite 7', 'Axios'].map((t) => (
                                    <div key={t} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm" style={{ background: 'var(--card-bg)' }}>
                                        <span className="w-2 h-2 rounded-full bg-teal-400" />
                                        <span style={{ color: 'var(--text-secondary)' }}>{t}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/signup" className="px-8 py-3.5 text-white rounded-xl font-semibold hover:opacity-90 transition-all text-center text-sm" style={{ background: 'linear-gradient(135deg, #0d9488, #14b8a6)', boxShadow: '0 8px 30px rgba(13,148,136,0.25)' }}>
                        Get Started
                    </Link>
                    <Link to="/" className="px-8 py-3.5 rounded-xl font-semibold transition-all text-center text-sm" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
