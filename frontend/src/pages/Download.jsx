import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
        // Load insights and execution log
        const storedInsights = localStorage.getItem('insights');
        const storedLog = localStorage.getItem('executionLog');
        const storedProfile = localStorage.getItem('processedProfile');

        if (storedInsights) {
            try {
                setInsights(JSON.parse(storedInsights));
            } catch (e) {
                console.error('Error parsing insights:', e);
            }
        }

        if (storedLog) {
            try {
                setExecutionLog(JSON.parse(storedLog));
            } catch (e) {
                console.error('Error parsing execution log:', e);
            }
        }

        if (storedProfile) {
            try {
                setProcessedProfile(JSON.parse(storedProfile));
            } catch (e) {
                console.error('Error parsing profile:', e);
            }
        }
    }, []);

    const sessionId = localStorage.getItem('sessionId');

    const handleDownload = () => {
        const fullUrl = buildUrl(downloadUrl);
        window.open(fullUrl, '_blank');
    };

    const handleDownloadCode = () => {
        if (!sessionId) return;
        const url = buildUrl(`${API_BASE_URL}/code/${sessionId}`);
        window.open(url, '_blank');
    };

    const handleNewSession = () => {
        // Clear session data
        localStorage.removeItem('sessionId');
        localStorage.removeItem('filename');
        localStorage.removeItem('downloadUrl');
        localStorage.removeItem('insights');
        localStorage.removeItem('executionLog');
        localStorage.removeItem('processedProfile');
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Success Header */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-6 text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Wrangling Complete!</h1>
                    <p className="text-gray-600 text-lg">Your dataset has been successfully transformed and is ready to use.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Insights Card */}
                    {insights && (
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="mr-2">💡</span> Key Insights
                            </h2>
                            
                            <div className="mb-4">
                                <h3 className="font-semibold text-gray-700 mb-2">Summary</h3>
                                <p className="text-gray-600">{insights.summary || 'Dataset processed successfully'}</p>
                            </div>

                            {insights.insights && insights.insights.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="font-semibold text-gray-700 mb-2">Insights</h3>
                                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                                        {insights.insights.map((insight, i) => (
                                            <li key={i}>{insight}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {insights.use_cases && insights.use_cases.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="font-semibold text-gray-700 mb-2">Suggested Use Cases</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {insights.use_cases.map((useCase, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                                            >
                                                {useCase}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Data Quality</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        insights.data_quality === 'excellent' 
                                            ? 'bg-green-100 text-green-700'
                                            : insights.data_quality === 'good'
                                            ? 'bg-blue-100 text-blue-700'
                                            : insights.data_quality === 'fair'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                        {insights.data_quality || 'Good'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dataset Stats Card */}
                    {processedProfile && (
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="mr-2">📊</span> Processed Dataset Stats
                            </h2>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="text-3xl font-bold text-blue-600">
                                        {processedProfile.total_rows?.toLocaleString() || 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-600">Total Rows</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="text-3xl font-bold text-green-600">
                                        {processedProfile.total_columns || 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-600">Total Columns</div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <div className="text-3xl font-bold text-purple-600">
                                        {processedProfile.numeric_columns?.length || 0}
                                    </div>
                                    <div className="text-sm text-gray-600">Numeric Columns</div>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-lg">
                                    <div className="text-3xl font-bold text-orange-600">
                                        {processedProfile.text_columns?.length || 0}
                                    </div>
                                    <div className="text-sm text-gray-600">Text Columns</div>
                                </div>
                            </div>

                            {insights?.transformation_summary && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h3 className="font-semibold text-gray-700 mb-2">Transformation Summary</h3>
                                    <p className="text-sm text-gray-600">{insights.transformation_summary}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Execution Log */}
                {executionLog.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-2">🔧</span> Transformations Applied
                        </h2>
                        <div className="space-y-2">
                            {executionLog.map((log, i) => (
                                <div key={i} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <span className="text-blue-600 font-bold">{i + 1}.</span>
                                    <span className="text-gray-700">{log}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                    <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                        <button
                            onClick={handleDownload}
                            className="flex-1 min-w-[200px] bg-green-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center"
                        >
                            <span className="mr-2">📥</span>
                            Download Clean Dataset
                        </button>
                        {sessionId && (
                            <button
                                onClick={handleDownloadCode}
                                className="flex-1 min-w-[200px] bg-amber-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-amber-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center"
                            >
                                <span className="mr-2">🐍</span>
                                Download Python Script
                            </button>
                        )}
                        <button
                            onClick={handleNewSession}
                            className="flex-1 bg-blue-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                        >
                            Start New Session
                        </button>
                        <Link
                            to="/"
                            className="flex-1 bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-lg hover:bg-gray-300 transition-colors text-center"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
