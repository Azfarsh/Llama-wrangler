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

export default function HowItWorks() {
    const [ref, visible] = useInView(0.1);

    const steps = [
        { num: 1, title: 'Upload Dataset', desc: 'Upload your raw CSV or Excel file securely.', icon: '📤' },
        { num: 2, title: 'Describe Goal', desc: 'Tell the agent what you want to achieve (e.g., "Prepare for churn prediction").', icon: '💬' },
        { num: 3, title: 'AI Agent Planning', desc: 'Our LLM agent analyzes the data structure and plans a sequence of operations.', icon: '🧠' },
        { num: 4, title: 'Execution & Download', desc: 'The system executes the cleaning code and provides the final file.', icon: '⚡' },
    ];

    return (
        <div className="min-h-screen bg-white">
            <nav className="glass border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <Link to="/" className="flex items-center gap-3">
                    <img src={AxelLogo} alt="Axel AI" className="h-9 w-9 rounded-xl object-contain" />
                    <span className="text-xl font-bold text-gray-900">Axel <span className="text-teal-600">AI</span></span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link to="/about" className="text-gray-600 hover:text-teal-600 transition-colors text-sm font-medium">About</Link>
                    <Link to="/" className="text-gray-600 hover:text-teal-600 transition-colors text-sm font-medium">Home</Link>
                </div>
            </nav>

            <div ref={ref} className="max-w-4xl mx-auto px-4 py-16">
                <div className={`text-center mb-12 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        Axel AI uses a multi-agent pipeline powered by Gemini to transform your data in four simple steps.
                    </p>
                </div>

                <div className="space-y-6">
                    {steps.map((step, i) => (
                        <div
                            key={step.num}
                            className={`flex gap-6 p-6 rounded-2xl border border-gray-100 bg-white shadow-sm card-hover transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                            style={{ transitionDelay: `${i * 150}ms` }}
                        >
                            <div className="shrink-0 w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-2xl">
                                {step.icon}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 font-semibold border border-teal-100">Step {step.num}</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                                <p className="text-gray-500 mt-1">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={`mt-12 text-center transition-all duration-700 delay-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <Link to="/signup" className="px-8 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 inline-block">
                        Get Started Now
                    </Link>
                </div>
            </div>
        </div>
    );
}
