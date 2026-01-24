import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Download() {
    const navigate = useNavigate();
    // In a real app, getting the URL might require an API call or persistent state.
    // We'll trust the flow put it in localStorage or mock it.
    const downloadUrl = localStorage.getItem('downloadUrl') || '#';
    const operations = localStorage.getItem('operations') || 'Processed data.';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
            <div className="max-w-xl w-full bg-white p-8 rounded-lg shadow-lg text-center">
                <div className="text-green-500 text-6xl mb-4">✅</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Wrangling Complete!</h1>
                <p className="text-gray-600 mb-6">Your dataset has been successfully transformed.</p>

                <div className="bg-gray-100 p-4 rounded mb-6 text-left">
                    <p className="font-semibold text-sm text-gray-500 uppercase">Operations Performed:</p>
                    <p className="text-gray-800">{operations}</p>
                </div>

                {/* Note: This download link depends on the backend actually serving files statically or via an endpoint.
            If 'downloadUrl' from backend is relative, prepend API url. */}
                <a
                    href={downloadUrl.startsWith('http') ? downloadUrl : `http://localhost:8000${downloadUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 mb-4"
                >
                    Download Clean Dataset
                </a>

                <div className="flex justify-between mt-4">
                    <Link to="/dashboard" className="text-blue-600 hover:underline">Start New Session</Link>
                    <Link to="/home" className="text-gray-600 hover:underline">Home</Link>
                </div>
            </div>
        </div>
    );
}
