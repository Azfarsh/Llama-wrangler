import React from 'react';
import { Link } from 'react-router-dom';
import AxelLogo from '../assets/Axellogo.png';

export default function Contact() {
    return (
        <div className="min-h-screen bg-white">
            <nav className="glass border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <Link to="/" className="flex items-center gap-3">
                    <img src={AxelLogo} alt="Axel AI" className="h-9 w-9 rounded-xl object-contain" />
                    <span className="text-xl font-bold text-gray-900">Axel <span className="text-teal-600">AI</span></span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link to="/about" className="text-gray-600 hover:text-teal-600 transition-colors text-sm font-medium">About</Link>
                    <Link to="/" className="text-gray-600 hover:text-teal-600 transition-colors text-sm font-medium">Home</Link>
                </div>
            </nav>

            <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
                <div className="max-w-md w-full">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                            <span className="text-3xl">📬</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
                        <p className="text-gray-500">Get in touch with the team behind Axel AI.</p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-8">
                        <p className="text-gray-600 mb-6 text-center">
                            This project was developed for a Final Year Project.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <span className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-lg">📧</span>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Email</p>
                                    <p className="text-gray-700 font-medium">student@university.edu</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <span className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-lg">🏫</span>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">College</p>
                                    <p className="text-gray-700 font-medium">[University Name]</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <Link to="/" className="text-teal-600 hover:text-teal-700 font-medium transition-colors">
                            &larr; Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
