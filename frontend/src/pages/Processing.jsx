import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AxelLogo from '../assets/Axellogo.png';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:8000';

const buildUrl = (path) => {
    if (!path) return '#';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (import.meta.env.DEV) return path;
    return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
};

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
        <div className={`p-3 rounded-xl border transition-all duration-500 ${colorMap[color]} ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-gray-600">{label}</div>
        </div>
    );
}

export default function Processing() {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadingReplacement, setUploadingReplacement] = useState(false);
    const [profile, setProfile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [downloadUrl, setDownloadUrl] = useState(localStorage.getItem('downloadUrl') || '');
    const messagesEndRef = useRef(null);
    const uploadInputRef = useRef(null);
    const [sessionId, setSessionId] = useState(localStorage.getItem('sessionId'));
    const [filename, setFilename] = useState(localStorage.getItem('filename') || 'dataset');

    const buildWelcomeMessage = (fileLabel) =>
        `Hello! I loaded your dataset "${fileLabel}".\n\n` +
        'You can ask in natural language, for example:\n' +
        '- Give insights about this sheet\n' +
        '- Sort by Date descending\n' +
        '- Add column Total = Price * Quantity\n' +
        '- Add new column City = "Pune" for every row\n' +
        '- Show 5 unique rows by Area';

    useEffect(() => {
        if (!sessionId) { navigate('/dashboard'); return; }
        loadDatasetInfo();
        if (messages.length === 0) {
            setMessages([{ role: 'ai', text: buildWelcomeMessage(filename), timestamp: new Date() }]);
        }
    }, [sessionId, filename, navigate]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadDatasetInfo = () => {
        try {
            const storedProfile = localStorage.getItem('datasetProfile');
            if (storedProfile) {
                const parsed = JSON.parse(storedProfile);
                setProfile(parsed);
                setPreviewData(parsed.head || []);
            }
        } catch (err) {
            console.error('Error loading dataset info:', err);
        }
    };

    const removeThinkingMessage = () => {
        setMessages((prev) => {
            if (prev.length && prev[prev.length - 1].isThinking) return prev.slice(0, -1);
            return prev;
        });
    };

    const handleReplaceUpload = async (event) => {
        const newFile = event.target.files?.[0];
        if (!newFile || loading || uploadingReplacement) return;
        setUploadingReplacement(true);
        const formData = new FormData();
        formData.append('file', newFile);
        try {
            const res = await axios.post(`${API_URL}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            localStorage.setItem('sessionId', res.data.session_id);
            localStorage.setItem('filename', res.data.filename);
            localStorage.setItem('datasetProfile', JSON.stringify(res.data.profile));
            localStorage.removeItem('processedProfile');
            localStorage.removeItem('downloadUrl');
            localStorage.removeItem('insights');
            localStorage.removeItem('executionLog');
            setSessionId(res.data.session_id);
            setFilename(res.data.filename);
            setProfile(res.data.profile);
            setPreviewData(res.data.profile?.head || []);
            setDownloadUrl('');
            setPrompt('');
            setMessages([{ role: 'ai', text: buildWelcomeMessage(res.data.filename), timestamp: new Date() }]);
        } catch (err) {
            setMessages((prev) => [...prev, { role: 'ai', text: `Upload failed: ${err.response?.data?.detail || err.message || 'Please try again.'}`, timestamp: new Date(), isError: true }]);
        } finally {
            setUploadingReplacement(false);
            if (uploadInputRef.current) uploadInputRef.current.value = '';
        }
    };

    const handleSend = async () => {
        if (!prompt.trim() || loading) return;
        const userText = prompt.trim();
        setPrompt('');
        setMessages((prev) => [
            ...prev,
            { role: 'user', text: userText, timestamp: new Date() },
            { role: 'ai', text: 'Understanding your intent...', timestamp: new Date(), isThinking: true },
        ]);
        setLoading(true);
        try {
            const analyzeRes = await axios.post(`${API_URL}/analyze`, { session_id: sessionId, query: userText });
            removeThinkingMessage();
            const intent = analyzeRes.data.intent || {};
            const plan = Array.isArray(analyzeRes.data.plan) ? analyzeRes.data.plan : [];
            const planWarnings = Array.isArray(analyzeRes.data.plan_warnings) ? analyzeRes.data.plan_warnings : [];
            const keyReqs = Array.isArray(intent.key_requirements) ? intent.key_requirements : [];
            if (analyzeRes.data.profile) {
                setProfile(analyzeRes.data.profile);
                setPreviewData(analyzeRes.data.profile.head || []);
                localStorage.setItem('datasetProfile', JSON.stringify(analyzeRes.data.profile));
            }
            setMessages((prev) => [
                ...prev,
                { role: 'ai', text: `Goal identified: ${intent.goal || 'Process dataset'}\nPurpose: ${intent.purpose || 'general'}\nRequirements:\n${keyReqs.map((r) => `- ${r}`).join('\n') || '- None specified'}`, timestamp: new Date() },
                { role: 'ai', text: `Execution plan (${plan.length} step${plan.length === 1 ? '' : 's'}):\n${plan.length ? plan.map((op, i) => `${i + 1}. ${op.type}`).join('\n') : 'No transformation needed. I will generate insights from the current dataset.'}${planWarnings.length ? `\n\nPlan warnings:\n${planWarnings.map((w) => `- ${w}`).join('\n')}` : ''}`, timestamp: new Date(), isPlan: true },
            ]);
            const execRes = await axios.post(`${API_URL}/execute`, { session_id: sessionId, plan, intent, query: userText });
            const insights = execRes.data.insights || {};
            const executionLog = Array.isArray(execRes.data.execution_log) ? execRes.data.execution_log : [];
            const execWarnings = Array.isArray(execRes.data.plan_warnings) ? execRes.data.plan_warnings : [];
            const generationWarnings = Array.isArray(execRes.data.generation_warnings) ? execRes.data.generation_warnings : [];
            const executionMode = execRes.data.execution_mode || 'plan';
            const extraExcelSheets = Array.isArray(execRes.data.extra_excel_sheets) ? execRes.data.extra_excel_sheets : [];
            const insightList = Array.isArray(insights.insights) ? insights.insights : [];
            const useCases = Array.isArray(insights.use_cases) ? insights.use_cases : [];
            setMessages((prev) => [
                ...prev,
                {
                    role: 'ai',
                    text: `Transformation complete.\n\nSummary: ${insights.summary || 'Dataset processed successfully'}\n\nKey insights:\n${insightList.map((i) => `- ${i}`).join('\n') || '- No additional insights'}\n\nSuggested use cases:\n${useCases.map((u) => `- ${u}`).join('\n') || '- Analytics'}\n\nData quality: ${insights.data_quality || 'good'}\nExecution mode: ${executionMode}\n${extraExcelSheets.length ? `Generated Excel sheets:\n${extraExcelSheets.map((s) => `- ${s}`).join('\n')}\n` : ''}${executionLog.length ? `\nTop steps:\n${executionLog.slice(0, 5).map((s) => `- ${s}`).join('\n')}` : ''}${execWarnings.length ? `\n\nExecution warnings:\n${execWarnings.map((w) => `- ${w}`).join('\n')}` : ''}${generationWarnings.length ? `\n\nGeneration warnings:\n${generationWarnings.map((w) => `- ${w}`).join('\n')}` : ''}\n\nPreview has been updated. Results are available directly in this chat.`,
                    timestamp: new Date(),
                    isResult: true,
                },
            ]);
            if (execRes.data.profile) {
                setProfile(execRes.data.profile);
                localStorage.setItem('processedProfile', JSON.stringify(execRes.data.profile));
            }
            if (execRes.data.preview) setPreviewData(execRes.data.preview);
            const newDownloadUrl = execRes.data.download_url || '';
            localStorage.setItem('downloadUrl', newDownloadUrl);
            localStorage.setItem('insights', JSON.stringify(insights));
            localStorage.setItem('executionLog', JSON.stringify(executionLog));
            setDownloadUrl(newDownloadUrl);
        } catch (err) {
            removeThinkingMessage();
            setMessages((prev) => [...prev, { role: 'ai', text: `Error: ${err.response?.data?.detail || err.message || 'Failed to process your request.'}`, timestamp: new Date(), isError: true }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <header className="glass border-b border-gray-100 px-6 py-3 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <img src={AxelLogo} alt="Axel AI" className="h-8 w-8 rounded-lg object-contain" />
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Axel <span className="text-teal-600">AI</span> Agent</h1>
                        <p className="text-xs text-gray-500">Dataset: {filename}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <input ref={uploadInputRef} type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={handleReplaceUpload} />
                    <button
                        type="button"
                        onClick={() => uploadInputRef.current?.click()}
                        disabled={loading || uploadingReplacement}
                        className="w-9 h-9 rounded-lg border border-teal-200 text-teal-600 text-lg font-bold hover:bg-teal-50 disabled:opacity-50 transition-colors"
                    >
                        +
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - stats */}
                <div className="w-80 bg-gray-50/50 border-r border-gray-100 overflow-y-auto p-4">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">Dataset Overview</h2>
                    {profile && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <AnimatedStat label="Total Rows" value={profile.total_rows?.toLocaleString() || 'N/A'} color="teal" delay={0} />
                                <AnimatedStat label="Total Columns" value={profile.total_columns || 'N/A'} color="teal" delay={100} />
                                <AnimatedStat label="Numeric" value={profile.numeric_columns?.length || 0} color="purple" delay={200} />
                                <AnimatedStat label="Text" value={profile.text_columns?.length || 0} color="amber" delay={300} />
                            </div>
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                                <div className="text-sm font-semibold text-gray-700 mb-1">Missing Values</div>
                                <div className="text-lg font-bold text-amber-600">
                                    {Object.values(profile.missing_values || {}).reduce((a, b) => a + b, 0).toLocaleString()}
                                </div>
                            </div>
                            {profile.duplicate_rows > 0 && (
                                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                                    <div className="text-sm font-semibold text-gray-700 mb-1">Duplicate Rows</div>
                                    <div className="text-lg font-bold text-rose-600">{profile.duplicate_rows}</div>
                                </div>
                            )}
                            <div>
                                <div className="text-sm font-semibold text-gray-700 mb-2">Columns</div>
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                    {profile.columns?.slice(0, 10).map((col, i) => (
                                        <div key={i} className="text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-100">{col}</div>
                                    ))}
                                    {profile.columns?.length > 10 && (
                                        <div className="text-xs text-gray-400">+{profile.columns.length - 10} more</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Chat area */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-3xl rounded-xl p-4 ${
                                    m.role === 'user'
                                        ? 'bg-teal-600 text-white'
                                        : m.isError
                                        ? 'bg-red-50 text-red-800 border border-red-200'
                                        : 'bg-white text-gray-800 border border-gray-100 shadow-sm'
                                }`}>
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.text}</div>
                                    <div className={`text-xs mt-2 ${m.role === 'user' ? 'text-teal-200' : 'text-gray-400'}`}>
                                        {m.timestamp?.toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600" />
                                        <span className="text-sm text-gray-500">Agent is working...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="border-t border-gray-100 bg-white p-4">
                        <div className="flex flex-col gap-3 max-w-4xl mx-auto">
                            <div className="flex gap-2 flex-wrap">
                                {downloadUrl && (
                                    <button type="button" onClick={() => window.open(buildUrl(downloadUrl), '_blank')} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
                                        Download File
                                    </button>
                                )}
                                <span className="text-xs text-gray-400 self-center">or describe what you want below</span>
                            </div>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors text-sm"
                                    placeholder="e.g. Sort by Date descending, Show 5 unique rows by Area..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                    disabled={loading}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={loading || !prompt.trim()}
                                    className="px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 text-center mt-2">Powered by Gemini AI and RAG context.</p>
                    </div>
                </div>

                {/* Right sidebar - preview */}
                <div className="w-96 bg-gray-50/50 border-l border-gray-100 overflow-y-auto p-4">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">Data Preview</h2>
                    {previewData.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                                <thead className="bg-teal-50">
                                    <tr>
                                        {Object.keys(previewData[0] || {}).map((key, i) => (
                                            <th key={i} className="px-2 py-2 text-left font-semibold text-gray-700 border-b">{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.slice(0, 10).map((row, i) => (
                                        <tr key={i} className="border-b hover:bg-teal-50/30 transition-colors">
                                            {Object.values(row).map((val, j) => (
                                                <td key={j} className="px-2 py-2 text-gray-600 border-r border-gray-100">
                                                    {String(val).length > 20 ? `${String(val).substring(0, 20)}...` : String(val)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p className="text-xs text-gray-400 mt-2">Showing first 10 rows</p>
                        </div>
                    ) : (
                        <div className="text-gray-400 text-sm flex flex-col items-center gap-2 mt-8">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">📋</div>
                            <p>No preview available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
