import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export default function Dashboard() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'User';

    useEffect(() => {
        // Load processing history from localStorage
        const storedHistory = localStorage.getItem('processingHistory');
        if (storedHistory) {
            try {
                setHistory(JSON.parse(storedHistory));
            } catch (e) {
                console.error('Error loading history:', e);
            }
        }
    }, []);

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post(`${API_URL}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            
            // Store session info
            localStorage.setItem('sessionId', res.data.session_id);
            localStorage.setItem('filename', res.data.filename);
            localStorage.setItem('datasetProfile', JSON.stringify(res.data.profile));
            
            // Add to history
            const newHistoryItem = {
                id: res.data.session_id,
                filename: res.data.filename,
                uploadedAt: new Date().toISOString(),
                status: 'uploaded'
            };
            const updatedHistory = [newHistoryItem, ...history].slice(0, 10); // Keep last 10
            setHistory(updatedHistory);
            localStorage.setItem('processingHistory', JSON.stringify(updatedHistory));
            
            // Navigate to processing page
            navigate('/processing');
        } catch (err) {
            console.error(err);
            alert(`Upload failed: ${err.response?.data?.detail || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-blue-600">AutoWrangler AI</h1>
                    <p className="text-sm text-gray-600">Welcome back, {userName}!</p>
                </div>
                <button 
                    onClick={handleLogout}
                    className="px-4 py-2 text-gray-600 hover:text-red-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Logout
                </button>
            </header>

            <main className="max-w-6xl mx-auto p-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
                    <p className="text-gray-600">Upload your dataset and let AI agents transform it for you</p>
                </div>

                {/* Upload Section */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
                    <h3 className="text-xl font-semibold mb-6 text-gray-800">Start New Wrangling Session</h3>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors">
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="hidden"
                            id="fileInput"
                            accept=".csv,.xlsx,.xls"
                        />
                        <label htmlFor="fileInput" className="cursor-pointer">
                            <div className="text-6xl mb-4">📂</div>
                            <p className="text-lg text-gray-700 font-medium mb-2">
                                {file ? file.name : "Click to Upload Dataset"}
                            </p>
                            <p className="text-sm text-gray-500">Supports CSV and Excel files (Max 50MB)</p>
                        </label>
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className={`w-full mt-6 py-4 rounded-lg font-bold text-white transition ${
                            !file || loading
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                        }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Uploading...
                            </span>
                        ) : (
                            'Upload & Start Wrangling'
                        )}
                    </button>
                </div>

                {/* History Section */}
                {history.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                        <h3 className="text-xl font-semibold mb-6 text-gray-800">Recent Sessions</h3>
                        <div className="space-y-3">
                            {history.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="text-2xl">📊</div>
                                        <div>
                                            <p className="font-medium text-gray-900">{item.filename}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(item.uploadedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            item.status === 'completed' 
                                                ? 'bg-green-100 text-green-700'
                                                : item.status === 'processing'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Info Cards */}
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                        <div className="text-3xl mb-3">🤖</div>
                        <h4 className="font-semibold text-gray-900 mb-2">Agentic AI</h4>
                        <p className="text-sm text-gray-600">Powered by Google Gemini for intelligent data understanding</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                        <div className="text-3xl mb-3">⚡</div>
                        <h4 className="font-semibold text-gray-900 mb-2">Fast Processing</h4>
                        <p className="text-sm text-gray-600">Transform datasets in seconds, not hours</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                        <div className="text-3xl mb-3">📈</div>
                        <h4 className="font-semibold text-gray-900 mb-2">ML Ready</h4>
                        <p className="text-sm text-gray-600">Outputs ready for machine learning pipelines</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
