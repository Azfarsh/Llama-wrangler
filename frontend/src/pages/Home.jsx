import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Navbar placeholder */}
            <nav className="flex items-center justify-between p-6 bg-white shadow-sm">
                <div className="text-xl font-bold text-blue-600">AutoDW-Lite</div>
                <div className="space-x-4">
                    <Link to="/how-it-works" className="text-gray-600 hover:text-gray-900">How It Works</Link>
                    <Link to="/about" className="text-gray-600 hover:text-gray-900">About</Link>
                    <Link to="/login" className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50">Login</Link>
                    <Link to="/signup" className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-blue-50 to-white">
                <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight sm:text-6xl mb-6">
                    Data Wrangling, <br />
                    <span className="text-blue-600">Autonomously Solved.</span>
                </h1>
                <p className="max-w-2xl text-xl text-gray-600 mb-10">
                    Stop spending hours cleaning data manually. Simply upload your dataset, tell our AI agent what you need, and get a production-ready file in seconds.
                </p>
                <Link to="/signup" className="px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition">
                    Start Wrangling Free
                </Link>
            </header>

            {/* Problem Statement */}
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">The Problem: Manual Data Prep</h2>
                    <p className="text-lg text-gray-600">
                        Data scientists spend up to 80% of their time just cleaning data. Excel crashes, scripts break, and manual error correction is tedious.
                    </p>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How AutoDW-Lite Helps</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-6 bg-white rounded-lg shadow-sm">
                            <div className="text-blue-600 text-2xl mb-4">🤖</div>
                            <h3 className="text-xl font-semibold mb-2">Agentic AI</h3>
                            <p className="text-gray-600">Powered by Gemini to understand your intent and plan complex transformations.</p>
                        </div>
                        <div className="p-6 bg-white rounded-lg shadow-sm">
                            <div className="text-blue-600 text-2xl mb-4">✨</div>
                            <h3 className="text-xl font-semibold mb-2">Natural Language</h3>
                            <p className="text-gray-600">Just say "Clean this for ML" or "Remove nulls". No code needed.</p>
                        </div>
                        <div className="p-6 bg-white rounded-lg shadow-sm">
                            <div className="text-blue-600 text-2xl mb-4">📊</div>
                            <h3 className="text-xl font-semibold mb-2">Instant Results</h3>
                            <p className="text-gray-600">Get a preview of your data and a downloadable clean file instantly.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 bg-gray-900 text-gray-400 text-center">
                <p>© 2026 AutoDW-Lite Project. Academic Prototype.</p>
            </footer>
        </div>
    );
}
