import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignup = (e) => {
        e.preventDefault();
        if (name && email && password) {
            // Store user data in localStorage
            const userData = {
                name,
                email,
                password, // In production, hash this
                createdAt: new Date().toISOString()
            };
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', name);
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // Auto-login after signup
            navigate('/dashboard');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-emerald-950 px-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white/95 rounded-2xl shadow-2xl border border-emerald-100">
                <div className="text-center">
                    <p className="text-xs tracking-wider uppercase text-emerald-600 font-semibold">Excel Agent Studio</p>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 mt-1">Create Account</h2>
                    <p className="text-gray-600">Start building dashboards with AI</p>
                </div>
                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-3 font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-md"
                    >
                        Sign Up & Get Started
                    </button>
                </form>
                <p className="text-sm text-center text-gray-600">
                    Already have an account? <Link to="/login" className="text-emerald-700 hover:underline font-medium">Login</Link>
                </p>
                <p className="text-xs text-center text-gray-500">
                    The agent can clean files, generate dashboards, and create diagrams on demand.
                </p>
            </div>
        </div>
    );
}
