import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import examConfig from '../../lib/examConfig';
import { Clock, FileText, ArrowLeft, ArrowRight } from 'lucide-react';
import { submitExamResult } from "../../services/api";

const StudentChapterExam = () => {
  const { courseId, chapterId } = useParams();
  const navigate = useNavigate();
  const examMeta = examConfig.find(e => e.courseId === parseInt(courseId) && e.chapterId === parseInt(chapterId));
  const { user } = useAuth();
  const { courses, questionBank, submitChapterExam, studentProgress } = useData();

  const course = courses.find(c => c.id === parseInt(courseId));
  const chapter = course?.chapters?.find(c => c.id === parseInt(chapterId));

  // Get questions for this specific chapter from the question bank
  const getChapterQuestions = () => {
    const chapterQuestions = questionBank.filter(q =>
      q.courseId === parseInt(courseId) &&
      q.chapterId === parseInt(chapterId)
    );

    // Shuffle the questions
    const shuffledQuestions = [...chapterQuestions].sort(() => 0.5 - Math.random());
    const totalQuestions = examMeta?.totalQuestions || 10;
    const limitedQuestions = shuffledQuestions.slice(0, Math.min(totalQuestions, shuffledQuestions.length));

    // 🔁 Now shuffle options inside each question
    const shuffledWithRandomOptions = limitedQuestions.map(q => {
      // Attach original index to each option
      const optionObjects = q.options.map((opt, idx) => ({
        text: opt,
        originalIndex: idx
      }));

      // Shuffle those option objects
      const shuffledOptions = [...optionObjects].sort(() => 0.5 - Math.random());

      // Find new index of the correct answer
      const newCorrectIndex = shuffledOptions.findIndex(o => o.originalIndex === q.correctAnswer);

      return {
        ...q,
        options: shuffledOptions.map(o => o.text),
        correctAnswer: newCorrectIndex
      };
    });

    return shuffledWithRandomOptions;
  };


  const [questions] = useState(() => getChapterQuestions());
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState((examMeta?.timeLimit || 15) * 60);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [submittedQuestions, setSubmittedQuestions] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // ⬅️ Add this in your component

  useEffect(() => {
    if (timeLeft > 0 && !examSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !examSubmitted) {
      handleSubmitExam();
    }
  }, [timeLeft, examSubmitted]);

  useEffect(() => {
    if (examMeta?.startTime) {
      const now = new Date();
      const start = new Date(examMeta.startTime);
      if (now < start) {
        alert("This exam is not yet available. Please check back later.");
        navigate(`/student/course/${courseId}`);
      }
    }
  }, [examMeta, courseId, navigate]);

  // Check if there are enough questions
  useEffect(() => {
    if (questions.length === 0) {
      alert('No questions available for this chapter. Please contact your instructor.');
      navigate(`/student/course/${courseId}`);
    }
  }, [questions, courseId, navigate]);

  if (!course || !chapter || questions.length === 0) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">
            {!course ? 'Course not found' :
              !chapter ? 'Chapter not found' :
                'No questions available for this chapter'}
          </h2>
          <button
            onClick={() => navigate(`/student/course/${courseId}`)}
            className="text-blue-600 hover:text-blue-800 mt-4 inline-block"
          >
            ← Back to Course
          </button>
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
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleSubmitQuestion = (questionId) => {
    setSubmittedQuestions(prev => ({
      ...prev,
      [questionId]: true
    }));
    setShowFeedback(true);

    // ⏳ After 5 seconds, auto-go to next or submit exam
    setTimeout(() => {
      setShowFeedback(false); // hide feedback box

      if (currentQuestion === questions.length - 1) {
        handleSubmitExam(); // last question → submit exam
      } else {
        handleNextQuestion(); // go to next question
      }
    }, 3500);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowFeedback(false);
    }
  };

 

  const handleSubmitExam = (e) => {
    e.preventDefault(); // ✅ Prevent default form behavior

    if (isSubmitting) return;       // ⛔ Prevent multiple submissions
    setIsSubmitting(true);          // 🔐 Lock the submission

    // Count correctly answered questions
    const count = questions.reduce((sum, q) =>
      answers[q.id] === q.correctAnswer ? sum + 1 : sum
      , 0);

    // Calculate percentage
    const finalScore = Math.round((count / questions.length) * 100);

    // Save to localStorage
    const key = `progress_${user.id}_${course.id}`;
    const savedProgress = JSON.parse(localStorage.getItem(key)) || {};
    savedProgress[chapter.id] = finalScore;
    localStorage.setItem(key, JSON.stringify(savedProgress));

    // Update state
    setCorrectCount(count);
    setScore(finalScore);
    setExamSubmitted(true);
    setShowResults(true);

    // Submit to backend
    if (user) {

      console.log("📤 Submitting to backend with payload:", {
        user_id: user.id,
        user_name: user.name || "Unnamed",
        course_id: course.id,
        course_title: course.title,
        chapter_id: chapter.id,
        chapter_title: chapter.title,
        score: finalScore,
        timestamp: new Date().toISOString()
      });

      submitExamResult({
        user_id: user.id,
        user_name: user.name || "Unnamed",
        course_id: course.id,
        course_title: course.title,
        chapter_id: chapter.id,
        chapter_title: chapter.title,
        score: finalScore,
        timestamp: new Date().toISOString()
      })
        .then(() => {
          window.dispatchEvent(new Event("submissions-updated"));
        })
        .catch(err => {
          console.error("❌ Error submitting exam:", err);
        })
        .finally(() => {
          setIsSubmitting(false); // 🔓 Unlock after request finishes 
        });
    } else {
      setIsSubmitting(false); // 🔓 Unlock if user is not available
    }
  };

  const getSubmittedCount = () => {
    return Object.keys(submittedQuestions).length;
  };

  const currentQuestionData = questions[currentQuestion];
  const isAnswered = answers[currentQuestionData?.id] !== undefined;
  const isSubmitted = submittedQuestions[currentQuestionData?.id] === true;
  const userAnswer = answers[currentQuestionData?.id];
  const correctAnswer = currentQuestionData?.correctAnswer;

  if (showResults) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-blue-100">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Exam Completed
            </h1>

            <p className="text-gray-600 mb-6">
              You have completed the chapter exam.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{score}%</div>
                  <div className="text-sm text-gray-600">Your Score</div>
                </div>

                <div>

                  <div className="text-2xl font-bold text-gray-900">70%</div>
                  <div className="text-sm text-gray-600">Passing Score</div>
                </div>

                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {correctCount}/{questions.length}
                  </div>
                  <div className="text-sm text-gray-600">Correct Answers</div>
                </div>
              </div>
            </div>


            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-6 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Retake Chapter Exam
              </button>

              <button
                onClick={() => navigate(`/student/exams`)}
                className="w-full py-3 px-6 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Back to Exams
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

  const maxButtons = 10;

  const getVisibleButtons = () => {
    const total = questions.length;
    const start = Math.floor(currentQuestion / maxButtons) * maxButtons;
    const end = Math.min(start + maxButtons, total);
    return Array.from({ length: end - start }, (_, i) => start + i);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{chapter.id}{"-"}{chapter.title} - Exam</h1>
              <p className="text-gray-600">{course.title}</p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <FileText className="h-4 w-4 mr-1" />
                <span>{questions.length} Questions</span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{getSubmittedCount()}/{questions.length}</div>
                <div className="text-sm text-gray-600">Submitted</div>
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
              <FileText className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800 text-sm">Less than 5 minutes remaining!</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {currentQuestionData?.question}
              </h2>
              {currentQuestionData?.difficulty && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${currentQuestionData.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  currentQuestionData.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                  {currentQuestionData.difficulty}
                </span>
              )}
            </div>

            <div className="space-y-3">
              {currentQuestionData?.options.map((option, index) => {
                let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ";

                if (isSubmitted) {
                  if (index === correctAnswer) {
                    buttonClass += "border-green-500 bg-green-50 text-green-800";
                  } else if (index === userAnswer && index !== correctAnswer) {
                    buttonClass += "border-red-500 bg-red-50 text-red-800";
                  } else {
                    buttonClass += "border-gray-200 bg-gray-50 text-gray-600";
                  }
                } else if (isAnswered && userAnswer === index) {
                  buttonClass += "border-blue-500 bg-blue-50 text-blue-800";
                } else {
                  buttonClass += "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700";
                }

                return (
                  <button
                    key={index}
                    onClick={() => !isSubmitted && handleAnswerSelect(currentQuestionData.id, index)}
                    disabled={isSubmitted}
                    className={buttonClass}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${isSubmitted && index === correctAnswer
                        ? 'border-green-500 bg-green-500'
                        : isSubmitted && index === userAnswer && index !== correctAnswer
                          ? 'border-red-500 bg-red-500'
                          : isAnswered && userAnswer === index
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                        {((isSubmitted && index === correctAnswer) ||
                          (isAnswered && userAnswer === index)) && (
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
            {showFeedback && isSubmitted && (
              // <div className={`mt-4 p-4 rounded-lg border ${userAnswer === correctAnswer
              //   ? 'bg-green-50 border-green-200'
              //   : 'bg-red-50 border-red-200'
              //   }`}>
              //   <div className="flex items-center">
              //     {userAnswer === correctAnswer ? (
              //       <FileText className="h-5 w-5 text-green-600 mr-2" />
              //     ) : (
              //       <FileText className="h-5 w-5 text-red-600 mr-2" />
              //     )}
              //     <span className={`font-medium ${userAnswer === correctAnswer ? 'text-green-800' : 'text-red-800'
              //       }`}>
              //       {userAnswer === correctAnswer ? 'Correct!' : 'Incorrect'}
              //     </span>
              //   </div>
              //   {currentQuestionData?.explanation && (
              //     <p className={`mt-2 text-sm ${userAnswer === correctAnswer ? 'text-green-700' : 'text-red-700'
              //       }`}>
              //       {currentQuestionData.explanation}
              //     </p>
              //   )}
              // </div>

              <div className={`mt-4 p-4 rounded-lg border ${userAnswer === correctAnswer
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
                }`}>
                <div className="flex items-center">
                  {userAnswer === correctAnswer ? (
                    <FileText className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <FileText className="h-5 w-5 text-red-600 mr-2" />
                  )}
                  <span className={`font-medium ${userAnswer === correctAnswer ? 'text-green-800' : 'text-red-800'
                    }`}>
                    {userAnswer === correctAnswer ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                {currentQuestionData?.explanation && (
                  <p className={`mt-2 text-sm ${userAnswer === correctAnswer ? 'text-green-700' : 'text-red-700'
                    }`}>
                    {currentQuestionData.explanation}
                  </p>
                )}
              </div>


            )}
          </div>

          {/* Question Action Buttons */}
          <div className="flex justify-between mt-6">
            <div>
              {!isSubmitted && (
                <button
                  onClick={() => handleSubmitQuestion(currentQuestionData.id)}
                  disabled={!isAnswered}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Answer
                </button>
              )}
            </div>

            {isSubmitted && currentQuestion === questions.length - 1 && (
              <button
                onClick={handleSubmitExam}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Finish Exam</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {/* {isSubmitted && (
              <button
                onClick={() => {
                  if (currentQuestion === questions.length - 1) {
                    handleSubmitExam();
                  } else {
                    handleNextQuestion();
                  }
                }}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >

                {currentQuestion === questions.length - 1 ? (
                  <>
                    <span>Finish Exam</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                   
                  </>
                )}
              </button>
            )} */}
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
                }
              }}
              disabled={currentQuestion === 0}
              className="flex items-center space-x-2 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-2 overflow-x-auto max-w-full no-scrollbar">
              {getVisibleButtons().map(index => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentQuestion(index);
                    setShowFeedback(false);
                  }}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${index === currentQuestion
                    ? 'bg-blue-600 text-white'
                    : submittedQuestions[questions[index].id]
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : answers[questions[index].id] !== undefined
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                >
                  {index + 1}
                </button>
              ))}

              {/* Show dots if more questions exist beyond current group */}
              {currentQuestion + maxButtons < questions.length && (
                <span className="text-gray-500 px-2">...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentChapterExam;