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

export default function About() {
    const [heroRef, heroVisible] = useInView(0.1);
    const [featRef, featVisible] = useInView(0.1);

    return (
        <div className="min-h-screen bg-white">
            <nav className="glass border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <Link to="/" className="flex items-center gap-3">
                    <img src={AxelLogo} alt="Axel AI" className="h-9 w-9 rounded-xl object-contain" />
                    <span className="text-xl font-bold text-gray-900">Axel <span className="text-teal-600">AI</span></span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link to="/how-it-works" className="text-gray-600 hover:text-teal-600 transition-colors text-sm font-medium">How It Works</Link>
                    <Link to="/" className="text-gray-600 hover:text-teal-600 transition-colors text-sm font-medium">Home</Link>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 py-16">
                <div ref={heroRef} className={`mb-12 transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">About Axel AI</h1>

                    <div className="prose max-w-none">
                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                            Axel AI is an agentic, LLM-powered data wrangling system designed to democratize
                            data preparation. Built for data scientists, analysts, and anyone who works with data,
                            it eliminates the need for manual coding and complex spreadsheet operations.
                        </p>

                        <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">The Problem We Solve</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Data professionals spend 70-80% of their time cleaning and preparing data. Traditional
                                tools require technical expertise, are time-consuming, and error-prone. Axel AI
                                changes this by using AI agents to understand your intent and automatically transform your data.
                            </p>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            Our system uses a multi-agent architecture powered by Google Gemini:
                        </p>
                        <div className="grid md:grid-cols-2 gap-3 mb-8">
                            {[
                                { name: 'Intent Understanding Agent', desc: 'Analyzes your natural language query' },
                                { name: 'Planning Agent', desc: 'Creates a step-by-step transformation plan' },
                                { name: 'Execution Agent', desc: 'Performs safe, deterministic data operations' },
                                { name: 'Validation Agent', desc: 'Validates results and generates insights' },
                            ].map((agent) => (
                                <div key={agent.name} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm card-hover">
                                    <h4 className="font-semibold text-gray-900 mb-1">{agent.name}</h4>
                                    <p className="text-sm text-gray-500">{agent.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-6 mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Research Foundation</h2>
                            <p className="text-gray-600 mb-3">This project is inspired by the research paper:</p>
                            <div className="bg-white rounded-xl p-4 border border-teal-100">
                                <p className="font-semibold text-gray-900">AutoDW: Automatic Data Wrangling Leveraging Large Language Models</p>
                                <p className="text-teal-600 text-sm font-medium">ASE 2024</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div ref={featRef}>
                    <h2 className={`text-2xl font-bold text-gray-900 mb-4 transition-all duration-700 ${featVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>Key Features</h2>
                    <div className="grid md:grid-cols-2 gap-3 mb-8">
                        {[
                            'Natural language interface - no coding required',
                            'Automatic dataset profiling and understanding',
                            'Comprehensive data transformations',
                            'ML-ready output formats',
                            'Rich visualizations and insights',
                            'Safe, deterministic execution',
                        ].map((feat, i) => (
                            <div
                                key={feat}
                                className={`flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-500 ${featVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                                style={{ transitionDelay: `${i * 80}ms` }}
                            >
                                <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                                <span className="text-sm text-gray-700">{feat}</span>
                            </div>
                        ))}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Technology Stack</h2>
                    <div className="grid md:grid-cols-2 gap-4 mb-8">
                        <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
                            <h3 className="font-semibold text-gray-900 mb-3">Backend</h3>
                            <ul className="text-sm text-gray-600 space-y-1.5">
                                {['FastAPI (Python)', 'Pandas', 'Google Gemini API', 'scikit-learn'].map((t) => (
                                    <li key={t} className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />{t}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
                            <h3 className="font-semibold text-gray-900 mb-3">Frontend</h3>
                            <ul className="text-sm text-gray-600 space-y-1.5">
                                {['React 19', 'Tailwind CSS', 'React Router', 'Vite'].map((t) => (
                                    <li key={t} className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />{t}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 mb-8">
                        <p className="text-gray-500 text-sm">
                            <strong className="text-gray-700">Note:</strong> This is an academic prototype. For production use, additional
                            features like proper authentication, database storage, and comprehensive error handling
                            would be recommended.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Link to="/signup" className="px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20">
                            Get Started
                        </Link>
                        <Link to="/" className="px-6 py-3 bg-gray-50 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all border border-gray-200">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
