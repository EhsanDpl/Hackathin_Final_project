// /pages/mongo-quiz.js
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { ArrowLeftIcon, ArrowRightIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

export default function Quiz() {
  const { user } = useAuth();

  const quizQuestions = [
    {
      question: "Which aggregation stage would you use to filter documents?",
      options: [
        "Select specific fields from documents",
        "Filter documents based on criteria",
        "Group documents by a specific field",
        "Sort documents by a specific field"
      ],
      answer: "Filter documents based on criteria",
      xp: 50
    },
    {
      question: "Which stage groups documents by a field?",
      options: [
        "Filter documents based on criteria",
        "Group documents by a specific field",
        "Select specific fields from documents",
        "Limit the number of documents returned"
      ],
      answer: "Group documents by a specific field",
      xp: 50
    },
    {
      question: "Which stage reshapes documents and selects specific fields?",
      options: [
        "Select specific fields from documents",
        "Group documents by a specific field",
        "Filter documents based on criteria",
        "Sort documents by a specific field"
      ],
      answer: "Select specific fields from documents",
      xp: 50
    },
    {
      question: "Which stage sorts documents by a specified field?",
      options: [
        "Sort documents by a specific field",
        "Group documents by a specific field",
        "Filter documents based on criteria",
        "Limit the number of documents returned"
      ],
      answer: "Sort documents by a specific field",
      xp: 50
    },
    {
      question: "Which stage limits the number of documents returned?",
      options: [
        "Limit the number of documents returned",
        "Select specific fields from documents",
        "Filter documents based on criteria",
        "Sort documents by a specific field"
      ],
      answer: "Limit the number of documents returned",
      xp: 50
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes

  useEffect(() => {
    if (completed) return;
    if (timer === 0) handleNext();
    const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, completed]);

  const handleNext = () => {
    if (selectedOption === quizQuestions[currentIndex].answer) {
      setScore(score + 1);
      setTotalXP(totalXP + quizQuestions[currentIndex].xp);
    }
    setSelectedOption(null);
    if (currentIndex + 1 < quizQuestions.length) setCurrentIndex(currentIndex + 1);
    else setCompleted(true);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedOption(null);
    }
  };

  const formatTime = seconds => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <ProtectedRoute roles={['learner']}>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <Navbar title="Quiz" />
          <main className="p-6 flex flex-col items-center">
            {!completed ? (
              <div className="w-full max-w-2xl space-y-6">

                {/* Header */}
                <div className="text-center space-y-1">
                  <h1 className="text-3xl font-bold text-indigo-600">Week 1: Backend Fundamentals Quiz 📝</h1>
                  <p className="text-gray-600">Test your understanding</p>
                </div>

                {/* Progress */}
                <div className="flex justify-between items-center text-gray-700 font-medium">
                  <span>Question {currentIndex + 1} of {quizQuestions.length}</span>
                  <span>⏱️ {formatTime(timer)} remaining</span>
                </div>

                {/* Question Card */}
                <div className="bg-white shadow-xl rounded-3xl p-6 border-t-4 border-indigo-500">
                  <h2 className="text-xl font-semibold mb-6">{quizQuestions[currentIndex].question}</h2>

                  {/* Options as cards */}
                  <div className="grid gap-4">
                    {quizQuestions[currentIndex].options.map((option, idx) => {
                      const isSelected = selectedOption === option;
                      const isCorrect = option === quizQuestions[currentIndex].answer;

                      let bgClass = "bg-gray-50 border border-gray-200 hover:bg-indigo-50";
                      if (selectedOption) {
                        if (isSelected) bgClass = isCorrect ? "bg-green-100 border-green-500" : "bg-red-100 border-red-500";
                        else bgClass = "bg-gray-50 border-gray-200";
                      }

                      return (
                        <button
                          key={idx}
                          className={`flex items-center justify-between w-full px-5 py-4 border rounded-2xl font-medium text-left transition ${bgClass} hover:scale-105 transform`}
                          onClick={() => !selectedOption && setSelectedOption(option)}
                        >
                          <span>{option}</span>
                          {selectedOption && isSelected && (
                            <span>
                              {isCorrect ? (
                                <CheckCircleIcon className="w-6 h-6 text-green-500" />
                              ) : (
                                <XCircleIcon className="w-6 h-6 text-red-500" />
                              )}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between mt-6">
                    <button
                      onClick={handlePrevious}
                      disabled={currentIndex === 0}
                      className="flex items-center px-4 py-2 bg-gray-200 rounded-xl font-medium hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowLeftIcon className="w-5 h-5 mr-2" /> Previous
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => (window.location.href = '/dashboard')}
                        className="flex items-center px-4 py-2 bg-gray-200 rounded-xl font-medium hover:bg-gray-300 transition"
                      >
                        <ArrowUturnLeftIcon className="w-5 h-5 mr-2" /> Back to Dashboard
                      </button>

                      <button
                        onClick={handleNext}
                        disabled={!selectedOption}
                        className={`flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl font-bold hover:scale-105 transform transition ${!selectedOption ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {currentIndex + 1 === quizQuestions.length ? 'Finish Quiz' : 'Next Question'}
                        <ArrowRightIcon className="w-5 h-5 ml-2" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Completion Screen
              <div className="w-full max-w-xl bg-white shadow-2xl rounded-3xl p-10 text-center space-y-6 border-t-8 border-indigo-500">
                <h2 className="text-3xl font-bold text-indigo-600">Quiz Completed!</h2>
                <p className="text-xl text-gray-700">
                  Total Score: <span className="font-bold">{score} / {quizQuestions.length}</span>
                </p>
                <p className="text-xl text-green-600 font-semibold">XP Earned: {totalXP}</p>
                
                {score === quizQuestions.length ? (
                  <p className="text-green-500 font-semibold text-lg">Excellent! You aced the quiz!</p>
                ) : score >= quizQuestions.length / 2 ? (
                  <p className="text-yellow-500 font-semibold text-lg">Good job! Keep practicing!</p>
                ) : (
                  <p className="text-red-500 font-semibold text-lg">Keep practicing! Try again.</p>
                )}

                <button
                  className="mt-4 px-10 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl font-bold hover:scale-105 transform transition"
                  onClick={() => {
                    setCurrentIndex(0);
                    setScore(0);
                    setTotalXP(0);
                    setCompleted(false);
                    setTimer(600);
                  }}
                >
                  Retry Quiz
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
