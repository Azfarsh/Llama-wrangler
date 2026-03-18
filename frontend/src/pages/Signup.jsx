import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AxelLogo from '../assets/Axellogo.png';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [focused, setFocused] = useState('');
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    const handleSignup = (e) => {
        e.preventDefault();
        if (name && email && password) {
            const userData = {
                name,
                email,
                password,
                createdAt: new Date().toISOString()
            };
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', name);
            localStorage.setItem('userData', JSON.stringify(userData));
            navigate('/dashboard');
        }
    };

    const inputClass = (field) =>
        `relative rounded-xl border-2 transition-all duration-300 ${
            focused === field ? 'border-teal-500 shadow-lg shadow-teal-500/10' : 'border-gray-200'
        }`;

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left panel - branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden items-center justify-center">
                <div className="absolute inset-0 grid-pattern opacity-30" />
                <div className="absolute top-20 -right-20 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-float" />
                <div className="absolute -bottom-20 left-10 w-80 h-80 bg-teal-400/15 rounded-full blur-3xl animate-float-slow" />

                <div className="relative z-10 text-center px-12">
                    <div className="mb-8 flex justify-center">
                        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 animate-glow-pulse">
                            <img src={AxelLogo} alt="Axel AI" className="h-20 w-20 object-contain" />
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">Join Axel AI</h2>
                    <p className="text-teal-200 text-lg leading-relaxed max-w-md mx-auto">
                        Create your account and start building intelligent dashboards with AI in seconds.
                    </p>

                    {/* Animated steps */}
                    <div className="mt-12 space-y-4 max-w-sm mx-auto text-left">
                        {[
                            { num: 1, text: 'Create your account', active: step >= 1 },
                            { num: 2, text: 'Upload your spreadsheet', active: step >= 2 },
                            { num: 3, text: 'Ask AI to build dashboards', active: step >= 3 },
                        ].map((s) => (
                            <div key={s.num} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${s.active ? 'bg-teal-500/20 border border-teal-400/30' : 'bg-white/5 border border-white/5'}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${s.active ? 'bg-teal-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                                    {s.num}
                                </div>
                                <span className={`text-sm ${s.active ? 'text-teal-200' : 'text-gray-500'}`}>{s.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right panel - signup form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex justify-center mb-8">
                        <img src={AxelLogo} alt="Axel AI" className="h-14 w-14 rounded-xl object-contain" />
                    </div>

                    <div className="mb-8">
                        <p className="text-xs tracking-widest uppercase text-teal-600 font-semibold mb-1">Axel AI</p>
                        <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                        <p className="text-gray-500 mt-1">Start building dashboards with AI today.</p>
                    </div>

                    {/* Progress bar */}
                    <div className="flex gap-2 mb-8">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-teal-500' : 'bg-gray-200'}`} />
                        ))}
                    </div>

                    <form onSubmit={handleSignup} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                            <div className={inputClass('name')}>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-transparent rounded-xl focus:outline-none text-gray-900 placeholder-gray-400"
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); if (e.target.value) setStep(Math.max(step, 1)); }}
                                    onFocus={() => setFocused('name')}
                                    onBlur={() => setFocused('')}
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                            <div className={inputClass('email')}>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 bg-transparent rounded-xl focus:outline-none text-gray-900 placeholder-gray-400"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); if (e.target.value) setStep(Math.max(step, 2)); }}
                                    onFocus={() => setFocused('email')}
                                    onBlur={() => setFocused('')}
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                            <div className={inputClass('password')}>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-3 bg-transparent rounded-xl focus:outline-none text-gray-900 placeholder-gray-400"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); if (e.target.value) setStep(3); }}
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
                            Create Account & Get Started
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link to="/login" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">Login</Link>
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-xs text-center text-gray-400">
                            The agent can clean files, generate dashboards, and create diagrams on demand.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
