import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AxelLogo from '../assets/Axellogo.png';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [focused, setFocused] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (email && password) {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userEmail', email);
            navigate('/dashboard');
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left panel - branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden items-center justify-center">
                <div className="absolute inset-0 grid-pattern opacity-30" />
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-20 right-10 w-80 h-80 bg-teal-400/15 rounded-full blur-3xl animate-float-slow" />

                <div className="relative z-10 text-center px-12">
                    <div className="mb-8 flex justify-center">
                        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 animate-glow-pulse">
                            <img src={AxelLogo} alt="Axel AI" className="h-20 w-20 object-contain" />
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">Welcome to Axel AI</h2>
                    <p className="text-teal-200 text-lg leading-relaxed max-w-md mx-auto">
                        Your intelligent data workspace. Upload spreadsheets, ask questions, and get dashboards instantly.
                    </p>

                    <div className="mt-12 grid grid-cols-3 gap-4">
                        {[
                            { icon: '📊', label: 'Dashboards' },
                            { icon: '🤖', label: 'AI Agent' },
                            { icon: '⚡', label: 'Instant' },
                        ].map((item) => (
                            <div key={item.label} className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <div className="text-2xl mb-1">{item.icon}</div>
                                <p className="text-xs text-teal-200">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right panel - login form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex justify-center mb-8">
                        <img src={AxelLogo} alt="Axel AI" className="h-14 w-14 rounded-xl object-contain" />
                    </div>

                    <div className="mb-8">
                        <p className="text-xs tracking-widest uppercase text-teal-600 font-semibold mb-1">Axel AI</p>
                        <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                        <p className="text-gray-500 mt-1">Sign in to continue your dashboard workspace.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                            <div className={`relative rounded-xl border-2 transition-all duration-300 ${focused === 'email' ? 'border-teal-500 shadow-lg shadow-teal-500/10' : 'border-gray-200'}`}>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 bg-transparent rounded-xl focus:outline-none text-gray-900 placeholder-gray-400"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocused('email')}
                                    onBlur={() => setFocused('')}
                                    placeholder="you@company.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                            <div className={`relative rounded-xl border-2 transition-all duration-300 ${focused === 'password' ? 'border-teal-500 shadow-lg shadow-teal-500/10' : 'border-gray-200'}`}>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-3 bg-transparent rounded-xl focus:outline-none text-gray-900 placeholder-gray-400"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocused('password')}
                                    onBlur={() => setFocused('')}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3.5 font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Sign In
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">Sign up</Link>
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-xs text-center text-gray-400">
                            Upload Excel, ask the agent, and generate dashboards faster.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
