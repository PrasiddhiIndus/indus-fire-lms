import React from 'react';
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { fetchExamResults, processDashboardData } from '../../utils/sheetData'; // 👈 Import helpers
import { Link } from 'react-router-dom';
import {
  BookOpen, Clock, Award, TrendingUp, Play, CheckCircle, Zap, Star, ArrowRight, Users, Trophy, Flame
} from 'lucide-react';
import { PieChart, Pie, Tooltip, LineChart, Line, XAxis, YAxis, BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

import profile from "../../assets/image/profile.jpg";
import {
  fetchPieChartData,
  fetchLineChartData,
  fetchCalendarData,
  fetchBarChartData
} from "../../services/api";


// 🔑 Get logged-in user ID from localStorage
const user = JSON.parse(localStorage.getItem("user"));
const userId = user?.id;

const GRADIENT_COLORS = {
  passed: ['#10b981', '#34d399'],
  failed: ['#f87171', '#ef4444'],
  completed: ['#4ade80', '#22c55e'],
  remaining: ['#e5e7eb', '#d1d5db']
};

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#111827" textAnchor="middle" dominantBaseline="central" fontSize={12}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomBar = (props) => {
  const { fill, x, y, width, height, dataKey } = props;
  const gradientId = `barGradient_${dataKey}`;
  const colors = dataKey === 'completed' ? GRADIENT_COLORS.completed : GRADIENT_COLORS.remaining;

  return (
    <g>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="100%" stopColor={colors[1]} />
        </linearGradient>
      </defs>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={`url(#${gradientId})`}
        rx="4"
        ry="4"
      />
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
        <p className="font-bold text-gray-900">{label}</p>
        <p className="text-sm">
          <span className="text-emerald-600">{payload[0].value} passed</span>
        </p>
        <p className="text-sm">
          <span className="text-gray-400">{payload[1]?.value || 0} remaining</span>
        </p>
      </div>
    );
  }
  return null;
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const { courses, studentProgress } = useData();

  const [pieData, setPieData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [calendarData, setCalenderData] = useState([]);
  const [barData, setBarData] = useState([]);



  const enrolledCourses = courses.filter(course =>
    user && course.id && user.enrolledCourses?.includes(course.id)
  );

  const userProgress = studentProgress[user?.id] || {};

  // Calculate real completion data
  const completedCourses = enrolledCourses.filter(course => {
    const progress = userProgress[course.id];
    return progress?.certificateEarned;
  }).length;

  const inProgressCourses = enrolledCourses.filter(course => {
    const progress = userProgress[course.id];
    const hasProgress = progress && (progress.completedChapters?.length > 0 || progress.chapterExamScores);
    return hasProgress && !progress.certificateEarned;
  }).length;

  // Calculate real chapter progress
  const totalChapters = enrolledCourses.reduce((acc, course) => acc + (course.chapters?.length || 0), 0);
  const completedChapters = enrolledCourses.reduce((acc, course) => {
    const progress = userProgress[course.id];
    const chapterExamScores = progress?.chapterExamScores || {};
    const passedChapters = Object.values(chapterExamScores).filter(score => score >= 70).length;
    return acc + passedChapters;
  }, 0);

  const progressPercentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  // Calculate available chapter exams (only first exam or unlocked ones)
  const availableChapterExams = enrolledCourses.reduce((acc, course) => {
    const chapters = course.chapters || [];
    const courseProgress = userProgress[course.id];
    const chapterExamScores = courseProgress?.chapterExamScores || {};

    const availableCount = chapters.filter(chapter => {
      // First chapter is always available
      if (chapter.order === 1) {
        const currentScore = chapterExamScores[chapter.id];
        return currentScore === undefined || currentScore < 70;
      }

      // For other chapters, check if previous chapter was passed
      const previousChapter = chapters.find(c => c.order === chapter.order - 1);
      if (!previousChapter) return false;

      const previousScore = chapterExamScores[previousChapter.id];
      const isUnlocked = previousScore >= 70;

      // Available if unlocked and not yet passed
      const currentScore = chapterExamScores[chapter.id];
      return isUnlocked && (currentScore === undefined || currentScore < 70);
    }).length;

    return acc + availableCount;
  }, 0);

  // Calculate learning streak (mock for now, but could be real based on login dates)
  const learningStreak = enrolledCourses.length > 0 ? Math.min(enrolledCourses.length * 2, 15) : 0;


  const donutStats = [
    {
      title: 'Total Students',
      value: 30,
      description: 'Registered learners',
      colorFrom: '#06b6d4', // cyan-400
      colorTo: '#3b82f6',   // blue-500
    },
    {
      title: 'Total Courses',
      value: 4,
      description: 'Available paths',
      colorFrom: '#10b981', // emerald-400
      colorTo: '#14b8a6',   // teal-500
    },
    {
      title: 'Total Exams',
      value: 33,
      description: 'Core modules',
      colorFrom: '#facc15', // yellow-400
      colorTo: '#f97316',   // orange-500
    },
    {
      title: 'Study Materials',
      value: 1,
      description: 'Reference docs',
      colorFrom: '#a855f7', // purple-400
      colorTo: '#ec4899',   // pink-500
    }
  ];
  const maxValue = Math.max(...donutStats.map(stat => stat.value));


  const examOverview = pieData;
  const scoreTrends = lineData;
  const chapterCompletion = barData;




   
  const courseCards = [
    {
      id: 1,
      title: 'Fire Basics',
      instructor: 'Mr. A. Kumar',
      image: 'https://via.placeholder.com/400x200?text=Fire+Basics'
    },
    {
      id: 2,
      title: 'Hazmat Awareness',
      instructor: 'Ms. R. Sharma',
      image: 'https://via.placeholder.com/400x200?text=Hazmat'
    },
    {
      id: 3,
      title: 'Rescue Operations',
      instructor: 'Capt. V. Patel',
      image: 'https://via.placeholder.com/400x200?text=Rescue+Ops'
    },
    {
      id: 4,
      title: 'Evacuation Drills',
      instructor: 'Dr. L. Sen',
      image: 'https://via.placeholder.com/400x200?text=Evacuation'
    }
  ];


  const getNextChapter = (course) => {
    const progress = userProgress[course.id];
    const chapterExamScores = progress?.chapterExamScores || {};

    // Find the first chapter that hasn't been passed yet
    return course.chapters?.find(chapter => {
      const score = chapterExamScores[chapter.id];
      return score === undefined || score < 70;
    });
  };

  const getCourseProgress = (course) => {
    const progress = userProgress[course.id];
    const chapterExamScores = progress?.chapterExamScores || {};
    const totalChapters = course.chapters?.length || 0;

    if (totalChapters === 0) return 0;

    const passedChapters = Object.values(chapterExamScores).filter(score => score >= 70).length;
    return (passedChapters / totalChapters) * 100;
  };

  // Generate real recent activity based on user progress
  const generateRecentActivity = () => {
    const activities = [];

    enrolledCourses.forEach(course => {
      const progress = userProgress[course.id];
      if (progress?.chapterExamScores) {
        Object.entries(progress.chapterExamScores).forEach(([chapterId, score]) => {
          const chapter = course.chapters?.find(c => c.id === parseInt(chapterId));
          if (chapter && score >= 70) {
            activities.push({
              action: `Passed "${chapter.title}" exam with ${score}%`,
              time: '2 hours ago', // Could be real timestamp
              type: 'exam',
              icon: CheckCircle,
              color: 'text-emerald-600 bg-emerald-50'
            });
          }
        });
      }

      if (progress?.certificateEarned) {
        activities.push({
          action: `Earned certificate for "${course.title}"`,
          time: '1 day ago',
          type: 'certificate',
          icon: Award,
          color: 'text-violet-600 bg-violet-50'
        });
      }
    });

    // Add enrollment activities
    enrolledCourses.slice(0, 2).forEach(course => {
      activities.push({
        action: `Enrolled in "${course.title}"`,
        time: '3 days ago',
        type: 'enrollment',
        icon: BookOpen,
        color: 'text-blue-600 bg-blue-50'
      });
    });

    return activities.slice(0, 4); // Return latest 4 activities
  };

  const recentActivity = generateRecentActivity();


useEffect(() => {
  if (!user?.id) return;

  fetchPieChartData(user.id).then(setPieData);
  fetchLineChartData(user.id).then(setLineData);
  fetchCalendarData(user.id).then(setCalenderData);
  fetchBarChartData(user.id).then(setBarData);
}, [user?.id]);


  return (
    <Layout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Welcome Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 rounded-3xl border border-white/60 shadow-xl backdrop-blur-sm">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-blue-200/20 via-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-emerald-200/20 to-teal-200/20 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-100/10 to-pink-100/10 rounded-full blur-3xl"></div>

          <div className="relative p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                      <Flame className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                      Welcome back, {user?.name}!
                    </h1>
                    <p className="text-lg text-gray-600 mt-2">Ready to continue your learning adventure?</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/40">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-700 font-medium">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  {learningStreak > 0 && (
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 rounded-full border border-amber-200/50">
                      <Flame className="h-4 w-4 text-amber-500" />
                      <span className="text-amber-700 font-medium">{learningStreak}-day learning streak</span>
                    </div>
                  )}
                  {completedCourses > 0 && (
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-violet-50 to-purple-50 px-4 py-2 rounded-full border border-violet-200/50">
                      <Star className="h-4 w-4 text-violet-500" />
                      <span className="text-violet-700 font-medium">Certificate holder</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center lg:text-right">
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl overflow-hidden">
                    <img
                      src={profile}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-3xl"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 4 - section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {donutStats.map((stat, index) => {
            const radius = 36;
            const circumference = 2 * Math.PI * radius;
            const percentage = Math.round((stat.value / maxValue) * 100);
            const offset = circumference - (percentage / 100) * circumference;
            const gradientId = `grad${index}`;

            return (
              <div
                key={index}
                className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative p-6 flex flex-col items-center text-center space-y-4">
                  {/* Donut Chart */}
                  <svg className="w-24 h-24 rotate-[-90deg]" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={stat.colorFrom} />
                        <stop offset="100%" stopColor={stat.colorTo} />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke="#e5e7eb"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke={`url(#${gradientId})`}
                      strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                    />
                    <text
                      x="50"
                      y="54"
                      textAnchor="middle"
                      fill="#111827"
                      fontSize="18"
                      fontWeight="bold"
                      transform="rotate(90, 50, 50)"
                    >
                      {stat.value}
                    </text>
                  </svg>

                  <h3 className="text-lg font-bold text-gray-900">{stat.title}</h3>
                  <p className="text-sm text-gray-500">{stat.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* section of 3 columns  and 2 rows  */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
          <div className="bg-gradient-to-br from-white to-indigo-50 p-6 border border-indigo-100 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-gray-800">Exam Overview</h3>
              <div className="flex items-center space-x-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
                <Award className="h-4 w-4" />
                <span className="text-xs font-medium">Certified</span>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={examOverview}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={CustomPieLabel}
                    dataKey="value"
                    isAnimationActive={false}
                  >
                    {examOverview.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>

                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 mr-2"></div>
                <span className="text-sm text-gray-600">Passed</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-rose-500 to-red-500 mr-2"></div>
                <span className="text-sm text-gray-600">Failed</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-gray-800">Score Trends</h3>
              <div className="flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Progress</span>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreTrends}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="chapter"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    isAnimationActive={false}
                  />
                  <Tooltip
                    content={({ payload, label }) => (
                      <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
                        <p className="font-bold text-gray-900">{payload?.[0]?.payload.course}</p>
                        <p className="text-sm text-gray-700">{label}: {payload?.[0]?.value}%</p>
                      </div>
                    )}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-amber-50 p-6 rounded-2xl border border-amber-100 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-gray-800">Calendar</h3>
              <div className="flex items-center space-x-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">Schedule</span>
              </div>
            </div>

            <Calendar
              className="border-0 font-sans"
              tileClassName={({ date, view }) =>
                view === 'month' && date.toDateString() === new Date().toDateString()
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full'
                  : 'text-gray-700'
              }
              tileContent={({ date, view }) =>
                view === 'month' && date.getDate() === 15 ? (
                  <div className="absolute top-0 right-0 w-1 h-1 bg-red-500 rounded-full"></div>
                ) : null
              }
            />
          </div>

          <div className="bg-gradient-to-br from-white to-teal-50 p-6 rounded-2xl border border-teal-100 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-gray-800">Chapter Completion</h3>
              <div className="flex items-center space-x-2 bg-teal-100 text-teal-800 px-3 py-1 rounded-full">
                <BookOpen className="h-4 w-4" />
                <span className="text-xs font-medium">Progress</span>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chapterCompletion}>
                  <XAxis
                    dataKey="course"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="completed" fill="#10b981" isAnimationActive={false} />
                  <Bar dataKey="remaining" fill="#d1d5db" isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 mr-2"></div>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 mr-2"></div>
                <span className="text-sm text-gray-600">Remaining</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-800 mb-2">My Courses</h3>
            {courseCards.map(course => (
              <div key={course.id} className="bg-white rounded-xl shadow-md p-4 transition-all duration-300 hover:shadow-lg">
        
                <h4 className="font-bold text-gray-800 text-lg">{course.title}</h4>
                <p className="text-sm text-gray-500">Instructor: {course.instructor}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-white to-violet-50 rounded-2xl shadow p-6 space-y-3 border border-violet-100">
            <h3 className="text-lg font-bold text-gray-800">Contact Us</h3>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">+91-XXXXXX1234</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">info@indusfiresafety.com</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">Vadodara, Gujarat</p>
            </div>
          </div>
        </div> */}

        {/* Continue Learning */}
        {/* {enrolledCourses.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Continue Learning</h2>
                <p className="text-gray-600 mt-1">Pick up where you left off</p>
              </div>
              <Link
                to="/student/courses"
                className="group flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span className="font-medium">View All Courses</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledCourses.slice(0, 4).map((course) => {
                const nextChapter = getNextChapter(course);
                const courseProgress = getCourseProgress(course);
                const progress = userProgress[course.id];

                return (
                  <div key={course.id} className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="relative">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                      {progress?.certificateEarned && (
                        <div className="absolute top-4 right-4">
                          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1 shadow-lg">
                            <Trophy className="h-3 w-3" />
                            <span>Completed</span>
                          </div>
                        </div>
                      )}

                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-bold text-xl mb-2 group-hover:text-blue-200 transition-colors">
                          {course.title}
                        </h3>
                        <div className="flex items-center text-white/90 text-sm">
                          <Users className="h-3 w-3 mr-1" />
                          <span>By {course.instructor}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {progress?.certificateEarned ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-emerald-600">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            <span className="text-sm font-semibold">Course Completed</span>
                          </div>
                          <Link
                            to={`/student/course/${course.id}`}
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 text-sm font-medium shadow-md"
                          >
                            View Certificate
                          </Link>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          {nextChapter ? (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium text-gray-900">Next:</span> {nextChapter.title}
                            </div>
                          ) : (
                            <div className="text-sm text-emerald-600 font-semibold">
                              All chapters completed!
                            </div>
                          )}
                          <Link
                            to={`/student/course/${course.id}`}
                            className="group bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 text-sm font-medium shadow-md"
                          >
                            <Play className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                            <span>Continue</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 rounded-3xl border border-white/60 shadow-xl p-12 text-center">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-200/20 to-teal-200/20 rounded-full blur-2xl"></div>

            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Your Learning Journey</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                Discover amazing courses and begin building new skills today. Your future self will thank you!
              </p>
              <Link
                to="/student/courses"
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
              >
                <BookOpen className="h-5 w-5" />
                <span>Browse Courses</span>
              </Link>
            </div>
          </div>
        )} */}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                  <p className="text-gray-600 text-sm mt-1">Your latest learning milestones</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activity.color} group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );

};

export default StudentDashboard;