import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useData } from '../../contexts/DataContext';
import { Plus, Search, Edit2, Trash2, FileText, Download, Upload, Link as LinkIcon, Video, Image, File, ExternalLink, X, Save, Filter, SortAsc, FolderOpen, Sparkles } from 'lucide-react';

const AdminMaterials = () => {
  const { courses, updateCourse } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('order');
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'pdf',
    url: '',
    fileSize: '',
    category: 'lecture',
    isRequired: true,
    order: 1
  });

  const selectedCourseData = courses.find(c => c.id === parseInt(selectedCourse));
  const materials = selectedCourseData?.materials || [];

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || material.type === filterType;
    const matchesCategory = !filterCategory || material.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'title': return a.title.localeCompare(b.title);
      case 'type': return a.type.localeCompare(b.type);
      case 'category': return (a.category || 'lecture').localeCompare(b.category || 'lecture');
      case 'order':
      default: return (a.order || 0) - (b.order || 0);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCourseData) return;

    if (!formData.title.trim() || !formData.url.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const newMaterial = {
      id: editingMaterial ? editingMaterial.id : Date.now(),
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      url: formData.url.trim(),
      order: parseInt(formData.order),
      uploadDate: editingMaterial ? editingMaterial.uploadDate : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let updatedMaterials;
    if (editingMaterial) {
      updatedMaterials = materials.map(material =>
        material.id === editingMaterial.id ? newMaterial : material
      );
    } else {
      updatedMaterials = [...materials, newMaterial];
    }

    // Sort materials by order
    updatedMaterials.sort((a, b) => (a.order || 0) - (b.order || 0));

    updateCourse(selectedCourseData.id, {
      materials: updatedMaterials
    });

    setShowModal(false);
    setEditingMaterial(null);
    resetForm();
    
    alert(`Material ${editingMaterial ? 'updated' : 'added'} successfully!`);
  };

  const handleEdit = (material) => {
    setFormData({
      title: material.title,
      description: material.description || '',
      type: material.type,
      url: material.url,
      fileSize: material.fileSize || '',
      category: material.category || 'lecture',
      isRequired: material.isRequired !== false,
      order: material.order || 1
    });
    setEditingMaterial(material);
    setShowModal(true);
  };

  const handleDelete = (materialId) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      const updatedMaterials = materials.filter(material => material.id !== materialId);
      updateCourse(selectedCourseData.id, {
        materials: updatedMaterials
      });
      alert('Material deleted successfully!');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'pdf',
      url: '',
      fileSize: '',
      category: 'lecture',
      isRequired: true,
      order: materials.length + 1
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
      case 'video': return <Video className="h-5 w-5 text-blue-500" />;
      case 'image': return <Image className="h-5 w-5 text-green-500" />;
      case 'link': return <LinkIcon className="h-5 w-5 text-purple-500" />;
      case 'document': return <File className="h-5 w-5 text-orange-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'pdf': return 'bg-red-100 text-red-700 border-red-200';
      case 'video': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'image': return 'bg-green-100 text-green-700 border-green-200';
      case 'link': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'document': return 'bg-orange-100 text-orange-700 border-orange-200';
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

  const exportMaterials = () => {
    if (!selectedCourseData || materials.length === 0) return;

    const csvContent = [
      ['Title', 'Type', 'Category', 'URL', 'Description', 'Required', 'Order', 'Upload Date'],
      ...materials.map(m => [
        m.title,
        m.type,
        m.category || 'lecture',
        m.url,
        m.description || '',
        m.isRequired ? 'Yes' : 'No',
        m.order || 1,
        new Date(m.uploadDate).toLocaleDateString()
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `materials-${selectedCourseData.title.replace(/\s+/g, '-').toLowerCase()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const openAddModal = () => {
    if (!selectedCourse) {
      alert('Please select a course first');
      return;
    }
    resetForm();
    setEditingMaterial(null);
    setShowModal(true);
  };

  const materialStats = {
    total: materials.length,
    required: materials.filter(m => m.isRequired).length,
    byType: materials.reduce((acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    }, {}),
    byCategory: materials.reduce((acc, m) => {
      const cat = m.category || 'lecture';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {})
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
                    <FolderOpen className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                      Study Materials
                    </h1>
                    <p className="text-lg text-gray-600 mt-1">Manage course resources and learning materials</p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={exportMaterials}
                  disabled={!selectedCourse || materials.length === 0}
                  className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
                >
                  <Download className="h-5 w-5" />
                  <span>Export</span>
                </button>
                <button
                  onClick={openAddModal}
                  disabled={!selectedCourse}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Material</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Course Selection and Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Course <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                >
                  <option value="">Choose a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title} ({course.materials?.length || 0} materials)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  disabled={!selectedCourse}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 disabled:opacity-50"
                >
                  <option value="">All Types</option>
                  <option value="pdf">PDF Documents</option>
                  <option value="video">Videos</option>
                  <option value="link">External Links</option>
                  <option value="image">Images</option>
                  <option value="document">Documents</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  disabled={!selectedCourse}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 disabled:opacity-50"
                >
                  <option value="">All Categories</option>
                  <option value="lecture">Lecture</option>
                  <option value="assignment">Assignment</option>
                  <option value="reference">Reference</option>
                  <option value="supplementary">Supplementary</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  disabled={!selectedCourse}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 disabled:opacity-50"
                >
                  <option value="order">Order</option>
                  <option value="title">Title</option>
                  <option value="type">Type</option>
                  <option value="category">Category</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Materials</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search materials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={!selectedCourse}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Info and Stats */}
        {selectedCourse && selectedCourseData && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedCourseData.image}
                    alt={selectedCourseData.title}
                    className="h-16 w-16 rounded-xl object-cover shadow-lg"
                  />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedCourseData.title}
                    </h2>
                    <p className="text-gray-600">
                      By {selectedCourseData.instructor} • {materialStats.total} materials
                    </p>
                  </div>
                </div>
                <button
                  onClick={openAddModal}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                  Add Material
                </button>
              </div>

              {/* Material Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200/20 rounded-full blur-xl"></div>
                  <div className="relative">
                    <div className="text-2xl font-bold text-blue-600">{materialStats.total}</div>
                    <div className="text-blue-700 text-sm font-medium">Total Materials</div>
                  </div>
                </div>
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 p-4">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-200/20 rounded-full blur-xl"></div>
                  <div className="relative">
                    <div className="text-2xl font-bold text-emerald-600">{materialStats.required}</div>
                    <div className="text-emerald-700 text-sm font-medium">Required</div>
                  </div>
                </div>
                <div className="relative overflow-hidden bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100 p-4">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-violet-200/20 rounded-full blur-xl"></div>
                  <div className="relative">
                    <div className="text-2xl font-bold text-violet-600">{Object.keys(materialStats.byType).length}</div>
                    <div className="text-violet-700 text-sm font-medium">Types</div>
                  </div>
                </div>
                <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 p-4">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-200/20 rounded-full blur-xl"></div>
                  <div className="relative">
                    <div className="text-2xl font-bold text-amber-600">{Object.keys(materialStats.byCategory).length}</div>
                    <div className="text-amber-700 text-sm font-medium">Categories</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Materials Grid */}
        {selectedCourse ? (
          filteredMaterials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => (
                <div key={material.id} className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="p-3 rounded-xl bg-gray-50 group-hover:scale-110 transition-transform duration-200">
                          {getTypeIcon(material.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {material.title}
                          </h3>
                          {material.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{material.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={() => handleEdit(material)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(material.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
                      <span>Order: {material.order || 1}</span>
                      {material.fileSize && <span>Size: {material.fileSize}</span>}
                    </div>

                    <a
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center font-medium shadow-md"
                    >
                      <ExternalLink className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                      View Material
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 rounded-3xl border border-white/60 shadow-xl p-12 text-center">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-200/20 to-teal-200/20 rounded-full blur-2xl"></div>
              
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Materials Found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || filterType || filterCategory
                    ? 'Try adjusting your search or filter criteria'
                    : 'Start by adding your first study material to this course'
                  }
                </p>
                <button
                  onClick={openAddModal}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg font-semibold"
                >
                  <Plus className="h-5 w-5 mr-2 inline" />
                  Add First Material
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 rounded-3xl border border-white/60 shadow-xl p-12 text-center">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-200/20 to-teal-200/20 rounded-full blur-2xl"></div>
            
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <FolderOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Course First</h3>
              <p className="text-gray-500 mb-6">Choose a course from the dropdown above to manage its study materials</p>
              
              {courses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  {courses.slice(0, 6).map(course => (
                    <button
                      key={course.id}
                      onClick={() => setSelectedCourse(course.id.toString())}
                      className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors text-left group"
                    >
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-24 object-cover rounded-lg mb-3 group-hover:scale-105 transition-transform duration-200"
                      />
                      <h4 className="font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h4>
                      <p className="text-sm text-gray-600">{course.materials?.length || 0} materials</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Modal */}
        {showModal && selectedCourseData && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="relative overflow-hidden bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-200/20 to-teal-200/20 rounded-full blur-2xl"></div>
              
              <div className="relative">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {editingMaterial ? 'Edit Study Material' : 'Add New Study Material'}
                      </h2>
                      <p className="text-gray-600 text-sm mt-1">
                        {editingMaterial 
                          ? 'Update material information' 
                          : `Adding material to "${selectedCourseData.title}"`
                        }
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setEditingMaterial(null);
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
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3"></div>
                        Basic Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            placeholder="e.g., React Documentation"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                          >
                            <option value="pdf">PDF Document</option>
                            <option value="video">Video</option>
                            <option value="link">External Link</option>
                            <option value="image">Image</option>
                            <option value="document">Document</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          URL/Link <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="url"
                            required
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                            placeholder="https://example.com/resource"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          rows={3}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                          placeholder="Brief description of this material..."
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full mr-3"></div>
                        Organization & Settings
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                          >
                            <option value="lecture">Lecture Material</option>
                            <option value="assignment">Assignment</option>
                            <option value="reference">Reference</option>
                            <option value="supplementary">Supplementary</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                          <input
                            type="number"
                            min="1"
                            value={formData.order}
                            onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">File Size (Optional)</label>
                          <input
                            type="text"
                            value={formData.fileSize}
                            onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                            placeholder="e.g., 2.5 MB"
                          />
                        </div>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isRequired"
                          checked={formData.isRequired}
                          onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isRequired" className="ml-3 block text-sm text-gray-900">
                          This is a required material for the course
                        </label>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center font-medium shadow-lg"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {editingMaterial ? 'Update Material' : 'Add Material'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(false);
                          setEditingMaterial(null);
                          resetForm();
                        }}
                        className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium"
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

export default AdminMaterials;