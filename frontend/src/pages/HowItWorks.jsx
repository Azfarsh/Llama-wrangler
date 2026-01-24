import React from 'react';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">How AutoDW-Lite Works</h1>
                <div className="space-y-8">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">1</div>
                        <div>
                            <h3 className="text-xl font-semibold">Upload Dataset</h3>
                            <p className="text-gray-600">Upload your raw CSV or Excel file securely.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">2</div>
                        <div>
                            <h3 className="text-xl font-semibold">Describe Goal</h3>
                            <p className="text-gray-600">Tell the agent what you want to achieve (e.g., "Prepare for churn prediction").</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">3</div>
                        <div>
                            <h3 className="text-xl font-semibold">AI Agent Planning</h3>
                            <p className="text-gray-600">Our LLM agent analyzes the data structure and plans a sequence of operations.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">4</div>
                        <div>
                            <h3 className="text-xl font-semibold">Execution & Download</h3>
                            <p className="text-gray-600">The system executes the cleaning code and provides the final file.</p>
                        </div>
                    </div>
                </div>
                <div className="mt-8 text-center">
                    <Link to="/home" className="text-blue-600 hover:underline">Back to Home</Link>
                </div>
            </div>
        </div>
    );
}
