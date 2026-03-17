import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
    const capabilityCards = [
        { title: 'Fast Dashboard Builder', text: 'Generate KPI dashboards from natural language in one action.', icon: '📊' },
        { title: 'Ask-Then-Generate Visuals', text: 'The agent asks before creating charts/diagrams and then executes your choice.', icon: '✅' },
        { title: 'Excel-First Workspace', text: 'Work in an Excel-like table while AI handles cleaning and transformations.', icon: '🧾' },
        { title: 'Data Quality Intelligence', text: 'Track missing values, duplicates, and dataset health after each run.', icon: '🛡️' },
        { title: 'Business Transformations', text: 'Filter, split, merge, pivot, rank, running totals, and more.', icon: '⚙️' },
        { title: 'Export Ready Outputs', text: 'Download transformed data plus dashboard-ready sheets instantly.', icon: '📁' },
    ];

    const movingChips = [
        'Fast Excel Agent',
        'Build KPI Dashboard',
        'Ask Before Diagrams',
        'Enterprise Excel Theme',
        'One-Click Download',
        'Natural Language Ops',
        'Dynamic Dashboard Canvas',
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

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-950 via-green-900 to-emerald-950 text-white overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-40 -left-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-20 right-0 w-[30rem] h-[30rem] bg-lime-400/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-green-300/20 rounded-full blur-3xl animate-pulse" />
            </div>

            {/* Navbar */}
            <nav className="flex items-center justify-between p-6 bg-emerald-950/80 backdrop-blur border-b border-white/10 sticky top-0 z-50 relative">
                <div className="text-2xl font-bold text-emerald-200">Excel Agent Studio</div>
                <div className="space-x-4 flex items-center">
                    <Link to="/how-it-works" className="text-slate-300 hover:text-white transition-colors">How It Works</Link>
                    <Link to="/about" className="text-slate-300 hover:text-white transition-colors">About</Link>
                    <Link to="/login" className="px-4 py-2 text-emerald-100 border border-emerald-300/60 rounded-lg hover:bg-emerald-500/10 transition-colors">Login</Link>
                    <Link to="/signup" className="px-4 py-2 text-emerald-950 bg-emerald-300 rounded-lg hover:bg-emerald-200 transition-colors shadow-md font-semibold">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative px-4 py-20 text-center">
                <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 max-w-5xl mx-auto leading-tight">
                    Transform Raw Data Into
                    <br />
                    <span className="text-emerald-300">Dashboards, Diagrams, and Decisions</span>
                </h1>
                <p className="max-w-3xl text-lg md:text-xl text-slate-300 mb-10 leading-relaxed mx-auto">
                    Upload your spreadsheet, ask in plain language, and let the agent clean, organize, visualize,
                    and generate operational dashboards in one professional workspace.
                </p>
                <div className="flex gap-4 justify-center">
                    <Link 
                        to="/signup" 
                        className="px-8 py-4 text-lg font-semibold text-emerald-950 bg-emerald-300 rounded-lg shadow-lg hover:bg-emerald-200 transition-all hover:shadow-xl"
                    >
                        Launch Agent Workspace
                    </Link>
                    <Link 
                        to="/dashboard" 
                        className="px-8 py-4 text-lg font-semibold text-white bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all"
                    >
                        Open Dashboard
                    </Link>
                </div>

                <div className="mt-10 overflow-hidden border-y border-white/10 py-3">
                    <div className="marquee-track text-sm text-cyan-200/90 font-medium">
                        {[...movingChips, ...movingChips].map((chip, i) => (
                            <span key={`${chip}-${i}`} className="mx-4 px-3 py-1 rounded-full border border-emerald-300/30 bg-emerald-500/10">
                                {chip}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Capability Grid */}
            <section className="py-16 px-4 relative">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-3">Built for Data Teams and Operations</h2>
                    <p className="text-center text-slate-300 mb-10">
                        A dynamic agent that creates and organizes dashboards, manages data operations, and turns instructions into execution.
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {capabilityCards.map((card) => (
                            <div
                                key={card.title}
                                className="rounded-2xl border border-emerald-200/20 bg-white/5 p-6 shadow-xl hover:scale-[1.02] hover:bg-white/10 transition-all duration-300"
                            >
                                <div className="text-3xl mb-3">{card.icon}</div>
                                <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                                <p className="text-sm text-slate-300 leading-relaxed">{card.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Visual Story */}
            <section className="py-12 px-4">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-emerald-300/20 bg-gradient-to-br from-emerald-500/10 to-green-500/10 p-6">
                        <h3 className="text-2xl font-bold mb-4">Excel View + Chat Copilot</h3>
                        <div className="bg-slate-900/70 border border-white/10 rounded-xl p-4">
                            <div className="grid grid-cols-6 gap-1 mb-2">
                                {['A', 'B', 'C', 'D', 'E', 'F'].map((h) => (
                                    <div key={h} className="text-xs bg-white/10 rounded px-2 py-1 text-center">{h}</div>
                                ))}
                            </div>
                            {[1, 2, 3, 4, 5].map((r) => (
                                <div key={r} className="grid grid-cols-6 gap-1 mb-1">
                                    <div className="text-xs bg-emerald-500/20 rounded px-2 py-1">{`Row ${r}`}</div>
                                    <div className="text-xs bg-white/10 rounded px-2 py-1">Name</div>
                                    <div className="text-xs bg-white/10 rounded px-2 py-1">Region</div>
                                    <div className="text-xs bg-white/10 rounded px-2 py-1">Sales</div>
                                    <div className="text-xs bg-white/10 rounded px-2 py-1">Date</div>
                                    <div className="text-xs bg-white/10 rounded px-2 py-1">Status</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-emerald-300/20 bg-gradient-to-br from-lime-500/10 to-emerald-500/10 p-6">
                        <h3 className="text-2xl font-bold mb-4">Instant Agent Visual Outputs</h3>
                        <div className="space-y-3">
                            <div className="rounded-xl bg-white/10 border border-white/10 p-4">
                                <p className="text-sm text-slate-300 mb-2">KPI Cards</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Rows', 'Columns', 'Missing', 'Duplicates'].map((k) => (
                                        <div key={k} className="rounded-lg bg-emerald-500/20 px-3 py-2 text-xs">
                                            {k}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded-xl bg-white/10 border border-white/10 p-4">
                                <p className="text-sm text-slate-300 mb-2">Diagram + Trends</p>
                                <div className="h-20 rounded bg-gradient-to-r from-emerald-400/30 via-green-400/20 to-lime-300/30 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Gallery */}
            <section className="py-14 px-4 border-y border-white/10 bg-black/10">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-3">What Our Agent Can Create</h2>
                    <p className="text-center text-slate-200 mb-8">
                        Dashboards, business diagrams, and intelligent spreadsheet services.
                    </p>
                    <div className="grid md:grid-cols-3 gap-5">
                        {serviceImages.map((item) => (
                            <div key={item.title} className="rounded-2xl overflow-hidden border border-white/20 bg-white/5">
                                <img src={item.url} alt={item.title} className="h-44 w-full object-cover" />
                                <div className="p-4">
                                    <h3 className="font-semibold text-emerald-100">{item.title}</h3>
                                    <p className="text-sm text-slate-200 mt-1">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-white border-y border-white/10">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready for an Impressive Data Experience?</h2>
                    <p className="text-xl mb-8 text-slate-200">
                        Build dashboards, diagrams, and clean datasets with one AI agent platform.
                    </p>
                    <Link 
                        to="/dashboard" 
                        className="inline-block px-8 py-4 text-lg font-semibold bg-emerald-300 text-emerald-950 rounded-lg shadow-xl hover:bg-emerald-200 transition-all"
                    >
                        Enter Dashboard Studio
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-slate-950 text-slate-400 border-t border-white/10">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h4 className="text-white font-semibold mb-4">Excel Agent Studio</h4>
                            <p className="text-sm">Professional AI workspace for data, dashboards, and operations.</p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/how-it-works" className="hover:text-white">How It Works</Link></li>
                                <li><Link to="/about" className="hover:text-white">About</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Account</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/login" className="hover:text-white">Login</Link></li>
                                <li><Link to="/signup" className="hover:text-white">Sign Up</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Capabilities</h4>
                            <p className="text-sm">Data management, operations visibility, diagram generation, dashboarding.</p>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-sm">
                        <p>© 2026 Excel Agent Studio. Academic Prototype.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
