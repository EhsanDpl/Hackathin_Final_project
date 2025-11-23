import { useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BottomChat from '../components/BottomChat';
import { isLearner } from '../utils/auth';
import { useAuth } from '../contexts/AuthContext';

export default function ChatPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute roles={['learner']}>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {isLearner(user) ? (
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 relative">
              <BottomChat />
            </div>
          </div>
        ) : (
          <>
            <Navbar title="AI Career Coach" />
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">AI Career Coach</h1>
                    <p className="text-gray-600 mb-6">
                      Get personalized learning recommendations, skill development advice, and career guidance 
                      based on your profile and current progress.
                    </p>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-3">How it works:</h2>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start">
                          <span className="text-purple-600 mr-2">•</span>
                          <span>Ask questions about skills, learning paths, or career development</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-600 mr-2">•</span>
                          <span>Get personalized recommendations based on your profile</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-600 mr-2">•</span>
                          <span>Click on suggested skill tabs to learn more</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-600 mr-2">•</span>
                          <span>Receive context-aware advice tailored to your role and experience</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Note:</strong> AI Chat is only available for learners.
                      </p>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}

