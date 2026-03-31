import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import ThemeToggle from '../components/ThemeToggle';
import BrandLogo from '../components/BrandLogo';

function useInView(threshold = 0.15) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, visible];
}

export default function HowItWorks() {
    const [ref, visible] = useInView(0.1);
    const [mobileMenu, setMobileMenu] = useState(false);
    const { dark, toggle: toggleTheme } = useTheme();

    const steps = [
        { num: 1, title: 'Upload Dataset', desc: 'Upload your raw CSV or Excel file securely.', icon: '📤' },
        { num: 2, title: 'Describe Goal', desc: 'Tell the agent what you want to achieve (e.g., "Prepare for churn prediction").', icon: '💬' },
        { num: 3, title: 'AI Agent Planning', desc: 'Our LLM agent analyzes the data structure and plans a sequence of operations.', icon: '🧠' },
        { num: 4, title: 'Execution & Download', desc: 'The system executes the cleaning code and provides the final file.', icon: '⚡' },
    ];

    return (
        <div className="min-h-screen" style={{ background: 'var(--page-bg)' }}>
            <nav className="glass px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <Link to="/" className="flex items-center gap-3">
                    <BrandLogo size="md" className="shrink-0" />
                    <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Axel <span style={{ color: 'var(--teal-accent)' }}>AI</span></span>
                </Link>
                <div className="hidden sm:flex items-center gap-4">
                    <Link to="/about" className="transition-colors text-sm font-medium hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>About</Link>
                    <Link to="/" className="transition-colors text-sm font-medium hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>Home</Link>
                    <ThemeToggle dark={dark} toggle={toggleTheme} />
                </div>
                <div className="sm:hidden flex items-center gap-2">
                    <ThemeToggle dark={dark} toggle={toggleTheme} />
                    <button className="p-2 hover:text-teal-400" style={{ color: 'var(--text-secondary)' }} onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            {mobileMenu
                                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            }
                        </svg>
                    </button>
                </div>
            </nav>
            {mobileMenu && (
                <div className="sm:hidden glass-dark border-b px-4 py-3 space-y-2 z-40 relative" style={{ borderColor: 'var(--border-color)' }}>
                    <Link to="/about" onClick={() => setMobileMenu(false)} className="block hover:text-teal-600 text-sm font-medium py-1" style={{ color: 'var(--text-secondary)' }}>About</Link>
                    <Link to="/" onClick={() => setMobileMenu(false)} className="block hover:text-teal-600 text-sm font-medium py-1" style={{ color: 'var(--text-secondary)' }}>Home</Link>
                </div>
            )}

            <div ref={ref} className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
                <div className={`text-center mb-12 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>How It Works</h1>
                    <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        Axel AI uses a multi-agent pipeline powered by Gemini to transform your data in four simple steps.
                    </p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                    {steps.map((step, i) => (
                        <div
                            key={step.num}
                            className={`flex gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl border card-hover transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                            style={{ background: 'var(--panel-bg)', borderColor: 'var(--border-color)', transitionDelay: `${i * 150}ms` }}
                        >
                            <div
                                className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border flex items-center justify-center text-xl sm:text-2xl"
                                style={{ background: 'var(--teal-soft-bg)', borderColor: 'var(--teal-soft-border)' }}
                            >
                                {step.icon}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span
                                        className="text-xs px-2 py-0.5 rounded-full font-semibold border"
                                        style={{
                                            background: 'var(--teal-soft-bg)',
                                            color: 'var(--teal-accent)',
                                            borderColor: 'var(--teal-soft-border)',
                                        }}
                                    >
                                        Step {step.num}
                                    </span>
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                                <p className="mt-1 text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={`mt-12 text-center transition-all duration-700 delay-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <Link to="/signup" className="px-6 sm:px-8 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/15 inline-block">
                        Get Started Now
                    </Link>
                </div>
            </div>
        </div>
    );
}
