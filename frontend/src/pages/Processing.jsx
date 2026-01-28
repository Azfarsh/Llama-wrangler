import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export default function Processing() {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const messagesEndRef = useRef(null);
    const sessionId = localStorage.getItem('sessionId');
    const filename = localStorage.getItem('filename');

    useEffect(() => {
        if (!sessionId) {
            navigate('/dashboard');
            return;
        }
        loadDatasetInfo();
        // Initial welcome message
        if (messages.length === 0) {
            setMessages([{
                role: 'ai',
                text: `Hello! I've loaded your dataset "${filename}". I can help you clean, transform, and prepare this data for machine learning, analytics, or reporting.\n\nWhat would you like me to do? For example:\n• "Clean this dataset and prepare it for machine learning classification"\n• "Remove null values and normalize numeric columns"\n• "Encode categorical variables and prepare for ML"`,
                timestamp: new Date()
            }]);
        }
    }, [sessionId, filename, navigate]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadDatasetInfo = async () => {
        try {
            // Get profile from session or re-analyze
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

    const handleSend = async () => {
        if (!prompt.trim() || loading) return;
        
        const userText = prompt;
        setPrompt('');
        setMessages(prev => [...prev, { 
            role: 'user', 
            text: userText,
            timestamp: new Date()
        }]);
        setLoading(true);

        try {
            // Step 1: Analyze Intent (Agent 1)
            setMessages(prev => [...prev, {
                role: 'ai',
                text: '🤔 Understanding your intent...',
                timestamp: new Date(),
                isThinking: true
            }]);

            const analyzeRes = await axios.post(`${API_URL}/analyze`, {
                session_id: sessionId,
                query: userText
            });

            const intent = analyzeRes.data.intent;
            const plan = analyzeRes.data.plan;
            
            // Update profile if returned
            if (analyzeRes.data.profile) {
                setProfile(analyzeRes.data.profile);
                setPreviewData(analyzeRes.data.profile.head || []);
                localStorage.setItem('datasetProfile', JSON.stringify(analyzeRes.data.profile));
            }

            // Remove thinking message and add intent response
            setMessages(prev => prev.slice(0, -1).concat([{
                role: 'ai',
                text: `✅ **Goal Identified:** ${intent.goal}\n\n**Purpose:** ${intent.purpose || 'Data preparation'}\n\n**Key Requirements:**\n${intent.key_requirements?.map(r => `• ${r}`).join('\n') || '• Processing dataset'}`,
                timestamp: new Date()
            }]));

            // Step 2: Show plan
            setMessages(prev => [...prev, {
                role: 'ai',
                text: `📋 **Execution Plan:**\n\nI'll execute ${plan.length} transformation step(s):\n${plan.map((op, i) => `${i + 1}. ${op.type}${op.params?.columns ? ` on columns: ${JSON.stringify(op.params.columns)}` : ''}`).join('\n')}\n\nExecuting now...`,
                timestamp: new Date(),
                isPlan: true
            }]);

            // Step 3: Execute Plan (Agent 3)
            const execRes = await axios.post(`${API_URL}/execute`, {
                session_id: sessionId,
                plan: plan,
                intent: intent
            });

            // Step 4: Show results and insights
            const insights = execRes.data.insights || {};
            const executionLog = execRes.data.execution_log || [];

            setMessages(prev => [...prev, {
                role: 'ai',
                text: `✅ **Transformation Complete!**\n\n**Summary:** ${insights.summary || 'Dataset processed successfully'}\n\n**Key Insights:**\n${insights.insights?.map(i => `• ${i}`).join('\n') || '• Data has been cleaned and transformed'}\n\n**Suggested Use Cases:**\n${insights.use_cases?.map(u => `• ${u}`).join('\n') || '• Machine Learning\n• Analytics\n• Reporting'}\n\n**Data Quality:** ${insights.data_quality || 'Good'}`,
                timestamp: new Date(),
                isResult: true
            }]);

            // Store results for download page
            localStorage.setItem('downloadUrl', execRes.data.download_url);
            localStorage.setItem('insights', JSON.stringify(insights));
            localStorage.setItem('executionLog', JSON.stringify(executionLog));
            localStorage.setItem('processedProfile', JSON.stringify(execRes.data.profile));

            // Update preview with processed data
            if (execRes.data.preview) {
                setPreviewData(execRes.data.preview);
            }

            // Auto-navigate to results after 3 seconds
            setTimeout(() => {
                navigate('/download');
            }, 3000);

        } catch (err) {
            console.error(err);
            setMessages(prev => prev.slice(0, -1).concat([{
                role: 'ai',
                text: `❌ Error: ${err.response?.data?.detail || err.message || 'Failed to process your request. Please try again.'}`,
                timestamp: new Date(),
                isError: true
            }]));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-blue-600">AutoWrangler AI</h1>
                    <p className="text-sm text-gray-600">Dataset: {filename}</p>
                </div>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    ← Back to Dashboard
                </button>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Dataset Info */}
                <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto p-4">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">Dataset Overview</h2>
                    
                    {profile && (
                        <div className="space-y-4">
                            {/* Statistics Cards */}
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

                            {/* Missing Values */}
                            <div className="bg-yellow-50 p-3 rounded-lg">
                                <div className="text-sm font-semibold text-gray-700 mb-2">Missing Values</div>
                                <div className="text-lg font-bold text-yellow-700">
                                    {Object.values(profile.missing_values || {}).reduce((a, b) => a + b, 0).toLocaleString()}
                                </div>
                            </div>

                            {/* Duplicate Rows */}
                            {profile.duplicate_rows > 0 && (
                                <div className="bg-red-50 p-3 rounded-lg">
                                    <div className="text-sm font-semibold text-gray-700 mb-1">Duplicate Rows</div>
                                    <div className="text-lg font-bold text-red-700">{profile.duplicate_rows}</div>
                                </div>
                            )}

                            {/* Column List */}
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

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-3xl rounded-lg p-4 ${
                                    m.role === 'user' 
                                        ? 'bg-blue-600 text-white' 
                                        : m.isError
                                        ? 'bg-red-50 text-red-800 border border-red-200'
                                        : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                                }`}>
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.text}</div>
                                    <div className={`text-xs mt-2 ${
                                        m.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                                    }`}>
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

                    {/* Input Area */}
                    <div className="border-t border-gray-200 bg-white p-4">
                        <div className="flex gap-3 max-w-4xl mx-auto">
                            <input
                                type="text"
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Describe what you want to do with this dataset..."
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
                        <p className="text-xs text-gray-500 text-center mt-2">
                            Example: "Clean this dataset and prepare it for machine learning classification"
                        </p>
                    </div>
                </div>

                {/* Right Sidebar - Data Preview */}
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
                                                    {String(val).length > 20 ? String(val).substring(0, 20) + '...' : String(val)}
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
