import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Clock, Users, Star, CheckCircle, Play, Award, Grid, List, TrendingUp, Target, Sparkles, Trophy, Flame, CloudCog } from 'lucide-react';

const StudentCourses = () => {
  const { user } = useAuth();
  const { courses, enrollStudent, studentProgress } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('title');

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = !filterLevel || course.level === filterLevel;
    return matchesSearch && matchesLevel;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'level':
        const levelOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
        return levelOrder[a.level] - levelOrder[b.level];
      case 'students':
        return b.enrolledStudents - a.enrolledStudents;
      case 'duration':
        return a.duration.localeCompare(b.duration);
      case 'title':
      default:
        return a.title.localeCompare(b.title);
    }
  });

  const userProgress = studentProgress[user?.id] || {};

  const handleEnroll = (courseId) => {
    if (user) {
      const success = enrollStudent(user.id, courseId);
      if (success) {
        alert('Successfully enrolled in course!');
      } else {
        alert('You are already enrolled in this course.');
      }
    }
  };

  const isEnrolled = (courseId) => {
    return user?.enrolledCourses?.includes(courseId);

  };

  const getCourseProgress = (course) => {
    const progress = userProgress[course.id];
    const chapterExamScores = progress?.chapterExamScores || {};
    const totalChapters = course.chapters?.length || 0;

    if (totalChapters === 0) return 0;

    const passedChapters = Object.values(chapterExamScores).filter(score => score >= 70).length;
    return (passedChapters / totalChapters) * 100;
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Intermediate': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const enrolledCourses = filteredCourses.filter(course => isEnrolled(course.id));
  const availableCourses = filteredCourses.filter(course => !isEnrolled(course.id));

  // Calculate real stats
  const totalEnrolledCourses = enrolledCourses.length;
  const completedCourses = enrolledCourses.filter(course => {
    const progress = userProgress[course.id];
    return progress?.certificateEarned;
  }).length;
  const averageProgress = totalEnrolledCourses > 0
    ? Math.round(enrolledCourses.reduce((acc, course) => acc + getCourseProgress(course), 0) / totalEnrolledCourses)
    : 0;

  const CourseCard = ({ course, isEnrolled }) => {
    const courseProgress = getCourseProgress(course);
    const progress = userProgress[course.id];

    return (
      <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="relative">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {isEnrolled && (
            <div className="absolute top-4 right-4">
              {progress?.certificateEarned ? (
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1 shadow-lg">
                  <Trophy className="h-3 w-3" />
                  <span>Completed</span>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                  Enrolled
                </div>
              )}
            </div>
          )}

          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1.5 rounded-full border text-xs font-semibold shadow-lg backdrop-blur-sm ${getLevelColor(course.level)}`}>
              {course.level}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-bold text-lg mb-2 group-hover:text-blue-200 transition-colors line-clamp-2">
              {course.title}
            </h3>
            <div className="flex items-center text-white/90 text-sm">
              <span>By {course.instructor}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{course.enrolledStudents}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center text-amber-500">
                <Star className="h-4 w-4 fill-current mr-1" />
                <span className="text-gray-600">4.8</span>
              </div>
            </div>
          </div>

          {isEnrolled && (
            <div className="mb-4">
              {/* <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span className="font-medium">Progress</span>
                <span className="font-semibold">{Math.round(courseProgress)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500 relative overflow-hidden"
                  style={{ width: `${courseProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div> */}
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            {isEnrolled ? (
              <Link
                to={`/student/course/${course.id}`}
                className="group w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center font-medium shadow-md"
              >
                <Play className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                {progress?.certificateEarned ? 'View Certificate' : 'Continue Learning'}
              </Link>
            ) : (
              <button
                onClick={() => handleEnroll(course.id)}
                className="group w-full bg-white border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center justify-center font-medium"
              >
                <BookOpen className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Enroll Now
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CourseListItem = ({ course, isEnrolled }) => {
    const courseProgress = getCourseProgress(course);
    const progress = userProgress[course.id];

    return (
      <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="p-6">
          <div className="flex items-start space-x-6">
            <img
              src={course.image}
              alt={course.title}
              className="w-24 h-24 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                <div className="flex items-center space-x-2 ml-4">
                  <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                  {isEnrolled && progress?.certificateEarned && (
                    <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                      <Trophy className="h-3 w-3" />
                      <span>Completed</span>
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="font-medium">By {course.instructor}</span>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{course.enrolledStudents}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center text-amber-500">
                    <Star className="h-4 w-4 fill-current mr-1" />
                    <span className="text-gray-600">4.8</span>
                  </div>
                </div>
              </div>

              {isEnrolled && (
                <div className="mb-4">
                  {/* <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span className="font-medium">Progress</span>
                    <span className="font-semibold">{Math.round(courseProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${courseProgress}%` }}
                    />
                  </div> */}
                </div>
              )}
            </div>

            <div className="flex-shrink-0">
              {isEnrolled ? (
                <Link
                  to={`/student/course/${course.id}`}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center font-medium shadow-md"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {progress?.certificateEarned ? 'Certificate' : 'Continue'}
                </Link>
              ) : (
                <button
                  onClick={() => handleEnroll(course.id)}
                  className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center font-medium"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Enroll
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
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
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  My Learning Journey
                </h1>
                <p className="text-lg text-gray-600 mt-1">Discover new skills and advance your career</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, instructors, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                />
              </div>

              <div className="flex items-center space-x-4">
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                >
                  <option value="">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                >
                  <option value="title">Sort by Title</option>
                  <option value="level">Sort by Level</option>
                  <option value="students">Sort by Popularity</option>
                  <option value="duration">Sort by Duration</option>
                </select>

                <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Stats
        {enrolledCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-200/20 rounded-full blur-2xl"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-emerald-600">{totalEnrolledCourses}</div>
                    <div className="text-emerald-700 text-sm font-medium">Enrolled Courses</div>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-100 shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-200/20 rounded-full blur-2xl"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-violet-600">{completedCourses}</div>
                    <div className="text-violet-700 text-sm font-medium">Completed</div>
                  </div>
                  <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-violet-600" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/20 rounded-full blur-2xl"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">{averageProgress}%</div>
                    <div className="text-blue-700 text-sm font-medium">Avg Progress</div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )} */}

        {/* Enrolled Courses */}
        {enrolledCourses.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Enrolled Courses</h2>
                <p className="text-gray-600 mt-1">Continue your learning journey</p>
              </div>
              <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold border border-blue-200">
                {enrolledCourses.length} courses
              </span>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {enrolledCourses.map((course) => (
                  <CourseCard key={course.id} course={course} isEnrolled={true} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {enrolledCourses.map((course) => (
                  <CourseListItem key={course.id} course={course} isEnrolled={true} />
                ))}
              </div>
            )}
          </div>
        )}


        {/* Available Courses */}
        {availableCourses.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {enrolledCourses.length > 0 ? 'Discover More Courses' : 'Available Courses'}
                </h2>
                <p className="text-gray-600 mt-1">Expand your knowledge with new courses</p>
              </div>
              <span className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold border border-emerald-200">
                {availableCourses.length} available
              </span>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCourses.map((course) => (
                  <CourseCard key={course.id} course={course} isEnrolled={false} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {availableCourses.map((course) => (
                  <CourseListItem key={course.id} course={course} isEnrolled={false} />
                ))}
              </div>
            )}
          </div>
        )}

        {filteredCourses.length === 0 && (
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 rounded-3xl border border-white/60 shadow-xl p-12 text-center">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-200/20 to-teal-200/20 rounded-full blur-2xl"></div>

            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No courses found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterLevel('');
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg font-semibold"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentCourses;