import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">About AutoDW-Lite</h1>
                <p className="text-gray-700 mb-4">
                    AutoDW-Lite is a final-year project inspired by the research paper <strong>"AutoDW: Automatic Data Wrangling with Large Language Models"</strong> (ASE 2024).
                </p>
                <p className="text-gray-700 mb-4">
                    The goal of this project is to democratize data preparation by allowing non-technical users to clean, transform, and format datasets using simple natural language commands.
                </p>
                <h2 className="text-xl font-semibold mt-6 mb-2">Technology Stack</h2>
                <ul className="list-disc list-inside text-gray-600 mb-6">
                    <li><strong>Frontend:</strong> React, Tailwind CSS</li>
                    <li><strong>Backend:</strong> FastAPI, Python</li>
                    <li><strong>AI:</strong> Google Gemini API</li>
                    <li><strong>Data Processing:</strong> Pandas</li>
                </ul>
                <div className="mt-8 text-center">
                    <Link to="/home" className="text-blue-600 hover:underline">Back to Home</Link>
                </div>
            </div>
        </div>
    );
}
