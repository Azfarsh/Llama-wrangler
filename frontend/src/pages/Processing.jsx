import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:8000';

const buildUrl = (path) => {
    if (!path) return '#';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (import.meta.env.DEV) return path;
    return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
};

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
        if (!sessionId) {
            navigate('/dashboard');
            return;
        }
        loadDatasetInfo();
        if (messages.length === 0) {
            setMessages([
                {
                    role: 'ai',
                    text: buildWelcomeMessage(filename),
                    timestamp: new Date(),
                },
            ]);
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
            if (prev.length && prev[prev.length - 1].isThinking) {
                return prev.slice(0, -1);
            }
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
            const res = await axios.post(`${API_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

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
            setMessages([
                {
                    role: 'ai',
                    text: buildWelcomeMessage(res.data.filename),
                    timestamp: new Date(),
                },
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'ai',
                    text: `Upload failed: ${err.response?.data?.detail || err.message || 'Please try again.'}`,
                    timestamp: new Date(),
                    isError: true,
                },
            ]);
        } finally {
            setUploadingReplacement(false);
            if (uploadInputRef.current) {
                uploadInputRef.current.value = '';
            }
        }
    };

    const handleSend = async () => {
        if (!prompt.trim() || loading) return;

        const userText = prompt.trim();
        setPrompt('');
        setMessages((prev) => [
            ...prev,
            { role: 'user', text: userText, timestamp: new Date() },
            {
                role: 'ai',
                text: 'Understanding your intent...',
                timestamp: new Date(),
                isThinking: true,
            },
        ]);
        setLoading(true);

        try {
            const analyzeRes = await axios.post(`${API_URL}/analyze`, {
                session_id: sessionId,
                query: userText,
            });

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
                {
                    role: 'ai',
                    text:
                        `Goal identified: ${intent.goal || 'Process dataset'}\n` +
                        `Purpose: ${intent.purpose || 'general'}\n` +
                        `Requirements:\n${keyReqs.map((r) => `- ${r}`).join('\n') || '- None specified'}`,
                    timestamp: new Date(),
                },
                {
                    role: 'ai',
                    text:
                        `Execution plan (${plan.length} step${plan.length === 1 ? '' : 's'}):\n` +
                        `${
                            plan.length
                                ? plan
                                      .map((op, i) => `${i + 1}. ${op.type}`)
                                      .join('\n')
                                : 'No transformation needed. I will generate insights from the current dataset.'
                        }` +
                        `${planWarnings.length ? `\n\nPlan warnings:\n${planWarnings.map((w) => `- ${w}`).join('\n')}` : ''}`,
                    timestamp: new Date(),
                    isPlan: true,
                },
            ]);

            const execRes = await axios.post(`${API_URL}/execute`, {
                session_id: sessionId,
                plan,
                intent,
                query: userText,
            });

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
                    text:
                        `Transformation complete.\n\n` +
                        `Summary: ${insights.summary || 'Dataset processed successfully'}\n\n` +
                        `Key insights:\n${insightList.map((i) => `- ${i}`).join('\n') || '- No additional insights'}\n\n` +
                        `Suggested use cases:\n${useCases.map((u) => `- ${u}`).join('\n') || '- Analytics'}\n\n` +
                        `Data quality: ${insights.data_quality || 'good'}\n` +
                        `Execution mode: ${executionMode}\n` +
                        `${extraExcelSheets.length ? `Generated Excel sheets:\n${extraExcelSheets.map((s) => `- ${s}`).join('\n')}\n` : ''}` +
                        `${executionLog.length ? `\nTop steps:\n${executionLog.slice(0, 5).map((s) => `- ${s}`).join('\n')}` : ''}` +
                        `${execWarnings.length ? `\n\nExecution warnings:\n${execWarnings.map((w) => `- ${w}`).join('\n')}` : ''}` +
                        `${generationWarnings.length ? `\n\nGeneration warnings:\n${generationWarnings.map((w) => `- ${w}`).join('\n')}` : ''}\n\n` +
                        'Preview has been updated. Results are available directly in this chat.',
                    timestamp: new Date(),
                    isResult: true,
                },
            ]);

            if (execRes.data.profile) {
                setProfile(execRes.data.profile);
                localStorage.setItem('processedProfile', JSON.stringify(execRes.data.profile));
            }
            if (execRes.data.preview) {
                setPreviewData(execRes.data.preview);
            }

            const newDownloadUrl = execRes.data.download_url || '';
            localStorage.setItem('downloadUrl', newDownloadUrl);
            localStorage.setItem('insights', JSON.stringify(insights));
            localStorage.setItem('executionLog', JSON.stringify(executionLog));
            setDownloadUrl(newDownloadUrl);
        } catch (err) {
            removeThinkingMessage();
            setMessages((prev) => [
                ...prev,
                {
                    role: 'ai',
                    text: `Error: ${err.response?.data?.detail || err.message || 'Failed to process your request.'}`,
                    timestamp: new Date(),
                    isError: true,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadInPlace = () => {
        if (!downloadUrl) return;
        window.open(buildUrl(downloadUrl), '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-blue-600">Excel AI Agent</h1>
                    <p className="text-sm text-gray-600">Dataset: {filename}</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        ref={uploadInputRef}
                        type="file"
                        className="hidden"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleReplaceUpload}
                    />
                    <button
                        type="button"
                        onClick={() => uploadInputRef.current?.click()}
                        disabled={loading || uploadingReplacement}
                        title="Upload another Excel/CSV file and replace current dataset"
                        className="w-10 h-10 rounded-lg border border-blue-300 text-blue-700 text-xl font-semibold hover:bg-blue-50 disabled:opacity-50"
                    >
                        +
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto p-4">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">Dataset Overview</h2>

                    {profile && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{profile.total_rows?.toLocaleString() || 'N/A'}</div>
                                    <div className="text-xs text-gray-600">Total Rows</div>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{profile.total_columns || 'N/A'}</div>
                                    <div className="text-xs text-gray-600">Total Columns</div>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">{profile.numeric_columns?.length || 0}</div>
                                    <div className="text-xs text-gray-600">Numeric</div>
                                </div>
                                <div className="bg-orange-50 p-3 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600">{profile.text_columns?.length || 0}</div>
                                    <div className="text-xs text-gray-600">Text</div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 p-3 rounded-lg">
                                <div className="text-sm font-semibold text-gray-700 mb-2">Missing Values</div>
                                <div className="text-lg font-bold text-yellow-700">
                                    {Object.values(profile.missing_values || {}).reduce((a, b) => a + b, 0).toLocaleString()}
                                </div>
                            </div>

                            {profile.duplicate_rows > 0 && (
                                <div className="bg-red-50 p-3 rounded-lg">
                                    <div className="text-sm font-semibold text-gray-700 mb-1">Duplicate Rows</div>
                                    <div className="text-lg font-bold text-red-700">{profile.duplicate_rows}</div>
                                </div>
                            )}

                            <div>
                                <div className="text-sm font-semibold text-gray-700 mb-2">Columns</div>
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                    {profile.columns?.slice(0, 10).map((col, i) => (
                                        <div key={i} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                            {col}
                                        </div>
                                    ))}
                                    {profile.columns?.length > 10 && (
                                        <div className="text-xs text-gray-500">+{profile.columns.length - 10} more</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-3xl rounded-lg p-4 ${
                                        m.role === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : m.isError
                                            ? 'bg-red-50 text-red-800 border border-red-200'
                                            : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                                    }`}
                                >
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.text}</div>
                                    <div className={`text-xs mt-2 ${m.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                                        {m.timestamp?.toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        <span className="text-sm text-gray-600">Agent is working...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="border-t border-gray-200 bg-white p-4">
                        <div className="flex flex-col gap-3 max-w-4xl mx-auto">
                            <div className="flex gap-2 flex-wrap">
                                {downloadUrl && (
                                    <button
                                        type="button"
                                        onClick={handleDownloadInPlace}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                                    >
                                        Download File
                                    </button>
                                )}
                                <span className="text-sm text-gray-500 self-center">or describe what you want below</span>
                            </div>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g. Sort by Date descending, Show 5 unique rows by Area..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                    disabled={loading}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={loading || !prompt.trim()}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-2">Powered by Ollama (local LLM) and RAG context.</p>
                    </div>
                </div>

                <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto p-4">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">Data Preview</h2>
                    {previewData.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-xs border border-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {Object.keys(previewData[0] || {}).map((key, i) => (
                                            <th key={i} className="px-2 py-2 text-left font-semibold text-gray-700 border-b">
                                                {key}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.slice(0, 10).map((row, i) => (
                                        <tr key={i} className="border-b hover:bg-gray-50">
                                            {Object.values(row).map((val, j) => (
                                                <td key={j} className="px-2 py-2 text-gray-600 border-r">
                                                    {String(val).length > 20 ? `${String(val).substring(0, 20)}...` : String(val)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p className="text-xs text-gray-500 mt-2">Showing first 10 rows</p>
                        </div>
                    ) : (
                        <div className="text-gray-500 text-sm">No preview available</div>
                    )}
                </div>
            </div>
        </div>
    );
}
