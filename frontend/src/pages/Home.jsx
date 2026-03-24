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
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, visible];
}

function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true;
                let start = 0;
                const step = target / (duration / 16);
                const timer = setInterval(() => {
                    start += step;
                    if (start >= target) {
                        setCount(target);
                        clearInterval(timer);
                    } else {
                        setCount(Math.floor(start));
                    }
                }, 16);
            }
        }, { threshold: 0.3 });
        obs.observe(el);
        return () => obs.disconnect();
    }, [target, duration]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function Home() {
    const [heroRef, heroVisible] = useInView(0.1);
    const [capRef, capVisible] = useInView(0.1);
    const [storyRef, storyVisible] = useInView(0.1);
    const [servRef, servVisible] = useInView(0.1);
    const [statsRef, statsVisible] = useInView(0.1);
    const [ctaRef, ctaVisible] = useInView(0.1);
    const [mobileMenu, setMobileMenu] = useState(false);
    const { dark, toggle: toggleTheme } = useTheme();

    const capabilityCards = [
        { title: 'Fast Dashboard Builder', text: 'Generate KPI dashboards from natural language in one action.', icon: '📊' },
        { title: 'Ask-Then-Generate Visuals', text: 'The agent asks before creating charts or diagrams, then executes your choice.', icon: '✅' },
        { title: 'Spreadsheet-First Studio', text: 'Work in a live table preview while Axel AI applies formulas, columns, and new sheets.', icon: '🧾' },
        { title: 'Data Quality Intelligence', text: 'Track missing values, duplicates, and dataset health after each run.', icon: '🛡️' },
        { title: 'Business Transformations', text: 'Filter, split, merge, pivot, rank, running totals, and more.', icon: '⚙️' },
        { title: 'Export Ready Outputs', text: 'Download transformed data plus dashboard-ready sheets instantly.', icon: '📁' },
    ];

    const movingChips = [
        'Axel AI Agent', 'Gemini-Powered', 'Ask Before Diagrams',
        'Live Sheet Preview', 'One-Click Download', 'Natural Language Ops',
        'Dynamic Dashboard Canvas', 'AI Data Wrangling', 'Image-Based Design',
    ];

    const serviceImages = [
        {
            title: 'Dashboard Creation Service',
            desc: 'Axel AI builds polished KPI dashboards from your raw spreadsheets and CSV exports.',
            url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        },
        {
            title: 'Diagram & Trend Insights',
            desc: 'Create chart packs and visual diagrams after user confirmation.',
            url: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=1200&q=80',
        },
        {
            title: 'AI Spreadsheet Operations',
            desc: 'Clean, transform, and standardize business spreadsheets quickly.',
            url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
        },
    ];

    const stats = [
        { value: 50, suffix: '+', label: 'Transformation Types' },
        { value: 10, suffix: 'x', label: 'Faster Processing' },
        { value: 99, suffix: '%', label: 'Accuracy Rate' },
        { value: 5, suffix: 's', label: 'Avg Response Time' },
    ];

    return (
        <div className="flex flex-col min-h-screen overflow-hidden" style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
            <div className="fixed inset-0 grid-pattern pointer-events-none" />

            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl animate-float" />
                <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] bg-teal-500/4 rounded-full blur-3xl animate-float-slow" />
                <div className="absolute bottom-20 right-1/4 w-[350px] h-[350px] bg-teal-400/5 rounded-full blur-3xl animate-float" />
            </div>

            {/* Navbar */}
            <nav className="flex items-center justify-between px-4 sm:px-6 py-4 glass sticky top-0 z-50">
                <Link to="/" className="flex items-center gap-3">
                    <img src={AxelLogo} alt="Axel AI" className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-contain" />
                    <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Axel <span style={{ color: 'var(--teal-accent)' }}>AI</span></span>
                </Link>

                {/* Desktop links */}
                <div className="hidden md:flex items-center gap-5">
                    <Link to="/how-it-works" className="transition-colors text-sm font-medium hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>How It Works</Link>
                    <Link to="/about" className="transition-colors text-sm font-medium hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>About</Link>
                    <Link to="/contact" className="transition-colors text-sm font-medium hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>Contact</Link>
                    <ThemeToggle dark={dark} toggle={toggleTheme} />
                    <Link to="/login" className="px-4 py-2 rounded-lg transition-all text-sm font-medium border" style={{ color: 'var(--teal-accent)', borderColor: 'var(--teal-soft-border)', background: 'var(--teal-soft-bg)' }}>Login</Link>
                    <Link to="/signup" className="px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 text-sm font-semibold">Get Started</Link>
                </div>

                {/* Mobile hamburger */}
                <div className="md:hidden flex items-center gap-2">
                    <ThemeToggle dark={dark} toggle={toggleTheme} />
                    <button
                        className="p-2 hover:text-teal-400 transition-colors"
                        onClick={() => setMobileMenu(!mobileMenu)}
                        aria-label="Toggle menu"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            {mobileMenu
                                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            }
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Mobile menu dropdown */}
            {mobileMenu && (
                <div className="md:hidden glass-dark border-b px-4 py-4 space-y-3 z-40 relative" style={{ borderColor: 'var(--border-color)' }}>
                    <Link to="/how-it-works" onClick={() => setMobileMenu(false)} className="block hover:text-teal-500 text-sm font-medium py-1" style={{ color: 'var(--text-secondary)' }}>How It Works</Link>
                    <Link to="/about" onClick={() => setMobileMenu(false)} className="block hover:text-teal-500 text-sm font-medium py-1" style={{ color: 'var(--text-secondary)' }}>About</Link>
                    <Link to="/contact" onClick={() => setMobileMenu(false)} className="block hover:text-teal-500 text-sm font-medium py-1" style={{ color: 'var(--text-secondary)' }}>Contact</Link>
                    <div className="flex gap-3 pt-2">
                        <Link to="/login" onClick={() => setMobileMenu(false)} className="flex-1 text-center px-4 py-2 rounded-lg text-sm font-medium border" style={{ color: 'var(--teal-accent)', borderColor: 'var(--teal-soft-border)', background: 'var(--teal-soft-bg)' }}>Login</Link>
                        <Link to="/signup" onClick={() => setMobileMenu(false)} className="flex-1 text-center px-4 py-2 text-white bg-teal-600 rounded-lg text-sm font-semibold">Get Started</Link>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section ref={heroRef} className="relative px-4 pt-16 sm:pt-24 pb-12 sm:pb-16 text-center">
                <div className={`transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium mb-8" style={{ background: 'var(--teal-soft-bg)', borderColor: 'var(--teal-soft-border)', color: 'var(--teal-accent)' }}>
                        <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                        Powered by Gemini 2.5 Flash
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-6 max-w-5xl mx-auto leading-tight" style={{ color: 'var(--text-primary)' }}>
                        Transform Raw Data Into
                        <br />
                        <span className="gradient-text">Dashboards & Decisions</span>
                    </h1>
                    <p className="max-w-3xl text-base sm:text-lg md:text-xl mb-10 leading-relaxed mx-auto px-4" style={{ color: 'var(--text-secondary)' }}>
                        Upload your spreadsheet, describe what you need in plain language, and let Axel AI clean,
                        organize, visualize, and generate operational dashboards automatically.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
                        <Link
                            to="/signup"
                            className="group px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white bg-teal-600 rounded-xl shadow-xl shadow-teal-500/20 hover:bg-teal-700 hover:shadow-teal-500/30 transition-all hover:-translate-y-0.5"
                        >
                            Launch Agent Workspace
                            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </Link>
                        <Link
                            to="/dashboard"
                            className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl transition-all border-2 hover:border-teal-500/60"
                            style={{ background: 'var(--panel-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                        >
                            Open Dashboard
                        </Link>
                    </div>
                    <div className="mt-10 flex flex-wrap justify-center gap-3 px-4">
                        {[
                            { t: 'Natural language', d: 'Plain-English prompts' },
                            { t: 'Gemini reasoning', d: 'Interprets your intent' },
                            { t: 'Live workbook', d: 'Preview updates in real time' },
                        ].map((x) => (
                            <div
                                key={x.t}
                                className="px-4 py-2.5 rounded-xl border text-left max-w-[200px]"
                                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                            >
                                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{x.t}</p>
                                <p className="text-[12px] mt-0.5 leading-snug" style={{ color: 'var(--text-secondary)' }}>{x.d}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Marquee */}
                <div className={`mt-14 overflow-hidden border-y py-3 transition-all duration-700 delay-500 ${heroVisible ? 'opacity-100' : 'opacity-0'}`} style={{ borderColor: 'var(--border-color)' }}>
                    <div className="marquee-track text-sm font-medium" style={{ color: 'var(--teal-accent)' }}>
                        {[...movingChips, ...movingChips].map((chip, i) => (
                            <span key={`${chip}-${i}`} className="mx-3 px-4 py-1.5 rounded-full border" style={{ borderColor: 'var(--teal-soft-border)', background: 'var(--teal-soft-bg)' }}>
                                {chip}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Row */}
            <section ref={statsRef} className="py-12 px-4 relative">
                <div className="max-w-4xl mx-auto">
                    <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 transition-all duration-700 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        {stats.map((stat, i) => (
                            <div key={stat.label} className="text-center" style={{ transitionDelay: `${i * 100}ms` }}>
                                <div className="text-4xl md:text-5xl font-black text-teal-400">
                                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                                </div>
                                <p className="text-sm mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Capability Grid */}
            <section ref={capRef} className="py-12 sm:py-16 px-4 relative">
                <div className="max-w-6xl mx-auto">
                    <div className={`text-center mb-12 transition-all duration-700 ${capVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Built for Data Teams</h2>
                        <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                            A dynamic agent that creates dashboards, manages data operations, and turns instructions into execution.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                        {capabilityCards.map((card, i) => (
                            <div
                                key={card.title}
                                className={`card-hover rounded-2xl border p-5 sm:p-6 transition-all duration-700 ${capVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                                style={{ borderColor: 'var(--border-color)', background: 'var(--panel-bg)', transitionDelay: `${i * 100}ms` }}
                            >
                                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-teal-900/40 border border-teal-700/30 flex items-center justify-center text-xl sm:text-2xl mb-4">{card.icon}</div>
                                <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{card.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{card.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Visual Story */}
            <section ref={storyRef} className="py-12 sm:py-16 px-4" style={{ background: 'var(--panel-bg)' }}>
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">
                    <div className={`rounded-2xl border p-5 sm:p-6 transition-all duration-700 ${storyVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`} style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                        <h3 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Live Sheet + Axel AI Chat</h3>
                        <div className="rounded-xl p-4 border" style={{ background: 'var(--page-bg)', borderColor: 'var(--border-color)' }}>
                            <div className="grid grid-cols-6 gap-1 mb-2">
                                {['A', 'B', 'C', 'D', 'E', 'F'].map((h) => (
                                    <div key={h} className="text-xs rounded px-2 py-1 text-center font-mono border" style={{ background: 'var(--teal-soft-bg)', color: 'var(--teal-accent)', borderColor: 'var(--teal-soft-border)' }}>{h}</div>
                                ))}
                            </div>
                            {[1, 2, 3, 4, 5].map((r) => (
                                <div key={r} className="grid grid-cols-6 gap-1 mb-1">
                                    <div className="text-xs rounded px-2 py-1 font-mono border" style={{ background: 'var(--teal-soft-bg)', color: 'var(--teal-accent)', borderColor: 'var(--teal-soft-border)' }}>{`R${r}`}</div>
                                    <div className="text-xs rounded px-2 py-1 border" style={{ background: 'var(--elevated-bg)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>Name</div>
                                    <div className="text-xs rounded px-2 py-1 border" style={{ background: 'var(--elevated-bg)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>Region</div>
                                    <div className="text-xs rounded px-2 py-1 border" style={{ background: 'var(--elevated-bg)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>Sales</div>
                                    <div className="text-xs rounded px-2 py-1 border" style={{ background: 'var(--elevated-bg)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>Date</div>
                                    <div className="text-xs rounded px-2 py-1 border" style={{ background: 'var(--elevated-bg)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>Status</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={`rounded-2xl border p-5 sm:p-6 transition-all duration-700 delay-200 ${storyVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`} style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                        <h3 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Instant Agent Outputs</h3>
                        <div className="space-y-3">
                            <div className="rounded-xl bg-teal-900/30 border border-teal-700/30 p-4">
                                <p className="text-sm mb-2 font-medium" style={{ color: 'var(--teal-accent)' }}>KPI Cards</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Rows', 'Columns', 'Missing', 'Duplicates'].map((k) => (
                                        <div key={k} className="rounded-lg border border-teal-700/30 px-3 py-2 text-xs font-medium" style={{ background: 'var(--panel-bg)', color: 'var(--text-secondary)' }}>
                                            {k}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded-xl border p-4" style={{ background: 'var(--panel-bg)', borderColor: 'var(--border-color)' }}>
                                <p className="text-sm mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Diagram + Trends</p>
                                <div className="h-20 rounded-lg bg-gradient-to-r from-teal-900/40 via-teal-800/20 to-transparent shimmer-bg" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Gallery */}
            <section ref={servRef} className="py-12 sm:py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className={`text-center mb-10 transition-all duration-700 ${servVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>What Axel AI Can Create</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Dashboards, business diagrams, and intelligent spreadsheet workflows.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
                        {serviceImages.map((item, i) => (
                            <div
                                key={item.title}
                                className={`card-hover rounded-2xl overflow-hidden border transition-all duration-700 ${servVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                                style={{ background: 'var(--panel-bg)', borderColor: 'var(--border-color)', transitionDelay: `${i * 150}ms` }}
                            >
                                <div className="relative overflow-hidden">
                                    <img src={item.url} alt={item.title} className="h-44 sm:h-48 w-full object-cover transition-transform duration-500 hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e16]/60 to-transparent" />
                                </div>
                                <div className="p-4 sm:p-5">
                                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section ref={ctaRef} className="py-16 sm:py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-800 to-teal-900" />
                <div className="absolute inset-0 grid-pattern opacity-20" />
                <div className={`max-w-4xl mx-auto px-4 text-center relative z-10 transition-all duration-700 ${ctaVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">Ready for an Impressive Data Experience?</h2>
                    <p className="text-lg sm:text-xl mb-8 text-teal-200">
                        Build dashboards, diagrams, and clean datasets with one AI agent platform.
                    </p>
                    <Link
                        to="/dashboard"
                        className="inline-block px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-white text-teal-800 rounded-xl shadow-xl hover:shadow-2xl hover:bg-gray-100 transition-all hover:-translate-y-0.5"
                    >
                        Enter Dashboard Studio
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 sm:py-12 border-t" style={{ background: 'var(--panel-bg)', borderColor: 'var(--border-color)' }}>
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <img src={AxelLogo} alt="Axel AI" className="h-8 w-8 rounded-lg object-contain" />
                                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Axel AI</span>
                            </div>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Professional AI workspace for data, dashboards, and operations.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/how-it-works" className="transition-colors hover:text-teal-500" style={{ color: 'var(--text-muted)' }}>How It Works</Link></li>
                                <li><Link to="/about" className="transition-colors hover:text-teal-500" style={{ color: 'var(--text-muted)' }}>About</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Account</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/login" className="transition-colors hover:text-teal-500" style={{ color: 'var(--text-muted)' }}>Login</Link></li>
                                <li><Link to="/signup" className="transition-colors hover:text-teal-500" style={{ color: 'var(--text-muted)' }}>Sign Up</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Capabilities</h4>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Data management, operations visibility, diagram generation, dashboarding.</p>
                        </div>
                    </div>
                    <div className="border-t pt-8 text-center text-sm" style={{ borderColor: 'var(--border-color)' }}>
                        <p style={{ color: 'var(--text-muted)' }}>&copy; 2026 Axel AI. Academic Prototype.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
