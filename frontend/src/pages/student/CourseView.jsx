import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { BookOpen, Clock, CheckCircle, Play, Award, Download, Video, ExternalLink, Eye, ChevronDown, ChevronUp, ArrowLeft, FileText, Trophy, Target } from 'lucide-react';

const CourseView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { courses, studentProgress } = useData();
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [activeTab, setActiveTab] = useState('chapters');
  
  const course = courses.find(c => c.id === parseInt(id));
  const userProgress = studentProgress[user?.id]?.[course?.id] || {};
  const chapterExamScores = userProgress.chapterExamScores || {};
  const completedChapters = userProgress.completedChapters || [];
  
  if (!course) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
          <Link to="/student/courses" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            ← Back to Courses
          </Link>
        </div>
      </Layout>
    );
  }

  const progressPercentage = course.chapters?.length > 0 
    ? Math.round((Object.values(chapterExamScores).filter(score => score >= 70).length / course.chapters.length) * 100) 
    : 0;

  const allChaptersCompleted = course.chapters?.every(chapter => 
    chapterExamScores[chapter.id] >= 70
  );

  const getChapterStatus = (chapter) => {
    const examScore = chapterExamScores[chapter.id];
    
    if (examScore !== null && examScore !== undefined) {
      if (examScore >= 70) {
        return { status: 'completed', color: 'bg-green-100 text-green-700', message: `Passed with ${examScore}%` };
      } else {
        return { status: 'failed', color: 'bg-red-100 text-red-700', message: `Failed with ${examScore}% - Retake available` };
      }
    }
    
    return { status: 'available', color: 'bg-blue-100 text-blue-700', message: 'Ready to take exam' };
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="h-4 w-4 text-red-500" />;
      case 'video': return <Video className="h-4 w-4 text-blue-500" />;
      case 'link': return <ExternalLink className="h-4 w-4 text-purple-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const tabs = [
    { id: 'chapters', label: 'Chapters & Exams', count: course.chapters?.length || 0 },
    { id: 'materials', label: 'Study Materials', count: course.materials?.length || 0 },
    { id: 'overview', label: 'Course Overview', count: null }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center">
          <Link 
            to="/student/courses" 
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Courses
          </Link>
        </div>

        {/* Course Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-48 md:h-full object-cover"
              />
            </div>
            <div className="md:w-2/3 p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
    <p className="text-gray-600 mb-4">{course.description}</p>

    <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
      <span>By {course.instructor}</span>
      <span className="flex items-center">
        <Clock className="h-4 w-4 mr-1" />
        {course.duration}
      </span>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
        course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        {course.level}
      </span>
    </div>

              {/* Progress Bar */}
              {/* <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Course Progress</span>
                  <span>{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div> */}

              {userProgress.certificateEarned && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <Trophy className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">
                      Congratulations! You've completed this course and earned your certificate.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Chapters & Exams Tab */}
            {activeTab === 'chapters' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Course Chapters & Exams</h2>
                  <div className="text-sm text-gray-600">
                    {Object.values(chapterExamScores).filter(score => score >= 70).length} of {course.chapters?.length || 0} chapters completed
                  </div>
                </div>
                
                {course.chapters?.map((chapter, index) => {
                  const chapterStatus = getChapterStatus(chapter);
                  const isExpanded = expandedChapter === chapter.id;
                  
                  
                  return (
                    <div 
                      key={chapter.id} 
                      className={`border rounded-lg transition-all ${
                        chapterStatus.status === 'completed' 
                          ? 'bg-green-50 border-green-200' 
                          : chapterStatus.status === 'failed'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                              chapterStatus.status === 'completed' 
                                ? 'bg-green-500 text-white' 
                                : chapterStatus.status === 'failed'
                                  ? 'bg-red-500 text-white'
                                  : 'bg-blue-500 text-white'
                            }`}>
                              {chapterStatus.status === 'completed' ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <span className="text-sm font-medium">{index + 1}</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{chapter.title}</h3>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {chapter.duration}
                                {chapter.videoUrl && (
                                  <>
                                    <Video className="h-3 w-3 ml-3 mr-1" />
                                    Video included
                                  </>
                                )}
                              </div>
                              <div className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${chapterStatus.color}`}>
                                {chapterStatus.message}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {chapter.hasExam && (
                              <Link
                                to={`/student/chapter-exam/${course.id}/${chapter.id}`}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                                  chapterStatus.status === 'completed'
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : chapterStatus.status === 'failed'
                                      ? 'bg-red-600 text-white hover:bg-red-700'
                                      : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                              >
                                <Target className="h-3 w-3 mr-1" />
                                {chapterStatus.status === 'completed' 
                                  ? 'View Results' 
                                  : chapterStatus.status === 'failed'
                                    ? 'Retake Exam'
                                    : 'Take Exam'
                                }
                              </Link>
                            )}
                            
                            <button
                              onClick={() => setExpandedChapter(isExpanded ? null : chapter.id)}
                              className="text-gray-400 hover:text-gray-600 p-1"
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            {chapter.description && (
                              <p className="text-gray-600 mb-3">{chapter.description}</p>
                            )}
                            {chapter.videoUrl && (
                              <div className="mt-3">
                                <a
                                  href={chapter.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  <Video className="h-4 w-4 mr-1" />
                                  Watch Chapter Video
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Course Completion Status */}
                {allChaptersCompleted && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mt-6">
                    <div className="text-center">
                      <Trophy className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-green-900 mb-2">
                        Course Completed!
                      </h3>
                      <p className="text-green-700 mb-4">
                        Congratulations! You have successfully completed all chapters and earned your certificate.
                      </p>
                      <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center mx-auto">
                        <Download className="h-4 w-4 mr-2" />
                        Download Certificate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Materials Tab */}
            {activeTab === 'materials' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Study Materials</h2>
                {course.materials?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.materials.map((material) => (
                      <div key={material.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            {getTypeIcon(material.type)}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">{material.title}</h3>
                              {material.description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{material.description}</p>
                              )}
                              <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                                <span className="capitalize bg-gray-200 px-2 py-1 rounded">{material.type}</span>
                                {material.category && (
                                  <span className="capitalize">{material.category}</span>
                                )}
                                {material.fileSize && (
                                  <span>{material.fileSize}</span>
                                )}
                                {material.isRequired && (
                                  <span className="text-red-600 font-medium">Required</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <a
                            href={material.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-3 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Materials Available</h3>
                    <p className="text-gray-500">Study materials will be added by your instructor</p>
                  </div>
                )}
              </div>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Overview</h2>
                  <p className="text-gray-600 leading-relaxed">{course.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <div className="text-2xl font-bold text-blue-900">{course.chapters?.length || 0}</div>
                        <div className="text-blue-700 text-sm">Chapters</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-green-600 mr-3" />
                      <div>
                        <div className="text-2xl font-bold text-green-900">{course.materials?.length || 0}</div>
                        <div className="text-green-700 text-sm">Study Materials</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Award className="h-8 w-8 text-purple-600 mr-3" />
                      <div>
                        <div className="text-2xl font-bold text-purple-900">{progressPercentage}%</div>
                        <div className="text-purple-700 text-sm">Complete</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Learning Path</h3>
                  <ul className="space-y-2">
                    {course.chapters?.map((chapter, index) => (
                      <li key={chapter.id} className="flex items-center text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        Chapter {index + 1}: {chapter.title}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CourseView;