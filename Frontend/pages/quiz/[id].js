import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { apiRequest } from '../../utils/api';
import { CheckCircleIcon, XCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function Quiz() {
  const router = useRouter();
  const { id } = router.query;
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startTime] = useState(() => Date.now());

  useEffect(() => {
    if (id) {
      fetchQuiz();
    }
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const content = await apiRequest(`/content-generator/content/${id}`);
      if (content && (content.type === 'quiz' || content.contentType === 'quiz')) {
        setQuiz(content);
      } else {
        setError('Quiz not found or invalid content type');
      }
    } catch (err) {
      console.error('Error fetching quiz:', err);
      setError('Failed to load quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex,
    });
  };

  const handleNext = () => {
    if (currentQuestion < (quiz?.questions?.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore();
      setShowResults(true);
    }
  };

  const calculateScore = async () => {
    let correct = 0;
    quiz?.questions?.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    setScore(correct);
    
    // Save score to database
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000); // in seconds
      const percentage = Math.round((correct / (quiz?.questions?.length || 1)) * 100);
      
      await apiRequest('/content-generator/save-result', {
        method: 'POST',
        body: JSON.stringify({
          contentId: parseInt(id),
          contentType: 'quiz',
          topic: quiz?.topic || quiz?.title,
          score: correct,
          totalQuestions: quiz?.questions?.length || 0,
          percentage,
          timeSpent,
          answers: selectedAnswers,
        }),
      });
    } catch (err) {
      console.error('Error saving quiz result:', err);
      // Don't block UI if save fails
    }
  };

  if (loading) {
    return (
      <ProtectedRoute roles={['learner']}>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-auto">
            <Navbar title="Quiz" />
            <main className="p-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!quiz) {
    return (
      <ProtectedRoute roles={['learner']}>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-auto">
            <Navbar title="Quiz" />
            <main className="p-6">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                Quiz not found
              </div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const question = quiz.questions?.[currentQuestion];
  const progress = ((currentQuestion + 1) / (quiz.questions?.length || 1)) * 100;

  return (
    <ProtectedRoute roles={['learner']}>
      <div className="flex h-screen bg-gradient-to-br from-blue-50 to-white">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <Navbar title="Quiz" />
          
          <main className="p-6 max-w-4xl mx-auto w-full">
            {!showResults ? (
              <>
                {/* Quiz Header */}
                <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                  <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
                  <p className="text-gray-600 mb-4">{quiz.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Question {currentQuestion + 1} of {quiz.questions?.length || 0}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-pink-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Question Card */}
                {question && (
                  <div className="bg-white rounded-2xl p-8 shadow-lg mb-6 transform transition-all duration-300 hover:shadow-xl">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">
                      {question.question}
                    </h2>
                    
                    <div className="space-y-3">
                      {question.options?.map((option, index) => {
                        const isSelected = selectedAnswers[currentQuestion] === index;
                        return (
                          <button
                            key={index}
                            onClick={() => handleAnswerSelect(currentQuestion, index)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                              isSelected
                                ? 'bg-purple-100 border-purple-500 text-purple-900'
                                : 'bg-gray-50 border-gray-300 text-gray-700 hover:border-purple-400'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                                isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-400'
                              }`}>
                                {isSelected && <div className="w-3 h-3 rounded-full bg-white"></div>}
                              </div>
                              <span className="font-medium">{option}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={handleNext}
                      disabled={selectedAnswers[currentQuestion] === undefined}
                      className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {currentQuestion < (quiz.questions?.length || 0) - 1 ? (
                        <>
                          Next Question
                          <ArrowRightIcon className="w-5 h-5" />
                        </>
                      ) : (
                        'Finish Quiz'
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Results Screen */
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="mb-6">
                  <div className="text-6xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                    {score}/{quiz.questions?.length || 0}
                  </div>
                  <div className="text-2xl text-gray-600 mb-4">
                    {score === (quiz.questions?.length || 0) ? 'Perfect Score! 🎉' : 
                     score >= (quiz.questions?.length || 0) * 0.7 ? 'Great Job! 👍' : 
                     'Keep Learning! 💪'}
                  </div>
                  <div className="text-lg text-gray-500">
                    {Math.round((score / (quiz.questions?.length || 1)) * 100)}% Correct
                  </div>
                </div>

                {/* Review Answers */}
                <div className="mt-8 text-left">
                  <h3 className="text-xl font-bold mb-4">Review Your Answers</h3>
                  <div className="space-y-4">
                    {quiz.questions?.map((q, index) => {
                      const userAnswer = selectedAnswers[index];
                      const isCorrect = userAnswer === q.correctAnswer;
                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-2 ${
                            isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                          }`}
                        >
                          <div className="flex items-start mb-2">
                            {isCorrect ? (
                              <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" />
                            ) : (
                              <XCircleIcon className="w-6 h-6 text-red-500 mr-2 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="font-semibold mb-2">{q.question}</p>
                              <p className="text-sm text-gray-600 mb-1">
                                Your answer: <span className={isCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                                  {q.options[userAnswer]}
                                </span>
                              </p>
                              {!isCorrect && (
                                <p className="text-sm text-gray-600">
                                  Correct answer: <span className="text-green-700 font-medium">
                                    {q.options[q.correctAnswer]}
                                  </span>
                                </p>
                              )}
                              {q.explanation && (
                                <p className="text-sm text-gray-700 mt-2 italic">
                                  {q.explanation}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => router.push('/ai-content-generator')}
                  className="mt-8 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all duration-300 transform hover:scale-105"
                >
                  Generate More Content
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

