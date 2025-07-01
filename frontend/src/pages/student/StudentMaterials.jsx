import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Search, FileText, Video, ExternalLink, Eye, BookOpen, Grid, List, Tag, Star, Sparkles, Download } from 'lucide-react';

const StudentMaterials = () => {
  const { user } = useAuth();
  const { courses } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('order');

  // Get enrolled courses
  const enrolledCourses = courses.filter(course => 
    user && course.id && user.enrolledCourses?.includes(course.id)
  );

  // Get all materials from enrolled courses
  const allMaterials = enrolledCourses.reduce((acc, course) => {
    const courseMaterials = (course.materials || []).map(material => ({
      ...material,
      courseName: course.title,
      courseId: course.id,
      courseImage: course.image,
      instructor: course.instructor
    }));
    return [...acc, ...courseMaterials];
  }, []);

  // Filter and sort materials
  const filteredMaterials = allMaterials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || material.type === filterType;
    const matchesCourse = !filterCourse || material.courseId === parseInt(filterCourse);
    const matchesCategory = !filterCategory || material.category === filterCategory;
    return matchesSearch && matchesType && matchesCourse && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'title': return a.title.localeCompare(b.title);
      case 'course': return a.courseName.localeCompare(b.courseName);
      case 'type': return a.type.localeCompare(b.type);
      case 'category': return (a.category || 'lecture').localeCompare(b.category || 'lecture');
      case 'order':
      default: return (a.order || 0) - (b.order || 0);
    }
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
      case 'video': return <Video className="h-5 w-5 text-blue-500" />;
      case 'link': return <ExternalLink className="h-5 w-5 text-purple-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'pdf': return 'bg-red-100 text-red-700 border-red-200';
      case 'video': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'link': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'lecture': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'assignment': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'reference': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'supplementary': return 'bg-violet-100 text-violet-700 border-violet-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const materialStats = {
    total: allMaterials.length,
    required: allMaterials.filter(m => m.isRequired).length,
    byType: allMaterials.reduce((acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    }, {}),
    byCourse: enrolledCourses.reduce((acc, course) => {
      acc[course.title] = (course.materials || []).length;
      return acc;
    }, {})
  };

  const MaterialCard = ({ material }) => (
    <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            <div className="p-3 rounded-xl bg-gray-50 group-hover:scale-110 transition-transform duration-200">
              {getTypeIcon(material.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {material.title}
              </h3>
              <div className="flex items-center space-x-2 mb-3">
                <img
                  src={material.courseImage}
                  alt={material.courseName}
                  className="w-6 h-6 rounded object-cover"
                />
                <span className="text-sm text-gray-600 font-medium">{material.courseName}</span>
              </div>
              {material.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{material.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${getTypeColor(material.type)}`}>
            {material.type.toUpperCase()}
          </span>
          {material.category && (
            <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${getCategoryColor(material.category)}`}>
              {material.category}
            </span>
          )}
          {material.isRequired && (
            <span className="px-3 py-1 rounded-full border text-xs font-semibold bg-red-100 text-red-700 border-red-200">
              Required
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span className="font-medium">Order: {material.order || 1}</span>
          {material.fileSize && <span className="font-medium">Size: {material.fileSize}</span>}
        </div>

        <a
          href={material.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center font-medium shadow-md"
        >
          <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
          View Material
        </a>
      </div>
    </div>
  );

  const MaterialListItem = ({ material }) => (
    <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-xl bg-gray-50 flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
            {getTypeIcon(material.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {material.title}
              </h3>
              <div className="flex items-center space-x-2 ml-4">
                <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${getTypeColor(material.type)}`}>
                  {material.type.toUpperCase()}
                </span>
                {material.isRequired && (
                  <span className="px-3 py-1 rounded-full border text-xs font-semibold bg-red-100 text-red-700 border-red-200">
                    Required
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mb-2">
              <img
                src={material.courseImage}
                alt={material.courseName}
                className="w-6 h-6 rounded object-cover"
              />
              <span className="text-sm text-gray-600 font-medium">{material.courseName}</span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-500">By {material.instructor}</span>
            </div>
            
            {material.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{material.description}</p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {material.category && (
                  <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${getCategoryColor(material.category)}`}>
                    {material.category}
                  </span>
                )}
                <span className="font-medium">Order: {material.order || 1}</span>
                {material.fileSize && <span className="font-medium">Size: {material.fileSize}</span>}
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <a
              href={material.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center font-medium shadow-md"
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </a>
          </div>
        </div>
      </div>
    </div>
  );

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
                  Study Materials
                </h1>
                <p className="text-lg text-gray-600 mt-1">Access all your course materials in one organized place</p>
              </div>
            </div>
          </div>
        </div>

        {/* Material Stats
        {allMaterials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/20 rounded-full blur-2xl"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">{materialStats.total}</div>
                    <div className="text-blue-700 text-sm font-medium">Total Materials</div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-100 shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-200/20 rounded-full blur-2xl"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-red-600">{materialStats.required}</div>
                    <div className="text-red-700 text-sm font-medium">Required</div>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Star className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-200/20 rounded-full blur-2xl"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-emerald-600">{Object.keys(materialStats.byType).length}</div>
                    <div className="text-emerald-700 text-sm font-medium">Types</div>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Tag className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-100 shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-200/20 rounded-full blur-2xl"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-violet-600">{enrolledCourses.length}</div>
                    <div className="text-violet-700 text-sm font-medium">Courses</div>
                  </div>
                  <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-violet-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )} */}

        {/* Search and Filters */}
        {/* <div className="bg-white rounded-2xl border border-gray-100 shadow-lg">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search materials, courses, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                >
                  <option value="">All Types</option>
                  <option value="pdf">PDF Documents</option>
                  <option value="video">Videos</option>
                  <option value="link">External Links</option>
                </select>
                
                <select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                >
                  <option value="">All Courses</option>
                  {enrolledCourses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                >
                  <option value="">All Categories</option>
                  <option value="lecture">Lecture</option>
                  <option value="assignment">Assignment</option>
                  <option value="reference">Reference</option>
                  <option value="supplementary">Supplementary</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                >
                  <option value="order">Sort by Order</option>
                  <option value="title">Sort by Title</option>
                  <option value="course">Sort by Course</option>
                  <option value="type">Sort by Type</option>
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
        </div> */}

        {/* Materials Display */}
        {filteredMaterials.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Study Materials</h2>
                <p className="text-gray-600 mt-1">Your learning resources</p>
              </div>
              <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold border border-blue-200">
                {filteredMaterials.length} materials
              </span>
            </div>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMaterials.map((material) => (
                  <MaterialCard key={`${material.courseId}-${material.id}`} material={material} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMaterials.map((material) => (
                  <MaterialListItem key={`${material.courseId}-${material.id}`} material={material} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 rounded-3xl border border-white/60 shadow-xl p-12 text-center">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-200/20 to-teal-200/20 rounded-full blur-2xl"></div>
            
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {enrolledCourses.length === 0 ? 'No Enrolled Courses' : 'No Materials Found'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {enrolledCourses.length === 0 
                  ? 'Enroll in courses to access study materials'
                  : searchTerm || filterType || filterCourse || filterCategory
                    ? 'Try adjusting your search or filter criteria'
                    : 'No study materials available yet'
                }
              </p>
              {enrolledCourses.length === 0 ? (
                <a
                  href="/student/courses"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg font-semibold"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Browse Courses</span>
                </a>
              ) : (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('');
                    setFilterCourse('');
                    setFilterCategory('');
                  }}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg font-semibold"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentMaterials;