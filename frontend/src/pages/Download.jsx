import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import ThemeToggle from '../components/ThemeToggle';
import BrandLogo from '../components/BrandLogo';

function AnimatedStat({ label, value, color = 'teal', delay = 0 }) {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setShow(true), delay);
        return () => clearTimeout(t);
    }, [delay]);
    const colorMap = {
        teal: 'text-teal-400 bg-teal-900/30 border-teal-700/40',
        purple: 'text-purple-400 bg-purple-900/30 border-purple-700/40',
        amber: 'text-amber-400 bg-amber-900/30 border-amber-700/40',
        rose: 'text-rose-400 bg-rose-900/30 border-rose-700/40',
    };
    return (
        <div className={`p-4 rounded-xl border transition-all duration-500 ${colorMap[color]} ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
            <div className="text-2xl sm:text-3xl font-bold">{value}</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</div>
        </div>
    );
}

export default function Download() {
    const navigate = useNavigate();
    const { dark, toggle: toggleTheme } = useTheme();
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
        <div className="min-h-screen" style={{ background: 'var(--page-bg)' }}>
            <nav className="glass px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <BrandLogo size="md" className="shrink-0" />
                    <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Axel <span style={{ color: 'var(--teal-accent)' }}>AI</span></span>
                </div>
                <ThemeToggle dark={dark} toggle={toggleTheme} />
            </nav>

            <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
                {/* Success Header */}
                <div className="rounded-2xl border p-6 sm:p-8 mb-6 text-center" style={{ background: 'var(--panel-bg)', borderColor: 'var(--border-color)' }}>
                    <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-teal-900/40 border border-teal-700/30 flex items-center justify-center">
                        <span className="text-2xl sm:text-3xl">✅</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Wrangling Complete!</h1>
                    <p className="text-base sm:text-lg" style={{ color: 'var(--text-secondary)' }}>Your dataset has been successfully transformed and is ready to use.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                    {insights && (
                        <div className="rounded-2xl border p-5 sm:p-6" style={{ background: 'var(--panel-bg)', borderColor: 'var(--border-color)' }}>
                            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <span className="w-8 h-8 rounded-lg bg-teal-900/40 border border-teal-700/30 flex items-center justify-center text-lg">💡</span>
                                Key Insights
                            </h2>
                            <div className="mb-4">
                                <h3 className="font-semibold mb-2 text-sm" style={{ color: 'var(--text-primary)' }}>Summary</h3>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{insights.summary || 'Dataset processed successfully'}</p>
                            </div>
                            {insights.insights?.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="font-semibold mb-2 text-sm" style={{ color: 'var(--text-primary)' }}>Insights</h3>
                                    <ul className="space-y-1" style={{ color: 'var(--text-secondary)' }}>
                                        {insights.insights.map((insight, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                                                {insight}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {insights.use_cases?.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="font-semibold mb-2 text-sm" style={{ color: 'var(--text-primary)' }}>Suggested Use Cases</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {insights.use_cases.map((useCase, i) => (
                                            <span key={i} className="px-3 py-1 bg-teal-900/40 text-teal-400 rounded-full text-xs font-medium border border-teal-700/40">{useCase}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Data Quality</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        insights.data_quality === 'excellent' ? 'bg-teal-900/40 text-teal-400 border border-teal-700/40'
                                        : insights.data_quality === 'good' ? 'bg-teal-900/40 text-teal-400 border border-teal-700/40'
                                        : insights.data_quality === 'fair' ? 'bg-amber-900/40 text-amber-400 border border-amber-700/40'
                                        : 'bg-rose-900/40 text-rose-400 border border-rose-700/40'
                                    }`}>
                                        {insights.data_quality || 'Good'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {processedProfile && (
                        <div className="rounded-2xl border p-5 sm:p-6" style={{ background: 'var(--panel-bg)', borderColor: 'var(--border-color)' }}>
                            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <span className="w-8 h-8 rounded-lg bg-teal-900/40 border border-teal-700/30 flex items-center justify-center text-lg">📊</span>
                                Processed Dataset Stats
                            </h2>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <AnimatedStat label="Total Rows" value={processedProfile.total_rows?.toLocaleString() || 'N/A'} color="teal" delay={0} />
                                <AnimatedStat label="Total Columns" value={processedProfile.total_columns || 'N/A'} color="teal" delay={100} />
                                <AnimatedStat label="Numeric Columns" value={processedProfile.numeric_columns?.length || 0} color="purple" delay={200} />
                                <AnimatedStat label="Text Columns" value={processedProfile.text_columns?.length || 0} color="amber" delay={300} />
                            </div>
                            {insights?.transformation_summary && (
                                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                    <h3 className="font-semibold mb-2 text-sm" style={{ color: 'var(--text-primary)' }}>Transformation Summary</h3>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{insights.transformation_summary}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {executionLog.length > 0 && (
                    <div className="rounded-2xl border p-5 sm:p-6 mb-6" style={{ background: 'var(--panel-bg)', borderColor: 'var(--border-color)' }}>
                        <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            <span className="w-8 h-8 rounded-lg bg-teal-900/40 border border-teal-700/30 flex items-center justify-center text-lg">🔧</span>
                            Transformations Applied
                        </h2>
                        <div className="space-y-2">
                            {executionLog.map((log, i) => (
                                <div key={i} className="flex items-start space-x-3 p-3 rounded-xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                                    <span className="w-6 h-6 rounded-lg bg-teal-900/50 border border-teal-700/40 text-teal-400 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{log}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="rounded-2xl border p-6 sm:p-8" style={{ background: 'var(--panel-bg)', borderColor: 'var(--border-color)' }}>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap">
                        <button onClick={handleDownload} className="flex-1 min-w-[180px] bg-teal-600 text-white font-bold py-3 sm:py-4 px-5 rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/15 flex items-center justify-center gap-2 text-sm sm:text-base">
                            Download Clean Dataset
                        </button>
                        {sessionId && (
                            <button onClick={handleDownloadCode} className="flex-1 min-w-[180px] font-bold py-3 sm:py-4 px-5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                                Download Python Script
                            </button>
                        )}
                        <button onClick={handleNewSession} className="flex-1 font-bold py-3 sm:py-4 px-5 rounded-xl border transition-all text-sm sm:text-base" style={{ color: 'var(--teal-accent)', borderColor: 'var(--teal-soft-border)', background: 'var(--teal-soft-bg)' }}>
                            Start New Session
                        </button>
                        <Link to="/" className="flex-1 font-bold py-3 sm:py-4 px-5 rounded-xl border transition-all text-center text-sm sm:text-base hover:opacity-90" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
