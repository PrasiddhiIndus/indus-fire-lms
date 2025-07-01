import React from 'react';
import Layout from '../../components/Layout';
import { useData } from '../../contexts/DataContext';
import { Users, BookOpen, FileText, TrendingUp, Award, Clock, Star, ArrowUp, ArrowDown, Activity, Target, Zap, Trophy } from 'lucide-react';

const AdminDashboard = () => {
  const { courses, users, exams } = useData();
  
  const totalStudents = users.filter(user => user.role === 'student').length;
  const totalEnrollments = users.reduce((acc, user) => acc + user.enrolledCourses.length, 0);
  const avgEnrollmentPerCourse = courses.length > 0 ? (totalEnrollments / courses.length).toFixed(1) : 0;
  const completionRate = 85; // Mock data

  const stats = [
    {
      title: 'Total Students',
      value: totalStudents,
      icon: Users,
      gradient: 'from-emerald-400 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      trend: '+12%',
      trendUp: true,
      description: 'Active learners'
    },
    {
      title: 'Active Courses',
      value: courses.length,
      icon: BookOpen,
      gradient: 'from-blue-400 to-indigo-500',
      bgGradient: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      trend: '+5%',
      trendUp: true,
      description: 'Published courses'
    },
    {
      title: 'Total Exams',
      value: exams.length,
      icon: FileText,
      gradient: 'from-violet-400 to-purple-500',
      bgGradient: 'from-violet-50 to-purple-50',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      trend: '+8%',
      trendUp: true,
      description: 'Assessment created'
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      icon: Target,
      gradient: 'from-amber-400 to-orange-500',
      bgGradient: 'from-amber-50 to-orange-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      trend: '+15%',
      trendUp: true,
      description: 'Course completion'
    }
  ];

  const recentActivity = [
    { 
      action: 'New student enrolled in React Course', 
      time: '2 hours ago', 
      type: 'enrollment',
      icon: Users,
      color: 'text-emerald-600 bg-emerald-50'
    },
    { 
      action: 'JavaScript exam completed by John Doe', 
      time: '4 hours ago', 
      type: 'exam',
      icon: FileText,
      color: 'text-violet-600 bg-violet-50'
    },
    { 
      action: 'New course "UI/UX Design" created', 
      time: '1 day ago', 
      type: 'course',
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-50'
    },
    { 
      action: 'Student Jane Smith earned certificate', 
      time: '2 days ago', 
      type: 'certificate',
      icon: Award,
      color: 'text-amber-600 bg-amber-50'
    }
  ];

  const topCourses = courses
    .sort((a, b) => b.enrolledStudents - a.enrolledStudents)
    .slice(0, 3);

  const quickActions = [
    {
      title: 'Create Course',
      description: 'Add a new course to the platform',
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-600',
      href: '/admin/courses'
    },
    {
      title: 'Add Questions',
      description: 'Build your question bank',
      icon: FileText,
      color: 'from-violet-500 to-purple-600',
      href: '/admin/questions'
    },
    {
      title: 'Manage Users',
      description: 'Add or edit user accounts',
      icon: Users,
      color: 'from-emerald-500 to-teal-600',
      href: '/admin/users'
    }
  ];

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 rounded-3xl border border-white/60 shadow-xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-blue-200/20 via-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-emerald-200/20 to-teal-200/20 rounded-full blur-2xl"></div>
          
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden bg-white">
                    <img 
                      src="/indus_fire_safety_private_limited_logo (2).jpeg" 
                      alt="Indus Fire Safety Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                      Admin Dashboard
                    </h1>
                    <p className="text-lg text-gray-600 mt-1">Welcome back! Here's what's happening with your platform.</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/40">
                <Activity className="h-4 w-4" />
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`}></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                    </div>
                    <div className={`flex items-center space-x-1 text-sm font-semibold ${
                      stat.trendUp ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {stat.trendUp ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                      <span>{stat.trend}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                      {stat.title}
                    </h3>
                    <p className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-500">{stat.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-lg">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                    <p className="text-gray-600 text-sm mt-1">Latest platform updates</p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/40">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Live updates</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={index} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group">
                        <div className={`p-2 rounded-lg ${activity.color} group-hover:scale-110 transition-transform duration-200`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {activity.action}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Top Courses & Quick Actions */}
          <div className="space-y-6">
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-lg">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-amber-50/30">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  <h2 className="text-xl font-semibold text-gray-900">Top Courses</h2>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {topCourses.map((course, index) => (
                    <div key={course.id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                      <div className="relative">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="h-12 w-12 rounded-lg object-cover group-hover:scale-110 transition-transform duration-200"
                        />
                        <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {course.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center text-xs text-gray-500">
                            <Users className="h-3 w-3 mr-1" />
                            {course.enrolledStudents} students
                          </div>
                          <div className="flex items-center text-xs text-amber-500">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="ml-1 text-gray-600">4.8</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-lg">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-emerald-50/30">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <a
                        key={index}
                        href={action.href}
                        className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div className={`w-10 h-10 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {action.title}
                          </p>
                          <p className="text-xs text-gray-500">{action.description}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;