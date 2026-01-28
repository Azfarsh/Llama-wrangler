import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header */}
            <nav className="flex items-center justify-between p-6 bg-white shadow-sm border-b border-gray-200">
                <Link to="/" className="text-2xl font-bold text-blue-600">AutoWrangler AI</Link>
                <div className="space-x-4">
                    <Link to="/how-it-works" className="text-gray-600 hover:text-gray-900">How It Works</Link>
                    <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">About AutoWrangler AI</h1>
                    
                    <div className="prose max-w-none">
                        <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                            AutoWrangler AI is an agentic, LLM-powered data wrangling system designed to democratize 
                            data preparation. Built for data scientists, analysts, and anyone who works with data, 
                            it eliminates the need for manual coding and complex spreadsheet operations.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">The Problem We Solve</h2>
                        <p className="text-gray-700 mb-4 leading-relaxed">
                            Data professionals spend 70-80% of their time cleaning and preparing data. Traditional 
                            tools require technical expertise, are time-consuming, and error-prone. AutoWrangler AI 
                            changes this by using AI agents to understand your intent and automatically transform your data.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How It Works</h2>
                        <p className="text-gray-700 mb-4 leading-relaxed">
                            Our system uses a multi-agent architecture powered by Google Gemini:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
                            <li><strong>Intent Understanding Agent</strong> - Analyzes your natural language query</li>
                            <li><strong>Planning Agent</strong> - Creates a step-by-step transformation plan</li>
                            <li><strong>Execution Agent</strong> - Performs safe, deterministic data operations</li>
                            <li><strong>Validation Agent</strong> - Validates results and generates insights</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Research Foundation</h2>
                        <p className="text-gray-700 mb-4 leading-relaxed">
                            This project is inspired by the research paper:
                        </p>
                        <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
                            <p className="font-semibold text-gray-900">AutoDW: Automatic Data Wrangling Leveraging Large Language Models</p>
                            <p className="text-gray-600">ASE 2024</p>
                        </div>
                        <p className="text-gray-700 mb-6 leading-relaxed">
                            We've enhanced the original concept with a modern web interface, conversational UX, 
                            and comprehensive dataset visualizations.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Key Features</h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
                            <li>Natural language interface - no coding required</li>
                            <li>Automatic dataset profiling and understanding</li>
                            <li>Comprehensive data transformations</li>
                            <li>ML-ready output formats</li>
                            <li>Rich visualizations and insights</li>
                            <li>Safe, deterministic execution</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Technology Stack</h2>
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">Backend</h3>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• FastAPI (Python)</li>
                                    <li>• Pandas</li>
                                    <li>• Google Gemini API</li>
                                    <li>• scikit-learn</li>
                                </ul>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">Frontend</h3>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• React 19</li>
                                    <li>• Tailwind CSS</li>
                                    <li>• React Router</li>
                                    <li>• Vite</li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <p className="text-gray-600 text-sm">
                                <strong>Note:</strong> This is an academic prototype. For production use, additional 
                                features like proper authentication, database storage, and comprehensive error handling 
                                would be recommended.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-4">
                        <Link 
                            to="/signup"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Get Started
                        </Link>
                        <Link 
                            to="/"
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
