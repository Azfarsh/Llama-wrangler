import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Navbar */}
            <nav className="flex items-center justify-between p-6 bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="text-2xl font-bold text-blue-600">AutoWrangler AI</div>
                <div className="space-x-4 flex items-center">
                    <Link to="/how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How It Works</Link>
                    <Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors">About</Link>
                    <Link to="/login" className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">Login</Link>
                    <Link to="/signup" className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <h1 className="text-6xl font-extrabold text-gray-900 tracking-tight mb-6 max-w-4xl">
                    Data Wrangling, <br />
                    <span className="text-blue-600">Autonomously Solved</span>
                </h1>
                <p className="max-w-3xl text-xl text-gray-600 mb-10 leading-relaxed">
                    Stop spending 70-80% of your time cleaning data manually. Simply upload your dataset, 
                    tell our AI agent what you need in natural language, and get a production-ready, 
                    ML-ready file in seconds. No coding required.
                </p>
                <div className="flex gap-4">
                    <Link 
                        to="/signup" 
                        className="px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition-all hover:shadow-xl"
                    >
                        Start Wrangling Free
                    </Link>
                    <Link 
                        to="/how-it-works" 
                        className="px-8 py-4 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                    >
                        Learn How It Works
                    </Link>
                </div>
            </section>

            {/* Problem Statement */}
            <section className="py-20 bg-white">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">The Problem: Manual Data Prep</h2>
                    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                        Data scientists and analysts spend up to <span className="font-bold text-red-600">70-80%</span> of their time 
                        just cleaning, transforming, and preparing data. Traditional tools require:
                    </p>
                    <div className="grid md:grid-cols-3 gap-6 mt-12">
                        <div className="p-6 bg-red-50 rounded-lg border border-red-100">
                            <div className="text-4xl mb-4">💻</div>
                            <h3 className="font-semibold text-gray-900 mb-2">Technical Expertise</h3>
                            <p className="text-gray-600 text-sm">Requires Python, SQL, or complex Excel formulas</p>
                        </div>
                        <div className="p-6 bg-red-50 rounded-lg border border-red-100">
                            <div className="text-4xl mb-4">⏱️</div>
                            <h3 className="font-semibold text-gray-900 mb-2">Time Consuming</h3>
                            <p className="text-gray-600 text-sm">Hours or days spent on repetitive data cleaning tasks</p>
                        </div>
                        <div className="p-6 bg-red-50 rounded-lg border border-red-100">
                            <div className="text-4xl mb-4">❌</div>
                            <h3 className="font-semibold text-gray-900 mb-2">Error Prone</h3>
                            <p className="text-gray-600 text-sm">Manual processes lead to mistakes and inconsistencies</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">How AutoWrangler AI Helps</h2>
                    <p className="text-center text-gray-600 mb-12 text-lg">Powered by agentic AI to understand, plan, and execute data transformations</p>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                            <div className="text-blue-600 text-5xl mb-4">🤖</div>
                            <h3 className="text-2xl font-semibold mb-3 text-gray-900">Agentic AI</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Powered by Google Gemini with a multi-agent architecture. Our system uses specialized agents 
                                for intent understanding, planning, execution, and validation—ensuring accuracy and reliability.
                            </p>
                        </div>
                        <div className="p-8 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                            <div className="text-blue-600 text-5xl mb-4">💬</div>
                            <h3 className="text-2xl font-semibold mb-3 text-gray-900">Natural Language</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Just say "Clean this for ML classification" or "Remove nulls and normalize columns". 
                                No code, no complex rules. Our AI understands your intent and plans the transformations automatically.
                            </p>
                        </div>
                        <div className="p-8 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                            <div className="text-blue-600 text-5xl mb-4">⚡</div>
                            <h3 className="text-2xl font-semibold mb-3 text-gray-900">Instant Results</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Get a preview of your data, comprehensive statistics, and a downloadable clean file instantly. 
                                Perfect for ML pipelines, BI tools, or analytics platforms.
                            </p>
                        </div>
                        <div className="p-8 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                            <div className="text-blue-600 text-5xl mb-4">🔒</div>
                            <h3 className="text-2xl font-semibold mb-3 text-gray-900">Safe & Deterministic</h3>
                            <p className="text-gray-600 leading-relaxed">
                                LLM reasoning is separated from execution. Transformations are performed using safe, 
                                deterministic Python operations—no hallucination, no randomness.
                            </p>
                        </div>
                        <div className="p-8 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                            <div className="text-blue-600 text-5xl mb-4">📊</div>
                            <h3 className="text-2xl font-semibold mb-3 text-gray-900">Rich Visualizations</h3>
                            <p className="text-gray-600 leading-relaxed">
                                See dataset statistics, missing values, column distributions, and data previews 
                                before and after transformations. Full transparency and trust.
                            </p>
                        </div>
                        <div className="p-8 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                            <div className="text-blue-600 text-5xl mb-4">🎯</div>
                            <h3 className="text-2xl font-semibold mb-3 text-gray-900">ML Ready Output</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Automatically handles encoding, normalization, feature extraction, and text vectorization. 
                                Outputs are ready for scikit-learn, TensorFlow, or any ML framework.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Research Inspiration */}
            <section className="py-20 bg-white">
                <div className="max-w-5xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center text-gray-900 mb-6">Research-Aligned Design</h2>
                    <div className="bg-blue-50 rounded-xl p-8 border border-blue-100">
                        <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                            This project is directly inspired by the research paper:
                        </p>
                        <div className="bg-white rounded-lg p-6 mb-4 border border-blue-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                AutoDW: Automatic Data Wrangling Leveraging Large Language Models
                            </h3>
                            <p className="text-gray-600">ASE 2024</p>
                        </div>
                        <div className="space-y-3 text-gray-700">
                            <p className="font-semibold">Key ideas adopted from the paper:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Separation of LLM reasoning and deterministic execution</li>
                                <li>Feature Type Inference (FTI)</li>
                                <li>Prediction engineering (understanding dataset purpose)</li>
                                <li>End-to-end automation</li>
                                <li>Agent-based planning and validation</li>
                            </ul>
                            <p className="mt-4 font-semibold">Key enhancements over AutoDW:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>No code shown to the user—fully conversational</li>
                                <li>ChatGPT-style interface for better UX</li>
                                <li>Modern web UI built with React</li>
                                <li>Gemini-powered agent execution</li>
                                <li>Rich dataset visualizations and insights</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="max-w-5xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
                    <div className="space-y-8">
                        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
                            <div className="flex items-start space-x-4">
                                <div className="text-4xl font-bold text-blue-600">1️⃣</div>
                                <div>
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Upload Your Dataset</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Upload CSV or Excel files. Our system automatically profiles your dataset, 
                                        identifying columns, data types, missing values, and statistics.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
                            <div className="flex items-start space-x-4">
                                <div className="text-4xl font-bold text-blue-600">2️⃣</div>
                                <div>
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Describe Your Intent</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Tell our AI agent what you want in natural language. Examples: 
                                        "Clean this for ML classification", "Remove nulls and encode categoricals", 
                                        "Prepare for regression analysis".
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
                            <div className="flex items-start space-x-4">
                                <div className="text-4xl font-bold text-blue-600">3️⃣</div>
                                <div>
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">AI Agents Work</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        <strong>Intent Understanding Agent</strong> analyzes your query. 
                                        <strong> Planning Agent</strong> creates a step-by-step transformation plan. 
                                        <strong> Execution Agent</strong> performs deterministic operations. 
                                        <strong> Validation Agent</strong> generates insights and validates results.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
                            <div className="flex items-start space-x-4">
                                <div className="text-4xl font-bold text-blue-600">4️⃣</div>
                                <div>
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Get Clean Data</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Download your processed dataset with a summary of transformations, 
                                        key insights, and suggested use cases. Ready for ML, BI, or analytics!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Perfect For</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">🤖 Machine Learning</h3>
                            <p className="text-gray-600">
                                Prepare datasets for classification, regression, clustering. Automatic encoding, 
                                normalization, feature extraction, and text vectorization.
                            </p>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-100">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">📊 Business Intelligence</h3>
                            <p className="text-gray-600">
                                Clean data for dashboards, reports, and analytics. Handle missing values, 
                                standardize formats, and ensure data quality.
                            </p>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">📈 Data Analytics</h3>
                            <p className="text-gray-600">
                                Transform raw data into analysis-ready formats. Remove duplicates, 
                                handle outliers, and prepare for statistical analysis.
                            </p>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border border-orange-100">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">📋 Reporting</h3>
                            <p className="text-gray-600">
                                Standardize data formats, clean inconsistencies, and prepare datasets 
                                for automated reporting systems.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Data?</h2>
                    <p className="text-xl mb-8 text-blue-100">
                        Join the future of data wrangling. No coding, no complexity—just results.
                    </p>
                    <Link 
                        to="/signup" 
                        className="inline-block px-8 py-4 text-lg font-semibold bg-white text-blue-600 rounded-lg shadow-xl hover:bg-gray-100 transition-all"
                    >
                        Get Started Free
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-gray-900 text-gray-400">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h4 className="text-white font-semibold mb-4">AutoWrangler AI</h4>
                            <p className="text-sm">Agentic AI-powered data wrangling for everyone.</p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/how-it-works" className="hover:text-white">How It Works</Link></li>
                                <li><Link to="/about" className="hover:text-white">About</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Account</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/login" className="hover:text-white">Login</Link></li>
                                <li><Link to="/signup" className="hover:text-white">Sign Up</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Research</h4>
                            <p className="text-sm">Inspired by AutoDW (ASE 2024)</p>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-sm">
                        <p>© 2026 AutoWrangler AI. Academic Prototype.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
