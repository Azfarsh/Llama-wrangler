import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import ThemeToggle from '../components/ThemeToggle';
import BrandLogo from '../components/BrandLogo';

export default function Contact() {
    const [mobileMenu, setMobileMenu] = useState(false);
    const { dark, toggle: toggleTheme } = useTheme();
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--page-bg)' }}>
            <nav className="glass px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <Link to="/" className="flex items-center gap-3">
                    <BrandLogo size="md" className="shrink-0" />
                    <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Axel <span style={{ color: 'var(--teal-accent)' }}>AI</span></span>
                </Link>
                <div className="hidden sm:flex items-center gap-4">
                    <Link to="/about" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>About</Link>
                    <Link to="/" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>Home</Link>
                    <ThemeToggle dark={dark} toggle={toggleTheme} />
                </div>
                <div className="sm:hidden flex items-center gap-2">
                    <ThemeToggle dark={dark} toggle={toggleTheme} />
                    <button className="p-2 hover:text-teal-400" style={{ color: 'var(--text-secondary)' }} onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            {mobileMenu ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
                        </svg>
                    </button>
                </div>
            </nav>
            {mobileMenu && (
                <div className="sm:hidden glass-dark px-4 py-3 space-y-2 z-40 relative" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <Link to="/about" onClick={() => setMobileMenu(false)} className="block text-sm font-medium py-1 hover:text-teal-400" style={{ color: 'var(--text-secondary)' }}>About</Link>
                    <Link to="/" onClick={() => setMobileMenu(false)} className="block text-sm font-medium py-1 hover:text-teal-400" style={{ color: 'var(--text-secondary)' }}>Home</Link>
                </div>
            )}

            <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
                {/* Hero */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium mb-6" style={{ background: 'var(--teal-soft-bg)', borderColor: 'var(--teal-soft-border)', color: 'var(--teal-accent)' }}>
                        <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                        Get in Touch
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Contact Us</h1>
                    <p className="max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        Have questions, feedback, or want to learn more about Axel AI? We would love to hear from you.
                    </p>
                </div>

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Contact Info Cards */}
                    <div className="lg:col-span-2 space-y-4">
                        {[
                            { icon: '📧', label: 'Email', value: 'student@university.edu', sub: 'Primary Contact' },
                            { icon: '🏫', label: 'Institution', value: '[University Name]', sub: 'Department of Computer Science' },
                            { icon: '📍', label: 'Location', value: 'Pune, India', sub: 'Maharashtra' },
                            { icon: '🎓', label: 'Project Type', value: 'Final Year Project', sub: 'Academic Prototype 2026' },
                        ].map((item) => (
                            <div key={item.label} className="flex items-start gap-4 p-4 rounded-xl card-hover" style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-color)' }}>
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.sub}</p>
                                </div>
                            </div>
                        ))}

                        {/* Quick Links */}
                        <div className="rounded-xl p-4" style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-color)' }}>
                            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Quick Links</p>
                            <div className="space-y-2">
                                <Link to="/about" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all hover:opacity-80" style={{ background: 'var(--card-bg)', color: 'var(--text-secondary)' }}>
                                    <span>📖</span> About the Project
                                </Link>
                                <Link to="/how-it-works" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all hover:opacity-80" style={{ background: 'var(--card-bg)', color: 'var(--text-secondary)' }}>
                                    <span>⚙️</span> How It Works
                                </Link>
                                <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all hover:opacity-80" style={{ background: 'var(--card-bg)', color: 'var(--text-secondary)' }}>
                                    <span>🚀</span> Try the Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-3">
                        <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-color)' }}>
                            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Send a Message</h2>
                            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>We will get back to you as soon as possible.</p>

                            {submitted ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-3xl">✅</div>
                                    <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Message Sent!</p>
                                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Thank you for reaching out.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Your Name</label>
                                        <input
                                            type="text" required
                                            className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-all text-sm"
                                            style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
                                        <input
                                            type="email" required
                                            className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-all text-sm"
                                            style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Message</label>
                                        <textarea
                                            required rows={5}
                                            className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-all text-sm resize-none"
                                            style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="How can we help you?"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-3.5 text-white rounded-xl font-semibold transition-all hover:-translate-y-0.5 text-sm"
                                        style={{ background: 'linear-gradient(135deg, #0d9488, #14b8a6)', boxShadow: '0 8px 30px rgba(13,148,136,0.25)' }}
                                    >
                                        Send Message
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Link to="/" className="font-medium transition-colors text-sm hover:underline" style={{ color: 'var(--teal-accent)' }}>&larr; Back to Home</Link>
                </div>
            </div>
        </div>
    );
}
