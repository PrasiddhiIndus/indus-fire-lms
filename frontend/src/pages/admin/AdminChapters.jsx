import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useData } from '../../contexts/DataContext';
import { Plus, Search, Edit2, Trash2, BookOpen, Clock, FileText, Video, Link as LinkIcon, X, Save, ChevronDown, ChevronUp, Minus } from 'lucide-react';

const AdminChapters = () => {
  const { courses, updateCourse } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [expandedChapter, setExpandedChapter] = useState(null);
  
  // Dynamic chapter sections state
  const [chapterSections, setChapterSections] = useState([
    {
      id: 1,
      title: '',
      duration: '',
      order: 1,
      description: '',
      videoUrl: ''
    }
  ]);

  // FIXED: Ensure proper course lookup with type conversion
  const selectedCourseData = selectedCourse ? courses.find(c => {
    const courseId = typeof selectedCourse === 'string' ? parseInt(selectedCourse) : selectedCourse;
    return c.id === courseId;
  }) : null;

  const chapters = selectedCourseData?.chapters || [];

  const filteredChapters = chapters.filter(chapter =>
    chapter.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add new chapter section
  const addChapterSection = () => {
    const newSection = {
      id: Date.now(),
      title: '',
      duration: '',
      order: chapterSections.length + 1,
      description: '',
      videoUrl: ''
    };
    setChapterSections([...chapterSections, newSection]);
  };

  // Remove chapter section
  const removeChapterSection = (sectionId) => {
    if (chapterSections.length > 1) {
      const updatedSections = chapterSections.filter(section => section.id !== sectionId);
      // Reorder the remaining sections
      const reorderedSections = updatedSections.map((section, index) => ({
        ...section,
        order: index + 1
      }));
      setChapterSections(reorderedSections);
    }
  };

  // Update chapter section
  const updateChapterSection = (sectionId, field, value) => {
    setChapterSections(sections =>
      sections.map(section =>
        section.id === sectionId
          ? { ...section, [field]: value }
          : section
      )
    );
  };

  // Validate chapter sections
  const validateChapterSections = () => {
    for (const section of chapterSections) {
      if (!section.title.trim() || !section.duration.trim()) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // FIXED: Enhanced validation with better error messages
    if (!selectedCourse) {
      alert('Please select a course first');
      return;
    }

    // FIXED: Ensure we find the course properly
    const courseId = typeof selectedCourse === 'string' ? parseInt(selectedCourse) : selectedCourse;
    const targetCourse = courses.find(c => c.id === courseId);
    
    if (!targetCourse) {
      console.error('Course lookup failed:', {
        selectedCourse,
        courseId,
        availableCourses: courses.map(c => ({ id: c.id, title: c.title }))
      });
      alert(`Course not found. Selected: ${selectedCourse}, Available courses: ${courses.length}`);
      return;
    }

    // Validate chapter sections
    if (!validateChapterSections()) {
      alert('Please fill in all required fields (Title and Duration) for all chapters');
      return;
    }

    // Create chapters from sections
    const newChapters = chapterSections.map(section => ({
      id: Date.now() + Math.random() * 1000 + section.id,
      title: section.title.trim(),
      duration: section.duration.trim(),
      description: section.description.trim(),
      videoUrl: section.videoUrl.trim(),
      order: section.order,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    // Get existing chapters and add new ones
    const existingChapters = targetCourse.chapters || [];
    const maxOrder = existingChapters.length > 0 ? Math.max(...existingChapters.map(c => c.order || 0)) : 0;
    
    // Adjust order for new chapters
    const adjustedNewChapters = newChapters.map((chapter, index) => ({
      ...chapter,
      order: maxOrder + index + 1
    }));

    const updatedChapters = [...existingChapters, ...adjustedNewChapters];

    // Sort chapters by order
    updatedChapters.sort((a, b) => a.order - b.order);

    // Update course with new chapters
    updateCourse(targetCourse.id, {
      chapters: updatedChapters
    });

    // Reset form and close modal
    setShowModal(false);
    resetForm();
    
    // Show success message
    alert(`Successfully added ${newChapters.length} chapter(s) to "${targetCourse.title}"`);
  };

  const handleEdit = (chapter) => {
    // For editing, we'll use a single section
    setChapterSections([{
      id: 1,
      title: chapter.title,
      duration: chapter.duration,
      order: chapter.order || 1,
      description: chapter.description || '',
      videoUrl: chapter.videoUrl || ''
    }]);
    setEditingChapter(chapter);
    setShowModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedCourse || !editingChapter) {
      alert('Invalid edit operation');
      return;
    }

    const section = chapterSections[0];
    if (!section.title.trim() || !section.duration.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const updatedChapter = {
      ...editingChapter,
      title: section.title.trim(),
      duration: section.duration.trim(),
      description: section.description.trim(),
      videoUrl: section.videoUrl.trim(),
      order: section.order,
      updatedAt: new Date().toISOString()
    };

    const updatedChapters = chapters.map(chapter =>
      chapter.id === editingChapter.id ? updatedChapter : chapter
    );

    // Sort chapters by order
    updatedChapters.sort((a, b) => a.order - b.order);

    updateCourse(selectedCourseData.id, {
      chapters: updatedChapters
    });

    setShowModal(false);
    setEditingChapter(null);
    resetForm();
    
    alert('Chapter updated successfully!');
  };

  const handleDelete = (chapterId) => {
    if (window.confirm('Are you sure you want to delete this chapter?')) {
      const updatedChapters = chapters.filter(chapter => chapter.id !== chapterId);
      updateCourse(selectedCourseData.id, {
        chapters: updatedChapters
      });
      alert('Chapter deleted successfully!');
    }
  };

  const resetForm = () => {
    setChapterSections([
      {
        id: 1,
        title: '',
        duration: '',
        order: 1,
        description: '',
        videoUrl: ''
      }
    ]);
  };

  const openAddModal = () => {
    if (!selectedCourse) {
      alert('Please select a course first');
      return;
    }
    
    // FIXED: Validate course exists before opening modal
    const courseId = typeof selectedCourse === 'string' ? parseInt(selectedCourse) : selectedCourse;
    const targetCourse = courses.find(c => c.id === courseId);
    
    if (!targetCourse) {
      alert('Selected course not found. Please select a valid course.');
      return;
    }
    
    resetForm();
    setEditingChapter(null);
    setShowModal(true);
  };

  const getChapterStats = (chapter) => {
    return {
      hasVideo: !!chapter.videoUrl,
      hasDescription: !!chapter.description,
      order: chapter.order || 0
    };
  };

  // FIXED: Handle course selection change properly
  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    setSearchTerm(''); // Reset search when changing course
    setExpandedChapter(null); // Reset expanded chapter
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chapter Management</h1>
            <p className="text-gray-600">Create and organize course chapters with multiple sections</p>
          </div>
          <button
            onClick={openAddModal}
            disabled={!selectedCourse}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            <span>Add Chapters</span>
          </button>
        </div>

        {/* Course Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Course <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCourse}
                onChange={handleCourseChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a course to manage chapters</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title} ({course.chapters?.length || 0} chapters)
                  </option>
                ))}
              </select>
              {!selectedCourse && (
                <p className="text-xs text-red-500 mt-1">
                  You must select a course before creating chapters
                </p>
              )}
              {/* FIXED: Debug info for troubleshooting */}
              {selectedCourse && !selectedCourseData && (
                <p className="text-xs text-red-500 mt-1">
                  Warning: Selected course not found (ID: {selectedCourse})
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Chapters</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search chapters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={!selectedCourse}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Course Info and Chapters */}
        {selectedCourse && selectedCourseData ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedCourseData.image}
                    alt={selectedCourseData.title}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedCourseData.title}
                    </h2>
                    <p className="text-gray-600">
                      {chapters.length} chapters • By {selectedCourseData.instructor}
                    </p>
                  </div>
                </div>
                <button
                  onClick={openAddModal}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Chapters</span>
                </button>
              </div>
            </div>
            
            {filteredChapters.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredChapters.map((chapter, index) => {
                  const stats = getChapterStats(chapter);
                  const isExpanded = expandedChapter === chapter.id;
                  
                  return (
                    <div key={chapter.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              Chapter {stats.order}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{chapter.title}</h3>
                          </div>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {chapter.duration}
                            </div>
                            {stats.hasVideo && (
                              <div className="flex items-center text-green-600">
                                <Video className="h-4 w-4 mr-1" />
                                Video included
                              </div>
                            )}
                            {stats.hasDescription && (
                              <div className="flex items-center text-blue-600">
                                <FileText className="h-4 w-4 mr-1" />
                                Has description
                              </div>
                            )}
                          </div>

                          {isExpanded && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                              {chapter.description && (
                                <div className="mb-3">
                                  <h4 className="font-medium text-gray-900 mb-1">Description:</h4>
                                  <p className="text-gray-600">{chapter.description}</p>
                                </div>
                              )}
                              {chapter.videoUrl && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-1">Video URL:</h4>
                                  <a
                                    href={chapter.videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm break-all"
                                  >
                                    {chapter.videoUrl}
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => setExpandedChapter(isExpanded ? null : chapter.id)}
                            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleEdit(chapter)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(chapter.id)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No chapters found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? 'Try adjusting your search criteria' : 'Start by adding your first chapter to this course'}
                </p>
                <button
                  onClick={openAddModal}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add First Chapter
                </button>
              </div>
            )}
          </div>
        ) : selectedCourse ? (
          // FIXED: Show error state when course is selected but not found
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-12 text-center">
            <div className="text-red-600 mb-4">
              <BookOpen className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Course Not Found</h3>
              <p className="text-sm">
                The selected course (ID: {selectedCourse}) could not be found.
                <br />
                Available courses: {courses.length}
              </p>
              <button
                onClick={() => setSelectedCourse('')}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Reset Selection
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Course First</h3>
            <p className="text-gray-500 mb-6">Choose a course from the dropdown above to manage its chapters</p>
            
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {courses.slice(0, 6).map(course => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course.id.toString())}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                  >
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-24 object-cover rounded mb-3"
                    />
                    <h4 className="font-medium text-gray-900 mb-1">{course.title}</h4>
                    <p className="text-sm text-gray-600">{course.chapters?.length || 0} chapters</p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No courses available. Create a course first.</p>
            )}
          </div>
        )}

        {/* Enhanced Modal with Dynamic Sections */}
        {showModal && selectedCourseData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {editingChapter ? 'Edit Chapter' : 'Add New Chapters'}
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      {editingChapter 
                        ? 'Update chapter information' 
                        : `Adding chapters to "${selectedCourseData.title}"`
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingChapter(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <form onSubmit={editingChapter ? handleEditSubmit : handleSubmit} className="space-y-6">
                  {/* Course Info Display */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <div>
                        <h3 className="font-medium text-blue-900">
                          {selectedCourseData.title}
                        </h3>
                        <p className="text-blue-700 text-sm">
                          Current chapters: {chapters.length} • Instructor: {selectedCourseData.instructor}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Chapter Sections */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        {editingChapter ? 'Chapter Information' : 'Chapter Sections'}
                      </h3>
                      {!editingChapter && (
                        <button
                          type="button"
                          onClick={addChapterSection}
                          className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Section</span>
                        </button>
                      )}
                    </div>

                    {chapterSections.map((section, index) => (
                      <div key={section.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900">
                            {editingChapter ? 'Chapter Details' : `Chapter Section ${index + 1}`}
                          </h4>
                          {!editingChapter && chapterSections.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeChapterSection(section.id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Chapter Title <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={section.title}
                              onChange={(e) => updateChapterSection(section.id, 'title', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., Introduction to Components"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Duration <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={section.duration}
                              onChange={(e) => updateChapterSection(section.id, 'duration', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., 45 min"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Order Number
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={section.order}
                              onChange={(e) => updateChapterSection(section.id, 'order', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            rows={3}
                            value={section.description}
                            onChange={(e) => updateChapterSection(section.id, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe what students will learn in this chapter..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Video URL (Optional)
                          </label>
                          <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="url"
                              value={section.videoUrl}
                              onChange={(e) => updateChapterSection(section.id, 'videoUrl', e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="https://youtube.com/watch?v=..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  {!editingChapter && chapterSections.length > 1 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2">Summary</h4>
                      <p className="text-green-800 text-sm">
                        You are about to create {chapterSections.length} new chapters for "{selectedCourseData.title}".
                        These will be added to the existing {chapters.length} chapters.
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {editingChapter 
                        ? 'Update Chapter' 
                        : `Create ${chapterSections.length} Chapter${chapterSections.length > 1 ? 's' : ''}`
                      }
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingChapter(null);
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

export default AdminChapters;