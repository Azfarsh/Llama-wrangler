import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (email && password) {
            // Mock auth
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userEmail', email);
            navigate('/dashboard');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-emerald-950 px-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white/95 rounded-2xl shadow-2xl border border-emerald-100">
                <div className="text-center">
                    <p className="text-xs tracking-wider uppercase text-emerald-600 font-semibold">Excel Agent Studio</p>
                    <h2 className="text-3xl font-bold text-gray-900 mt-1">Welcome Back</h2>
                    <p className="text-sm text-gray-600 mt-1">Sign in to continue your dashboard workspace.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-2.5 font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        Sign In
                    </button>
                </form>
                <p className="text-sm text-center text-gray-600">
                    Don't have an account? <Link to="/signup" className="text-emerald-700 hover:underline font-medium">Sign up</Link>
                </p>
                <p className="text-xs text-center text-gray-500">
                    Upload Excel, ask the agent, and generate dashboards faster.
                </p>
            </div>
        </div>
    );
}
