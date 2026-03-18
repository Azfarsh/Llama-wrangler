import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AxelLogo from '../assets/Axellogo.png';

function AnimatedStat({ label, value, color = 'teal', delay = 0 }) {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setShow(true), delay);
        return () => clearTimeout(t);
    }, [delay]);
    const colorMap = {
        teal: 'text-teal-600 bg-teal-50 border-teal-100',
        purple: 'text-purple-600 bg-purple-50 border-purple-100',
        amber: 'text-amber-600 bg-amber-50 border-amber-100',
        rose: 'text-rose-600 bg-rose-50 border-rose-100',
    };
    return (
        <div className={`p-4 rounded-xl border transition-all duration-500 ${colorMap[color]} ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
            <div className="text-3xl font-bold">{value}</div>
            <div className="text-sm text-gray-600">{label}</div>
        </div>
    );
}

export default function Download() {
    const navigate = useNavigate();
    const [insights, setInsights] = useState(null);
    const [executionLog, setExecutionLog] = useState([]);
    const [processedProfile, setProcessedProfile] = useState(null);
    const downloadUrl = localStorage.getItem('downloadUrl') || '#';
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
    const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:8000';

    const buildUrl = (path) => {
        if (!path) return '#';
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        if (import.meta.env.DEV) return path;
        return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
    };

    useEffect(() => {
        const storedInsights = localStorage.getItem('insights');
        const storedLog = localStorage.getItem('executionLog');
        const storedProfile = localStorage.getItem('processedProfile');
        if (storedInsights) try { setInsights(JSON.parse(storedInsights)); } catch {}
        if (storedLog) try { setExecutionLog(JSON.parse(storedLog)); } catch {}
        if (storedProfile) try { setProcessedProfile(JSON.parse(storedProfile)); } catch {}
    }, []);

    const sessionId = localStorage.getItem('sessionId');

    const handleDownload = () => window.open(buildUrl(downloadUrl), '_blank');
    const handleDownloadCode = () => { if (sessionId) window.open(buildUrl(`${API_BASE_URL}/code/${sessionId}`), '_blank'); };
    const handleNewSession = () => {
        localStorage.removeItem('sessionId');
        localStorage.removeItem('filename');
        localStorage.removeItem('downloadUrl');
        localStorage.removeItem('insights');
        localStorage.removeItem('executionLog');
        localStorage.removeItem('processedProfile');
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-white">
            <nav className="glass border-b border-gray-100 px-6 py-3 flex items-center gap-3 sticky top-0 z-20">
                <img src={AxelLogo} alt="Axel AI" className="h-8 w-8 rounded-lg object-contain" />
                <span className="text-xl font-bold text-gray-900">Axel <span className="text-teal-600">AI</span></span>
            </nav>

            <div className="max-w-5xl mx-auto px-4 py-12">
                {/* Success Header */}
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-8 mb-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-50 flex items-center justify-center">
                        <span className="text-3xl">✅</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Wrangling Complete!</h1>
                    <p className="text-gray-500 text-lg">Your dataset has been successfully transformed and is ready to use.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {insights && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-lg">💡</span>
                                Key Insights
                            </h2>
                            <div className="mb-4">
                                <h3 className="font-semibold text-gray-700 mb-2">Summary</h3>
                                <p className="text-gray-600">{insights.summary || 'Dataset processed successfully'}</p>
                            </div>
                            {insights.insights?.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="font-semibold text-gray-700 mb-2">Insights</h3>
                                    <ul className="space-y-1 text-gray-600">
                                        {insights.insights.map((insight, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                                                {insight}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {insights.use_cases?.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="font-semibold text-gray-700 mb-2">Suggested Use Cases</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {insights.use_cases.map((useCase, i) => (
                                            <span key={i} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-medium border border-teal-100">{useCase}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Data Quality</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        insights.data_quality === 'excellent' ? 'bg-teal-50 text-teal-700 border border-teal-100'
                                        : insights.data_quality === 'good' ? 'bg-teal-50 text-teal-700 border border-teal-100'
                                        : insights.data_quality === 'fair' ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                                    }`}>
                                        {insights.data_quality || 'Good'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {processedProfile && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-lg">📊</span>
                                Processed Dataset Stats
                            </h2>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <AnimatedStat label="Total Rows" value={processedProfile.total_rows?.toLocaleString() || 'N/A'} color="teal" delay={0} />
                                <AnimatedStat label="Total Columns" value={processedProfile.total_columns || 'N/A'} color="teal" delay={100} />
                                <AnimatedStat label="Numeric Columns" value={processedProfile.numeric_columns?.length || 0} color="purple" delay={200} />
                                <AnimatedStat label="Text Columns" value={processedProfile.text_columns?.length || 0} color="amber" delay={300} />
                            </div>
                            {insights?.transformation_summary && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <h3 className="font-semibold text-gray-700 mb-2">Transformation Summary</h3>
                                    <p className="text-sm text-gray-600">{insights.transformation_summary}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {executionLog.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-lg">🔧</span>
                            Transformations Applied
                        </h2>
                        <div className="space-y-2">
                            {executionLog.map((log, i) => (
                                <div key={i} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                                    <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                                    <span className="text-gray-700 text-sm">{log}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                        <button onClick={handleDownload} className="flex-1 min-w-[200px] bg-teal-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 flex items-center justify-center gap-2">
                            📥 Download Clean Dataset
                        </button>
                        {sessionId && (
                            <button onClick={handleDownloadCode} className="flex-1 min-w-[200px] bg-gray-900 text-white font-bold py-4 px-6 rounded-xl hover:bg-gray-800 transition-all shadow-lg flex items-center justify-center gap-2">
                                🐍 Download Python Script
                            </button>
                        )}
                        <button onClick={handleNewSession} className="flex-1 bg-white text-teal-700 font-bold py-4 px-6 rounded-xl border-2 border-teal-200 hover:bg-teal-50 transition-all">
                            Start New Session
                        </button>
                        <Link to="/" className="flex-1 bg-gray-50 text-gray-700 font-bold py-4 px-6 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all text-center">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
