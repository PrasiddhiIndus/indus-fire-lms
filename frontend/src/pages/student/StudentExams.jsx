
import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Link } from 'react-router-dom';
import { FileText, Clock, Play, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

const StudentExams = () => {
  const { user } = useAuth();
  const { courses, studentProgress } = useData();
  const [expandedCourse, setExpandedCourse] = useState(null);

  // Get enrolled courses
  const enrolledCourses = courses.filter(course =>
    user && course.id && user.enrolledCourses?.includes(course.id)
  );

  const userProgress = studentProgress[user?.id] || {};

  const getChapterExamStatus = (course, chapter) => {
    const courseProgress = userProgress[course.id];
    const examScore = courseProgress?.chapterExamScores?.[chapter.id];

    if (examScore !== null && examScore !== undefined) {
      return {
        status: 'taken',
        message: `Score: ${examScore}%`,
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        canTake: true
      };
    }

    return {
      status: 'available',
      // message: 'Not Taken',
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      canTake: true
    };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return <Play className="h-4 w-4 text-blue-600" />;
      case 'taken': return <FileText className="h-4 w-4 text-purple-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCourseStats = (course) => {
    const chapters = course.chapters || [];
    return { totalChapters: chapters.length };
  };

  // Load progress from localStorage on component mount
  useEffect(() => {
    if (user) {
      const key = `progress_${user.id}`;
      const savedProgress = JSON.parse(localStorage.getItem(key)) || {};
      console.log("Loaded progress from localStorage:", savedProgress);
    }
  }, [user]);

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 rounded-3xl border border-white/60 shadow-xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-blue-200/20 via-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-emerald-200/20 to-teal-200/20 rounded-full blur-2xl"></div>

          <div className="relative p-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  Chapter Exams
                </h1>
                <p className="text-lg text-gray-600 mt-1">Take chapter exams to progress through your courses</p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Exams */}
        {enrolledCourses.length > 0 ? (
          <div className="space-y-6">
            {enrolledCourses.map((course) => {
              const stats = getCourseStats(course);
              const isExpanded = expandedCourse === course.id;
              const chapters = course.chapters || [];

              return (
                <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
                  {/* Course Header */}
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/30"
                    onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={course.image}
                          alt={course.title}

                          className="h-16 w-16 rounded-xl object-cover shadow-lg"
                        />
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{course.title}</h2>
                          <p className="text-gray-600">By {course.instructor}</p>
                          <div className="flex items-center text-gray-600 mt-2 text-sm">
                            <FileText className="h-4 w-4 mr-1" />
                            <span className="font-medium">{stats.totalChapters} chapters</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Chapter Exams */}
                  {isExpanded && (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {chapters.map((chapter, index) => {
                          const examStatus = getChapterExamStatus(course, chapter);

                          return (
                            <div key={chapter.id} className="relative overflow-hidden bg-gray-50 rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-blue-500 text-white">
                                      {index + 1}
                                    </div>
                                    <h3 className="font-semibold text-gray-900">{chapter.title}</h3>
                                  </div>

                                  <div className="flex items-center text-sm text-gray-600 mb-2">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>{chapter.duration}</span>
                                  </div>

                                  <div className={` ${examStatus.color}`}>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-3 border-t border-gray-200">
                                {examStatus.canTake && (
                                  <Link
                                    to={`/student/chapter-exam/${course.id}/${chapter.id}`}
                                    className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${examStatus.status === 'taken'
                                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                      }`}
                                  >
                                    <Play className="h-3 w-3 mr-1" />
                                    {examStatus.status === 'taken' ? 'Retake Exam' : 'Take Exam'}
                                  </Link>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 rounded-3xl border border-white/60 shadow-xl p-12 text-center">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-200/20 to-teal-200/20 rounded-full blur-2xl"></div>

            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Enrolled Courses</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Enroll in courses to access chapter exams and start your learning journey
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

        {/* Quick Stats Summary */}
        {enrolledCourses.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/20 rounded-full blur-2xl"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">
                      {enrolledCourses.reduce((acc, course) => acc + getCourseStats(course).totalChapters, 0)}
                    </div>
                    <div className="text-blue-700 text-sm font-medium">Total Chapters</div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentExams;