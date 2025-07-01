import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, BookOpen, Users, FileText, BarChart3, HelpCircle, Layers, FolderOpen, GraduationCap, Award, Sparkles, Flame } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNavItems = [
    { path: '/admin', icon: BarChart3, label: 'Dashboard', description: 'Overview & Analytics' },
    { path: '/admin/users', icon: Users, label: 'Users', description: 'Manage Fire Professionals' },
    { path: '/admin/courses', icon: BookOpen, label: 'Courses', description: 'NFPA Training Programs' },
    { path: '/admin/chapters', icon: Layers, label: 'Chapters', description: 'Content Organization' },
    { path: '/admin/questions', icon: HelpCircle, label: 'Questions', description: 'Assessment Bank' },
    { path: '/admin/exams', icon: FileText, label: 'Exams', description: 'Certification Tests' },
    { path: '/admin/materials', icon: FolderOpen, label: 'Materials', description: 'Fire Safety Resources' },
    { path: '/admin/submissions', icon: FolderOpen, label: 'Exam Detailes', description: 'Lms exam detailes' }

  ];

  const studentNavItems = [
    { path: '/student', icon: BarChart3, label: 'Dashboard', description: 'Learning Progress' },
    { path: '/student/courses', icon: BookOpen, label: 'My Courses', description: 'NFPA Training' },
    { path: '/student/materials', icon: FolderOpen, label: 'Study Materials', description: 'Fire Safety Resources' },
    { path: '/student/exams', icon: FileText, label: 'Exams', description: 'Certification Tests' },
    { path: '/student/certificates', icon: Award, label: 'Certificates', description: 'NFPA Achievements' }
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : studentNavItems;
  

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50">
      {/* Premium Sidebar */}
      <div className="w-72 premium-sidebar flex flex-col relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-orange-600/5 to-yellow-600/5"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/10 to-orange-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-400/10 to-red-400/10 rounded-full blur-2xl"></div>
        
        {/* Header */}
        <div className="relative p-8 border-b border-white/20">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden bg-white">
              <img 
                src="/indus_fire_safety_private_limited_logo (2).jpeg" 
                alt="Indus Fire Safety Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Indus LMS
              </h1>
              <div className="flex items-center space-x-1">
                <Sparkles className="h-3 w-3 text-red-500" />
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {user?.role} Portal
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-2 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`premium-nav-item group ${isActive ? 'active' : ''}`}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`p-2 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-gray-100 text-gray-500 group-hover:bg-red-50 group-hover:text-red-600'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm ${
                      isActive ? 'text-red-700' : 'text-gray-700 group-hover:text-red-700'
                    }`}>
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {item.description}
                    </div>
                  </div>
                </div>
                
                {isActive && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* User Profile Section */}
        <div className="relative p-6 border-t border-white/20 bg-gradient-to-r from-white/50 to-white/30 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 group"
              title="Sign out"
            >
              <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
          <div className="h-full px-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome back, <span className="font-semibold text-gray-900">{user?.name}</span>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50/50 via-red-50/30 to-orange-50/50 relative">
          {/* Background Pattern */}
          <div className={`absolute inset-0 bg-[url(\`data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\`)] opacity-50`}></div>
          
          {/* Content Container */}
          <div className="relative p-8 animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;