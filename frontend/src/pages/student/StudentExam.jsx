import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Clock, CheckCircle, XCircle, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

const StudentExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { courses, exams, submitExam } = useData();
  
  const course = courses.find(c => c.id === parseInt(id));
  const exam = exams.find(e => e.courseId === parseInt(id));
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(exam?.duration * 60 || 1800); // in seconds
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    if (timeLeft > 0 && !examSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !examSubmitted) {
      handleSubmitExam();
    }
  }, [timeLeft, examSubmitted]);

  if (!course || !exam) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Exam not found</h2>
        </div>
      </Layout>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);
    
    // Store the answer
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));

    // Auto-advance after 2 seconds
    setTimeout(() => {
      if (currentQuestion < exam.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setShowFeedback(false);
        setSelectedAnswer(null);
      } else {
        // Last question - show submit button
        setShowFeedback(false);
      }
    }, 2000);
  };

  // const handleSubmitExam = () => {
  //   // Calculate score
  //   let correctAnswers = 0;
  //   exam.questions.forEach(question => {
  //     if (answers[question.id] === question.correctAnswer) {
  //       correctAnswers++;
  //     }
  //   });
    
  //   const finalScore = Math.round((correctAnswers / exam.questions.length) * 100);
  //   setScore(finalScore);
  //   setExamSubmitted(true);
  //   setShowResults(true);
    
  //   // Submit to backend (in real app)
  //   if (user) {
  //     submitExam(user.id, course.id, exam.id, finalScore);
  //   }
  // };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const currentQuestionData = exam.questions[currentQuestion];
  const isAnswered = answers[currentQuestionData?.id] !== undefined;
  const correctAnswer = currentQuestionData?.correctAnswer;
  const userAnswer = selectedAnswer !== null ? selectedAnswer : answers[currentQuestionData?.id];

  if (showResults) {
    const passed = score >= 80;
    
    return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {passed ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {passed ? 'Congratulations!' : 'Exam Complete'}
            </h1>
            
            <p className="text-gray-600 mb-6">
              {passed 
                ? 'You have successfully passed the exam!' 
                : 'Unfortunately, you did not meet the passing requirements.'
              }
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{score}%</div>
                  <div className="text-sm text-gray-600">Your Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">80%</div>
                  <div className="text-sm text-gray-600">Passing Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Object.values(answers).filter((answer, index) => 
                      answer === exam.questions[index]?.correctAnswer
                    ).length}/{exam.questions.length}
                  </div>
                  <div className="text-sm text-gray-600">Correct Answers</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/student/course/${course.id}`)}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  passed 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {passed ? 'View Certificate' : 'Back to Course'}
              </button>
              
              <button
                onClick={() => navigate('/student/courses')}
                className="w-full py-3 px-6 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Browse More Courses
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
              <p className="text-gray-600">{course.title}</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{getAnsweredCount()}/{exam.questions.length}</div>
                <div className="text-sm text-gray-600">Answered</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-gray-600">Time Left</div>
              </div>
            </div>
          </div>
          
          {timeLeft < 300 && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800 text-sm">Less than 5 minutes remaining!</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestion + 1} of {exam.questions.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentQuestion + 1) / exam.questions.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / exam.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestionData?.question}
            </h2>
            
            <div className="space-y-3">
              {currentQuestionData?.options.map((option, index) => {
                let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ";
                
                if (showFeedback) {
                  if (index === correctAnswer) {
                    // Correct answer - always green
                    buttonClass += "border-green-500 bg-green-50 text-green-800";
                  } else if (index === userAnswer && index !== correctAnswer) {
                    // Wrong answer selected - red
                    buttonClass += "border-red-500 bg-red-50 text-red-800";
                  } else {
                    // Other options - neutral
                    buttonClass += "border-gray-200 bg-gray-50 text-gray-600";
                  }
                } else if (isAnswered && answers[currentQuestionData.id] === index) {
                  // Previously answered (when navigating back)
                  buttonClass += "border-blue-500 bg-blue-50 text-blue-800";
                } else {
                  // Default state
                  buttonClass += "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700";
                }

                return (
                  <button
                    key={index}
                    onClick={() => !showFeedback && handleAnswerSelect(currentQuestionData.id, index)}
                    disabled={showFeedback}
                    className={buttonClass}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                        showFeedback && index === correctAnswer
                          ? 'border-green-500 bg-green-500'
                          : showFeedback && index === userAnswer && index !== correctAnswer
                            ? 'border-red-500 bg-red-500'
                            : isAnswered && answers[currentQuestionData.id] === index
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                      }`}>
                        {((showFeedback && index === correctAnswer) || 
                          (showFeedback && index === userAnswer && index !== correctAnswer) ||
                          (isAnswered && answers[currentQuestionData.id] === index)) && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                      <span>{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Feedback Message */}
            {showFeedback && (
              <div className={`mt-4 p-4 rounded-lg border ${
                userAnswer === correctAnswer
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center">
                  {userAnswer === correctAnswer ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  )}
                  <span className={`font-medium ${
                    userAnswer === correctAnswer ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {userAnswer === correctAnswer ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                {currentQuestionData?.explanation && (
                  <p className={`mt-2 text-sm ${
                    userAnswer === correctAnswer ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {currentQuestionData.explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                if (currentQuestion > 0) {
                  setCurrentQuestion(currentQuestion - 1);
                  setShowFeedback(false);
                  setSelectedAnswer(null);
                }
              }}
              disabled={currentQuestion === 0}
              className="flex items-center space-x-2 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
            
            <div className="flex space-x-2">
              {exam.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentQuestion(index);
                    setShowFeedback(false);
                    setSelectedAnswer(null);
                  }}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    index === currentQuestion
                      ? 'bg-blue-600 text-white'
                      : answers[exam.questions[index].id] !== undefined
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            {currentQuestion === exam.questions.length - 1 ? (
              <button
                onClick={handleSubmitExam}
                disabled={!isAnswered}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Submit Exam</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setCurrentQuestion(currentQuestion + 1);
                  setShowFeedback(false);
                  setSelectedAnswer(null);
                }}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentExam;