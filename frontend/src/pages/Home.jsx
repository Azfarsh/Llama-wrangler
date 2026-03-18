import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AxelLogo from '../assets/Axellogo.png';

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

    const capabilityCards = [
        { title: 'Fast Dashboard Builder', text: 'Generate KPI dashboards from natural language in one action.', icon: '📊' },
        { title: 'Ask-Then-Generate Visuals', text: 'The agent asks before creating charts/diagrams and then executes your choice.', icon: '✅' },
        { title: 'Excel-First Workspace', text: 'Work in an Excel-like table while AI handles cleaning and transformations.', icon: '🧾' },
        { title: 'Data Quality Intelligence', text: 'Track missing values, duplicates, and dataset health after each run.', icon: '🛡️' },
        { title: 'Business Transformations', text: 'Filter, split, merge, pivot, rank, running totals, and more.', icon: '⚙️' },
        { title: 'Export Ready Outputs', text: 'Download transformed data plus dashboard-ready sheets instantly.', icon: '📁' },
    ];

    const movingChips = [
        'Fast Excel Agent', 'Build KPI Dashboard', 'Ask Before Diagrams',
        'Enterprise Excel Theme', 'One-Click Download', 'Natural Language Ops',
        'Dynamic Dashboard Canvas', 'AI Data Wrangling', 'Image-Based Design',
    ];

    const serviceImages = [
        {
            title: 'Dashboard Creation Service',
            desc: 'Our agent creates polished KPI dashboards from raw Excel/CSV datasets.',
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
        <div className="flex flex-col min-h-screen bg-white text-gray-900 overflow-hidden">
            {/* Background grid pattern */}
            <div className="fixed inset-0 grid-pattern pointer-events-none" />

            {/* Floating orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-3xl animate-float" />
                <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] bg-teal-500/8 rounded-full blur-3xl animate-float-slow" />
                <div className="absolute bottom-20 right-1/4 w-[350px] h-[350px] bg-teal-300/10 rounded-full blur-3xl animate-float" />
            </div>

            {/* Navbar */}
            <nav className="flex items-center justify-between px-6 py-4 glass sticky top-0 z-50 border-b border-teal-100/50">
                <Link to="/" className="flex items-center gap-3">
                    <img src={AxelLogo} alt="Axel AI" className="h-10 w-10 rounded-xl object-contain" />
                    <span className="text-xl font-bold text-gray-900">Axel <span className="text-teal-600">AI</span></span>
                </Link>
                <div className="flex items-center gap-6">
                    <Link to="/how-it-works" className="text-gray-600 hover:text-teal-600 transition-colors text-sm font-medium">How It Works</Link>
                    <Link to="/about" className="text-gray-600 hover:text-teal-600 transition-colors text-sm font-medium">About</Link>
                    <Link to="/contact" className="text-gray-600 hover:text-teal-600 transition-colors text-sm font-medium">Contact</Link>
                    <Link to="/login" className="px-4 py-2 text-teal-700 border border-teal-300 rounded-lg hover:bg-teal-50 transition-all text-sm font-medium">Login</Link>
                    <Link to="/signup" className="px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 text-sm font-semibold">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section ref={heroRef} className="relative px-4 pt-24 pb-16 text-center">
                <div className={`transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium mb-8">
                        <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                        Powered by Gemini 2.5 Flash
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 max-w-5xl mx-auto leading-tight text-gray-900">
                        Transform Raw Data Into
                        <br />
                        <span className="gradient-text">Dashboards & Decisions</span>
                    </h1>
                    <p className="max-w-3xl text-lg md:text-xl text-gray-600 mb-10 leading-relaxed mx-auto">
                        Upload your spreadsheet, describe what you need in plain language, and let the AI agent clean,
                        organize, visualize, and generate operational dashboards automatically.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            to="/signup"
                            className="group px-8 py-4 text-lg font-semibold text-white bg-teal-600 rounded-xl shadow-xl shadow-teal-500/25 hover:bg-teal-700 hover:shadow-teal-500/40 transition-all hover:-translate-y-0.5"
                        >
                            Launch Agent Workspace
                            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </Link>
                        <Link
                            to="/dashboard"
                            className="px-8 py-4 text-lg font-semibold text-gray-900 bg-white border-2 border-gray-200 rounded-xl hover:border-teal-300 hover:bg-teal-50 transition-all"
                        >
                            Open Dashboard
                        </Link>
                    </div>
                </div>

                {/* Marquee */}
                <div className={`mt-14 overflow-hidden border-y border-gray-100 py-3 transition-all duration-700 delay-500 ${heroVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="marquee-track text-sm text-teal-700 font-medium">
                        {[...movingChips, ...movingChips].map((chip, i) => (
                            <span key={`${chip}-${i}`} className="mx-3 px-4 py-1.5 rounded-full border border-teal-200 bg-teal-50/80">
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
                                <div className="text-4xl md:text-5xl font-black text-teal-600">
                                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                                </div>
                                <p className="text-sm text-gray-500 mt-1 font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Capability Grid */}
            <section ref={capRef} className="py-16 px-4 relative">
                <div className="max-w-6xl mx-auto">
                    <div className={`text-center mb-12 transition-all duration-700 ${capVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <h2 className="text-4xl font-bold text-gray-900 mb-3">Built for Data Teams</h2>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                            A dynamic agent that creates dashboards, manages data operations, and turns instructions into execution.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {capabilityCards.map((card, i) => (
                            <div
                                key={card.title}
                                className={`card-hover rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-700 ${capVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                                style={{ transitionDelay: `${i * 100}ms` }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-2xl mb-4">{card.icon}</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{card.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Visual Story */}
            <section ref={storyRef} className="py-16 px-4 bg-gray-50/50">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">
                    <div className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-700 ${storyVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Excel View + Chat Copilot</h3>
                        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                            <div className="grid grid-cols-6 gap-1 mb-2">
                                {['A', 'B', 'C', 'D', 'E', 'F'].map((h) => (
                                    <div key={h} className="text-xs bg-teal-500/20 text-teal-300 rounded px-2 py-1 text-center font-mono">{h}</div>
                                ))}
                            </div>
                            {[1, 2, 3, 4, 5].map((r) => (
                                <div key={r} className="grid grid-cols-6 gap-1 mb-1">
                                    <div className="text-xs bg-teal-500/10 text-teal-400 rounded px-2 py-1 font-mono">{`R${r}`}</div>
                                    <div className="text-xs bg-white/5 text-gray-400 rounded px-2 py-1">Name</div>
                                    <div className="text-xs bg-white/5 text-gray-400 rounded px-2 py-1">Region</div>
                                    <div className="text-xs bg-white/5 text-gray-400 rounded px-2 py-1">Sales</div>
                                    <div className="text-xs bg-white/5 text-gray-400 rounded px-2 py-1">Date</div>
                                    <div className="text-xs bg-white/5 text-gray-400 rounded px-2 py-1">Status</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-700 delay-200 ${storyVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Instant Agent Outputs</h3>
                        <div className="space-y-3">
                            <div className="rounded-xl bg-teal-50 border border-teal-100 p-4">
                                <p className="text-sm text-teal-700 mb-2 font-medium">KPI Cards</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Rows', 'Columns', 'Missing', 'Duplicates'].map((k) => (
                                        <div key={k} className="rounded-lg bg-white border border-teal-100 px-3 py-2 text-xs font-medium text-gray-700">
                                            {k}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                                <p className="text-sm text-gray-600 mb-2 font-medium">Diagram + Trends</p>
                                <div className="h-20 rounded-lg bg-gradient-to-r from-teal-100 via-teal-50 to-white shimmer-bg" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Gallery */}
            <section ref={servRef} className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className={`text-center mb-10 transition-all duration-700 ${servVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">What Our Agent Can Create</h2>
                        <p className="text-gray-500">Dashboards, business diagrams, and intelligent spreadsheet services.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {serviceImages.map((item, i) => (
                            <div
                                key={item.title}
                                className={`card-hover rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm transition-all duration-700 ${servVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                                style={{ transitionDelay: `${i * 150}ms` }}
                            >
                                <div className="relative overflow-hidden">
                                    <img src={item.url} alt={item.title} className="h-48 w-full object-cover transition-transform duration-500 hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                </div>
                                <div className="p-5">
                                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section ref={ctaRef} className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-700" />
                <div className="absolute inset-0 grid-pattern opacity-20" />
                <div className={`max-w-4xl mx-auto px-4 text-center relative z-10 transition-all duration-700 ${ctaVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    <h2 className="text-4xl font-bold mb-6 text-white">Ready for an Impressive Data Experience?</h2>
                    <p className="text-xl mb-8 text-teal-100">
                        Build dashboards, diagrams, and clean datasets with one AI agent platform.
                    </p>
                    <Link
                        to="/dashboard"
                        className="inline-block px-8 py-4 text-lg font-semibold bg-white text-teal-700 rounded-xl shadow-xl hover:shadow-2xl hover:bg-gray-50 transition-all hover:-translate-y-0.5"
                    >
                        Enter Dashboard Studio
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-gray-900 text-gray-400 border-t border-gray-800">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <img src={AxelLogo} alt="Axel AI" className="h-8 w-8 rounded-lg object-contain" />
                                <span className="text-white font-semibold">Axel AI</span>
                            </div>
                            <p className="text-sm">Professional AI workspace for data, dashboards, and operations.</p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/how-it-works" className="hover:text-teal-400 transition-colors">How It Works</Link></li>
                                <li><Link to="/about" className="hover:text-teal-400 transition-colors">About</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Account</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/login" className="hover:text-teal-400 transition-colors">Login</Link></li>
                                <li><Link to="/signup" className="hover:text-teal-400 transition-colors">Sign Up</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Capabilities</h4>
                            <p className="text-sm">Data management, operations visibility, diagram generation, dashboarding.</p>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-sm">
                        <p>&copy; 2026 Axel AI. Academic Prototype.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
