import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export default function Processing() {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const sessionId = localStorage.getItem('sessionId');
    const filename = localStorage.getItem('filename');

    useEffect(() => {
        if (!sessionId) {
            navigate('/dashboard');
            return;
        }
        // Initial welcome message
        if (messages.length === 0) {
            setMessages([{
                role: 'ai',
                text: `I've loaded ${filename}. How would you like to transform this data? (e.g., "Remove null values", "Normalize columns")`
            }]);
        }
    }, [sessionId, filename, navigate]); // Removed 'messages.length' from dependency array to avoid loops

    const handleSend = async () => {
        if (!prompt.trim()) return;
        const userText = prompt;
        setPrompt('');
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setLoading(true);

        try {
            // 1. Analyze Intent
            const analyzeRes = await axios.post(`${API_URL}/analyze`, {
                session_id: sessionId,
                query: userText
            });

            const intent = analyzeRes.data.intent;
            await new Promise(r => setTimeout(r, 500)); // Simul delay
            setMessages(prev => [...prev, {
                role: 'ai',
                text: `Understood. I will: ${intent.goal}`,
                isPlan: true
            }]);

            // 2. Execute directly (Auto mode for "Lite" version simplicity)
            // In a real agent system, we might ask for confirmation.
            const execRes = await axios.post(`${API_URL}/execute`, {
                session_id: sessionId,
                plan: analyzeRes.data.plan
            });

            setMessages(prev => [...prev, {
                role: 'ai',
                text: "Transformation complete! You can download the result."
            }]);

            // Navigate to download page with results
            // Pass data via state or localStorage.
            // For now, let's just use localStorage for the download URL if available, 
            // but 'Download.jsx' should handle retrieval.
            localStorage.setItem('downloadUrl', execRes.data.download_url); // Assuming backend returns this
            localStorage.setItem('operations', JSON.stringify(intent.goal));

            setTimeout(() => navigate('/download'), 1500);

        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'ai', text: "Error processing your request. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-blue-600">Processing Data</h1>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full p-4 flex flex-col">
                <div className="flex-1 bg-white rounded-lg shadow-sm p-4 overflow-y-auto mb-4 border border-gray-200">
                    {messages.map((m, i) => (
                        <div key={i} className={`mb-4 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-md p-3 rounded-lg ${m.role === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-900'}`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    {loading && <div className="text-gray-500 text-sm animate-pulse">Agent is thinking & executing...</div>}
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 border p-3 rounded-lg shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
                        placeholder="Describe transformation..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </main>
        </div>
    );
}
