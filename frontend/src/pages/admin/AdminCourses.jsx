import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useData } from '../../contexts/DataContext';
import { Plus, Search, Edit2, Trash2, Users, Clock, Star, Upload, Link, X, Image, BookOpen, Sparkles } from 'lucide-react';

const AdminCourses = () => {
  const { courses, addCourse, updateCourse, deleteCourse } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [imageMethod, setImageMethod] = useState('url'); // 'url' or 'upload'
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    duration: '',
    level: 'Beginner',
    image: ''
  });

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setUploadedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setFormData({ ...formData, image: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url) => {
    setFormData({ ...formData, image: url });
    setImagePreview(url);
  };

  const resetImageState = () => {
    setUploadedImage(null);
    setImagePreview('');
    setImageMethod('url');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.description || !formData.instructor || !formData.duration) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate image
    if (!formData.image) {
      alert('Please provide a course image');
      return;
    }

    if (editingCourse) {
      updateCourse(editingCourse.id, formData);
    } else {
      addCourse({
        ...formData,
        chapters: [],
        materials: []
      });
    }
    
    setShowModal(false);
    setEditingCourse(null);
    resetForm();
  };

  const handleEdit = (course) => {
    setFormData({
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      duration: course.duration,
      level: course.level,
      image: course.image
    });
    setImagePreview(course.image);
    // Determine if it's a URL or uploaded image
    setImageMethod(course.image.startsWith('data:') ? 'upload' : 'url');
    setEditingCourse(course);
    setShowModal(true);
  };

  const handleDelete = (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      deleteCourse(courseId);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      instructor: '',
      duration: '',
      level: 'Beginner',
      image: ''
    });
    resetImageState();
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Intermediate': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 rounded-3xl border border-white/60 shadow-xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-blue-200/20 via-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-emerald-200/20 to-teal-200/20 rounded-full blur-2xl"></div>
          
          <div className="relative p-8">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                      Course Management
                    </h1>
                    <p className="text-lg text-gray-600 mt-1">Create and manage your courses</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 shadow-lg font-semibold"
              >
                <Plus className="h-5 w-5" />
                <span>Add Course</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg">
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="relative">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={() => handleEdit(course)}
                    className="p-2 bg-white/90 backdrop-blur-sm text-blue-600 rounded-lg hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="p-2 bg-white/90 backdrop-blur-sm text-red-600 rounded-lg hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
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
                
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    {course.chapters?.length || 0} chapters • {course.materials?.length || 0} materials
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="relative overflow-hidden bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-200/20 to-teal-200/20 rounded-full blur-2xl"></div>
              
              <div className="relative">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {editingCourse ? 'Edit Course' : 'Add New Course'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setEditingCourse(null);
                        resetForm();
                      }}
                      className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                        placeholder="Enter course title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                        placeholder="Enter course description"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instructor <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.instructor}
                        onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                        placeholder="Enter instructor name"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., 6 weeks"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                        <select
                          value={formData.level}
                          onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    </div>

                    {/* Image Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Course Image <span className="text-red-500">*</span>
                      </label>
                      
                      {/* Image Method Selection */}
                      <div className="flex space-x-4 mb-4">
                        <button
                          type="button"
                          onClick={() => {
                            setImageMethod('url');
                            setUploadedImage(null);
                            if (formData.image.startsWith('data:')) {
                              setFormData({ ...formData, image: '' });
                              setImagePreview('');
                            }
                          }}
                          className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                            imageMethod === 'url'
                              ? 'bg-blue-50 border-blue-300 text-blue-700'
                              : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Link className="h-4 w-4 mr-2" />
                          Image URL
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImageMethod('upload');
                            if (!formData.image.startsWith('data:')) {
                              setFormData({ ...formData, image: '' });
                              setImagePreview('');
                            }
                          }}
                          className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                            imageMethod === 'upload'
                              ? 'bg-blue-50 border-blue-300 text-blue-700'
                              : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </button>
                      </div>

                      {/* Image URL Input */}
                      {imageMethod === 'url' && (
                        <div className="space-y-3">
                          <input
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            value={formData.image.startsWith('data:') ? '' : formData.image}
                            onChange={(e) => handleImageUrlChange(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                          />
                          <p className="text-xs text-gray-500">
                            Enter a direct link to an image (JPG, PNG, GIF, WebP)
                          </p>
                        </div>
                      )}

                      {/* Image Upload */}
                      {imageMethod === 'upload' && (
                        <div className="space-y-3">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="image-upload"
                            />
                            <label htmlFor="image-upload" className="cursor-pointer">
                              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">
                                Click to upload an image or drag and drop
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG, GIF up to 5MB
                              </p>
                            </label>
                          </div>
                          {uploadedImage && (
                            <div className="text-sm text-green-600 flex items-center">
                              <Image className="h-4 w-4 mr-1" />
                              {uploadedImage.name} ({(uploadedImage.size / 1024 / 1024).toFixed(2)} MB)
                            </div>
                          )}
                        </div>
                      )}

                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                          <div className="relative inline-block">
                            <img
                              src={imagePreview}
                              alt="Course preview"
                              className="h-32 w-48 object-cover rounded-lg border border-gray-300"
                              onError={() => {
                                setImagePreview('');
                                if (imageMethod === 'url') {
                                  alert('Failed to load image. Please check the URL.');
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setImagePreview('');
                                setFormData({ ...formData, image: '' });
                                setUploadedImage(null);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg"
                      >
                        {editingCourse ? 'Update Course' : 'Create Course'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(false);
                          setEditingCourse(null);
                          resetForm();
                        }}
                        className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminCourses;