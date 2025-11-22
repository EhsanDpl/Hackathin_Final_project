import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { apiRequest } from '../../utils/api';
import { ArrowLeftIcon, CheckCircleIcon, LightBulbIcon } from '@heroicons/react/24/outline';

export default function CodingChallenge() {
  const router = useRouter();
  const { id } = router.query;
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (id) {
      fetchChallenge();
    }
  }, [id]);

  const fetchChallenge = async () => {
    try {
      const content = await apiRequest(`/content-generator/content/${id}`);
      if (content && (content.type === 'coding-challenge' || content.contentType === 'coding-challenge')) {
        setChallenge(content);
        setCode(content.starterCode || '// Your code here\n');
      } else {
        setError('Coding challenge not found or invalid content type');
      }
    } catch (err) {
      console.error('Error fetching challenge:', err);
      setError('Failed to load coding challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunCode = () => {
    // Simple code execution simulation
    // In a real app, this would send code to a code execution service
    setOutput('Running your code...\n\nNote: This is a demo. In production, code would be executed on a secure server.');
  };

  const handleSubmit = async () => {
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const testCasesPassed = challenge?.testCases?.length || 0; // Simplified
      
      await apiRequest('/content-generator/save-result', {
        method: 'POST',
        body: JSON.stringify({
          contentId: parseInt(id),
          contentType: 'coding-challenge',
          topic: challenge?.topic || challenge?.title,
          score: testCasesPassed,
          totalQuestions: challenge?.testCases?.length || 0,
          percentage: 100, // Simplified
          timeSpent,
          answers: { code, testCasesPassed },
        }),
      });
      
      setCompleted(true);
    } catch (err) {
      console.error('Error saving result:', err);
      setCompleted(true);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute roles={['learner']}>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-auto">
            <Navbar title="Coding Challenge" />
            <main className="p-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!challenge || error) {
    return (
      <ProtectedRoute roles={['learner']}>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-auto">
            <Navbar title="Coding Challenge" />
            <main className="p-6">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error || 'Coding challenge not found'}
              </div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (completed) {
    return (
      <ProtectedRoute roles={['learner']}>
        <div className="flex h-screen bg-gradient-to-br from-blue-50 to-white">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-auto">
            <Navbar title="Coding Challenge" />
            <main className="p-6 max-w-6xl mx-auto w-full">
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="mb-6">
                  <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                    Challenge Completed! 🎉
                  </h2>
                  <p className="text-lg text-gray-600">
                    Great job completing this coding challenge!
                  </p>
                </div>
                <button
                  onClick={() => router.push('/ai-content-generator')}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all duration-300 transform hover:scale-105"
                >
                  Generate More Content
                </button>
              </div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute roles={['learner']}>
      <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <Navbar title="Coding Challenge" />
          
          <main className="p-6 max-w-6xl mx-auto w-full">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <h1 className="text-3xl font-bold mb-2">{challenge.title}</h1>
              <p className="text-gray-600 mb-4">{challenge.description}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Instructions and Code */}
              <div className="space-y-6">
                {/* Instructions */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h2 className="text-xl font-bold mb-4">Instructions</h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{challenge.instructions}</p>
                  </div>
                </div>

                {/* Test Cases */}
                {challenge.testCases && challenge.testCases.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Test Cases</h2>
                    <div className="space-y-3">
                      {challenge.testCases.map((testCase, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="text-sm font-semibold text-gray-700 mb-2">Test Case {index + 1}</div>
                          <div className="text-sm text-gray-600">
                            <div><strong>Input:</strong> {testCase.input}</div>
                            <div><strong>Expected Output:</strong> {testCase.expectedOutput}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hints */}
                {challenge.hints && challenge.hints.length > 0 && (
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center mb-4">
                      <LightBulbIcon className="w-6 h-6 text-yellow-600 mr-2" />
                      <h2 className="text-xl font-bold">Hints</h2>
                    </div>
                    <div className="space-y-2">
                      {challenge.hints.map((hint, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentHint(index)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                            currentHint === index
                              ? 'bg-yellow-100 border-yellow-500'
                              : 'bg-white border-yellow-200 hover:border-yellow-400'
                          }`}
                        >
                          <div className="font-semibold text-sm text-gray-700">Hint {index + 1}</div>
                          {currentHint === index && (
                            <div className="text-gray-600 mt-1">{hint}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Code Editor */}
              <div className="space-y-6">
                <div className="bg-gray-900 rounded-2xl p-6 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Code Editor</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={handleRunCode}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-all"
                      >
                        Run Code
                      </button>
                      <button
                        onClick={() => setShowSolution(!showSolution)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all"
                      >
                        {showSolution ? 'Hide' : 'Show'} Solution
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-96 bg-gray-800 text-green-400 font-mono text-sm p-4 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none resize-none"
                    spellCheck={false}
                  />
                </div>

                {/* Output */}
                <div className="bg-gray-900 rounded-2xl p-6 shadow-lg">
                  <h2 className="text-xl font-bold text-white mb-4">Output</h2>
                  <div className="bg-gray-800 text-green-400 font-mono text-sm p-4 rounded-lg border border-gray-700 min-h-[100px]">
                    {output || 'No output yet. Click "Run Code" to execute your solution.'}
                  </div>
                </div>

                {/* Solution (if shown) */}
                {showSolution && challenge.solution && (
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-6 shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Solution</h2>
                    <pre className="bg-gray-800 text-green-400 font-mono text-sm p-4 rounded-lg overflow-x-auto">
                      <code>{challenge.solution}</code>
                    </pre>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Submit Solution
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

