import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Ensure API URL matches backend port
const API_URL = 'http://localhost:8000/api';

export default function Dashboard() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
            // Store session info and redirect to processing
            localStorage.setItem('sessionId', res.data.session_id);
            localStorage.setItem('filename', res.data.filename);
            // For MVP simplicity, we might jump to processing or stay here to chat.
            // Based on design: Dashboard => Preview/Input => Processing.
            // Let's go to Processing page which handles the "chat/agent" part.
            navigate('/processing');
        } catch (err) {
            console.error(err);
            alert('Upload failed');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/home');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-blue-600">AutoDW-Lite Dashboard</h1>
                <button onClick={handleLogout} className="text-gray-600 hover:text-red-500">Logout</button>
            </header>

            <main className="flex-1 p-8 max-w-4xl mx-auto w-full">
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
                    <h2 className="text-2xl font-bold mb-6">Start New Wrangling Session</h2>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:bg-gray-50 transition">
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="hidden"
                            id="fileInput"
                            accept=".csv,.xlsx"
                        />
                        <label htmlFor="fileInput" className="cursor-pointer">
                            <div className="text-4xl mb-4">📂</div>
                            <p className="text-lg text-gray-700 font-medium">
                                {file ? file.name : "Click to Upload Dataset (CSV/Excel)"}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">Max size: 50MB</p>
                        </label>
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className={`w-full mt-6 py-3 rounded-lg font-bold text-white transition ${!file ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {loading ? 'Uploading...' : 'Upload & Continue'}
                    </button>
                </div>
            </main>
        </div>
    );
}
