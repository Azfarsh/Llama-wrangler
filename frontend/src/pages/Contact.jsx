import React from 'react';
import { Link } from 'react-router-dom';

export default function Contact() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h1>
                <p className="text-gray-700 mb-4">
                    This project was developed by [Your Name] for the [Course Name] Final Year Project.
                </p>
                <div className="border-t pt-4">
                    <p className="text-gray-600"><strong>Email:</strong> student@university.edu</p>
                    <p className="text-gray-600"><strong>College:</strong> [University Name]</p>
                </div>
                <div className="mt-8">
                    <Link to="/home" className="text-blue-600 hover:underline">Back to Home</Link>
                </div>
            </div>
        </div>
    );
}
