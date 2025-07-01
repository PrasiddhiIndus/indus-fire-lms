import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useData } from '../../contexts/DataContext';
import { Plus, Search, Edit2, Trash2, Clock, FileText, BookOpen, Settings, Users, CheckCircle, AlertCircle, Save, X } from 'lucide-react';

const AdminExams = () => {
  const { exams, courses, questionBank, addExam, updateExam, deleteExam } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    chapterId: '',
    duration: 30,
    totalQuestions: 10
  });

  const filteredExams = exams.filter(exam =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCourseTitle = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : 'Unknown Course';
  };

  const getChapterTitle = (courseId, chapterId) => {
    const course = courses.find(c => c.id === courseId);
    const chapter = course?.chapters?.find(ch => ch.id === chapterId);
    return chapter ? chapter.title : 'Unknown Chapter';
  };

  // Get available questions for a specific course and chapter
  const getAvailableQuestions = (courseId, chapterId) => {
    if (!courseId || !chapterId) return [];
    return questionBank.filter(q => 
      q.courseId === parseInt(courseId) && q.chapterId === parseInt(chapterId)
    );
  };

  // Get question count for an existing exam
  const getExamQuestionCount = (exam) => {
    if (exam.chapterId) {
      // Chapter exam - count questions from question bank
      return getAvailableQuestions(exam.courseId, exam.chapterId).length;
    } else if (exam.questions) {
      // Legacy exam with hardcoded questions
      return exam.questions.length;
    } else {
      // Course-wide exam - count all questions for the course
      return questionBank.filter(q => q.courseId === exam.courseId).length;
    }
  };

  const getSelectedCourse = () => {
    return courses.find(c => c.id === parseInt(formData.courseId));
  };

  const getAvailableQuestionsForForm = () => {
    if (!formData.courseId || !formData.chapterId) return [];
    return questionBank.filter(q => 
      q.courseId === parseInt(formData.courseId) && q.chapterId === parseInt(formData.chapterId)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      alert('Please enter an exam title');
      return;
    }

    if (!formData.courseId) {
      alert('Please select a course');
      return;
    }

    if (!formData.chapterId) {
      alert('Please select a chapter');
      return;
    }

    if (formData.duration < 5 || formData.duration > 180) {
      alert('Duration must be between 5 and 180 minutes');
      return;
    }

    if (formData.totalQuestions < 1 || formData.totalQuestions > 50) {
      alert('Number of questions must be between 1 and 50');
      return;
    }

    // Check if enough questions are available
    const availableQuestions = getAvailableQuestionsForForm();
    if (availableQuestions.length < formData.totalQuestions) {
      alert(`Not enough questions available. Only ${availableQuestions.length} questions found for the selected chapter. Please add more questions or reduce the number of questions for this exam.`);
      return;
    }

    const examData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      courseId: parseInt(formData.courseId),
      chapterId: parseInt(formData.chapterId),
      duration: parseInt(formData.duration),
      totalQuestions: parseInt(formData.totalQuestions),
      type: 'chapter',
      createdAt: new Date().toISOString()
    };

    if (editingExam) {
      updateExam(editingExam.id, examData);
      alert('Exam updated successfully!');
    } else {
      addExam(examData);
      alert(`Exam created successfully! ${availableQuestions.length} questions available for this chapter.`);
    }
    
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      courseId: '',
      chapterId: '',
      duration: 30,
      totalQuestions: 10
    });
    setEditingExam(null);
  };

  const handleEdit = (exam) => {
    setFormData({
      title: exam.title,
      description: exam.description || '',
      courseId: exam.courseId.toString(),
      chapterId: exam.chapterId ? exam.chapterId.toString() : (exam.selectedChapters?.[0]?.toString() || ''),
      duration: exam.duration,
      totalQuestions: exam.totalQuestions || getExamQuestionCount(exam) || 10
    });
    setEditingExam(exam);
    setShowModal(true);
  };

  const handleDelete = (examId) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      deleteExam(examId);
      alert('Exam deleted successfully!');
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Exam Management</h1>
            <p className="text-gray-600">Create and manage course examinations</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Exam</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => {
            const questionCount = getExamQuestionCount(exam);
            const availableQuestions = exam.chapterId ? getAvailableQuestions(exam.courseId, exam.chapterId) : [];
            
            return (
              <div key={exam.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{exam.title}</h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {getCourseTitle(exam.courseId)}
                    </div>
                    {exam.chapterId && (
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <FileText className="h-4 w-4 mr-1" />
                        {getChapterTitle(exam.courseId, exam.chapterId)}
                      </div>
                    )}
                    {exam.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{exam.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleEdit(exam)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(exam.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {exam.duration} minutes
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FileText className="h-4 w-4 mr-1" />
                      {questionCount} questions
                    </div>
                  </div>

                  {/* Question availability indicator */}
                  {exam.chapterId && (
                    <div className={`p-3 rounded-lg border text-sm ${
                      questionCount >= 10 
                        ? 'bg-green-50 border-green-200 text-green-800' 
                        : questionCount >= 5
                          ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                          : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                      <div className="flex items-center">
                        {questionCount >= 10 ? (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        ) : (
                          <AlertCircle className="h-4 w-4 mr-2" />
                        )}
                        <span className="font-medium">
                          {questionCount >= 10 
                            ? 'Ready for students' 
                            : questionCount >= 5
                              ? 'Limited questions'
                              : 'Needs more questions'
                          }
                        </span>
                      </div>
                      <p className="mt-1 text-xs">
                        {questionCount} questions available in question bank
                      </p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      Created {exam.createdAt ? new Date(exam.createdAt).toLocaleDateString() : 'Recently'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredExams.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
            <p className="text-gray-500 mb-4">Create your first exam to get started</p>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Exam
            </button>
          </div>
        )}

        {/* Simplified Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    {editingExam ? 'Edit Exam' : 'Create New Exam'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Exam Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Exam Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., React Fundamentals Final Exam"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Brief description of the exam content and objectives..."
                      />
                    </div>
                  </div>

                  {/* Course and Chapter Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Content Selection</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Course <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={formData.courseId}
                          onChange={(e) => setFormData({ ...formData, courseId: e.target.value, chapterId: '' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select a course</option>
                          {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.title}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Chapter <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={formData.chapterId}
                          onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}
                          disabled={!formData.courseId}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                          <option value="">Select a chapter</option>
                          {getSelectedCourse()?.chapters?.map(chapter => (
                            <option key={chapter.id} value={chapter.id}>{chapter.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {formData.courseId && formData.chapterId && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Available Questions</h4>
                        <p className="text-sm text-blue-800">
                          {getAvailableQuestionsForForm().length} questions available in this chapter
                        </p>
                        {getAvailableQuestionsForForm().length === 0 && (
                          <p className="text-sm text-red-600 mt-1">
                            ⚠️ No questions found. Please add questions to this chapter first.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Exam Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Exam Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration (minutes) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min="5"
                          max="180"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Between 5 and 180 minutes</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Questions <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          max={Math.min(50, getAvailableQuestionsForForm().length || 50)}
                          value={formData.totalQuestions}
                          onChange={(e) => setFormData({ ...formData, totalQuestions: parseInt(e.target.value) || 10 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Max: {Math.min(50, getAvailableQuestionsForForm().length || 50)} questions
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  {formData.courseId && formData.chapterId && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2">Exam Summary</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm text-green-800">
                        <div>
                          <strong>Course:</strong> {getCourseTitle(parseInt(formData.courseId))}
                        </div>
                        <div>
                          <strong>Chapter:</strong> {getChapterTitle(parseInt(formData.courseId), parseInt(formData.chapterId))}
                        </div>
                        <div>
                          <strong>Duration:</strong> {formData.duration} minutes
                        </div>
                        <div>
                          <strong>Questions:</strong> {formData.totalQuestions} questions
                        </div>
                      </div>
                      <p className="text-sm text-green-700 mt-2">
                        Questions will be randomly selected from the available question bank.
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={!formData.courseId || !formData.chapterId || getAvailableQuestionsForForm().length < formData.totalQuestions}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {editingExam ? 'Update Exam' : 'Create Exam'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminExams;