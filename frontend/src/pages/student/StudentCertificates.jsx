import React from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Award, Download, Calendar, CheckCircle, BookOpen, Sparkles, Trophy, Star, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentCertificates = () => {
  const { user } = useAuth();
  const { courses, studentProgress } = useData();

  const userProgress = studentProgress[user?.id] || {};

  // Get completed courses with certificates
  const completedCourses = courses.filter(course => {
    const progress = userProgress[course.id];
    return progress?.certificateEarned;
  });

  // Calculate real achievement stats
  const totalCertificates = completedCourses.length;
  const averageScore = completedCourses.length > 0 
    ? Math.round(completedCourses.reduce((acc, course) => {
        const progress = userProgress[course.id];
        const chapterExamScores = progress?.chapterExamScores || {};
        const scores = Object.values(chapterExamScores).filter(score => score >= 70);
        const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        return acc + avgScore;
      }, 0) / completedCourses.length)
    : 0;
  
  const advancedCourses = completedCourses.filter(course => course.level === 'Advanced').length;
  const excellenceAwards = completedCourses.filter(course => {
    const progress = userProgress[course.id];
    const chapterExamScores = progress?.chapterExamScores || {};
    const scores = Object.values(chapterExamScores);
    return scores.length > 0 && scores.every(score => score >= 90);
  }).length;

  const downloadCertificate = (course) => {
    const progress = userProgress[course.id];
    const chapterExamScores = progress?.chapterExamScores || {};
    const scores = Object.values(chapterExamScores).filter(score => score >= 70);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    
    // In a real app, this would generate and download a PDF certificate
    const certificateData = {
      studentName: user?.name,
      courseName: course.title,
      instructor: course.instructor,
      completionDate: new Date().toLocaleDateString(),
      score: avgScore
    };

    // Create a simple text certificate for demo
    const certificateText = `
CERTIFICATE OF COMPLETION

This is to certify that

${certificateData.studentName}

has successfully completed the course

${certificateData.courseName}

Instructor: ${certificateData.instructor}
Average Score: ${certificateData.score}%
Date: ${certificateData.completionDate}

Indus India Fire Safety Learning Management System
    `;

    const blob = new Blob([certificateText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${course.title.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 rounded-3xl border border-white/60 shadow-xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-blue-200/20 via-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-emerald-200/20 to-teal-200/20 rounded-full blur-2xl"></div>
          
          <div className="relative p-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-teal-800 bg-clip-text text-transparent">
                  My Certificates
                </h1>
                <p className="text-lg text-gray-600 mt-1">Download and manage your course completion certificates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificates Grid */}
        {completedCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedCourses.map((course) => {
              const progress = userProgress[course.id];
              const chapterExamScores = progress?.chapterExamScores || {};
              const scores = Object.values(chapterExamScores).filter(score => score >= 70);
              const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
              
              return (
                <div key={course.id} className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="relative">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1 shadow-lg">
                        <Trophy className="h-3 w-3" />
                        <span>Certified</span>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg mb-1 group-hover:text-emerald-200 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-white/90 text-sm">By {course.instructor}</p>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">Average Score:</span>
                        <span className="font-bold text-emerald-600 text-lg">{avgScore}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">Completed:</span>
                        <span className="text-gray-900 font-medium">
                          {new Date().toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">Level:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          course.level === 'Beginner' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                          course.level === 'Intermediate' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {course.level}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">Chapters:</span>
                        <span className="text-gray-900 font-medium">{course.chapters?.length || 0} completed</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => downloadCertificate(course)}
                        className="group w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-4 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 flex items-center justify-center font-medium shadow-md"
                      >
                        <Download className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                        Download Certificate
                      </button>
                      
                      <Link
                        to={`/student/course/${course.id}`}
                        className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 flex items-center justify-center font-medium"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Course
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 rounded-3xl border border-white/60 shadow-xl p-12 text-center">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-200/20 to-teal-200/20 rounded-full blur-2xl"></div>
            
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Certificates Yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Complete courses and pass all chapter exams to earn certificates
              </p>
              <Link
                to="/student/courses"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg font-semibold"
              >
                <BookOpen className="h-5 w-5" />
                <span>Browse Courses</span>
              </Link>
            </div>
          </div>
        )}

        {/* Achievement Summary */}
        {completedCourses.length > 0 && (
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 rounded-3xl border border-emerald-100 shadow-xl">
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-emerald-200/20 via-teal-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-blue-200/20 to-indigo-200/20 rounded-full blur-2xl"></div>
            
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Achievement Summary</h2>
                  <p className="text-gray-600">Your learning accomplishments</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {totalCertificates}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Certificates Earned</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/40 shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-600">{averageScore}%</div>
                  <div className="text-sm text-gray-600 font-medium">Average Score</div>
                </div>
                
                <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/40 shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-violet-600">{advancedCourses}</div>
                  <div className="text-sm text-gray-600 font-medium">Advanced Courses</div>
                </div>
                
                <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/40 shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-amber-600">{excellenceAwards}</div>
                  <div className="text-sm text-gray-600 font-medium">Excellence Awards (90%+)</div>
                </div>
                
                <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/40 shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {completedCourses.reduce((acc, course) => acc + (course.chapters?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Chapters Completed</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentCertificates;