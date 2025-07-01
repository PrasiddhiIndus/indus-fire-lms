import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useData } from '../../contexts/DataContext';
import { Plus, Search, Edit2, Trash2, Mail, User, BookOpen, Eye, EyeOff, X, Check, Sparkles, Users as UsersIcon } from 'lucide-react';

const AdminUsers = () => {
  const { users, courses, addUser, updateUser, deleteUser, enrollStudent } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showUserCoursesModal, setShowUserCoursesModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    role: 'student' 
  });

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Validate password length
    if (!editingUser && formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    // Check for duplicate email
    const existingUser = users.find(user => 
      user.email === formData.email && (!editingUser || user.id !== editingUser.id)
    );
    if (existingUser) {
      alert('A user with this email already exists');
      return;
    }

    if (editingUser) {
      // When editing, only include password if it's provided
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      updateUser(editingUser.id, updateData);
    } else {
      addUser(formData);
    }
    
    setShowModal(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'student' });
  };

  const handleEdit = (user) => {
    setFormData({ 
      name: user.name, 
      email: user.email, 
      password: '', // Don't show existing password
      role: user.role 
    });
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
    }
  };

  const handleEnrollCourses = () => {
    if (selectedUser && selectedCourses.length > 0) {
      selectedCourses.forEach(courseId => {
        enrollStudent(selectedUser.id, courseId);
      });
      setShowEnrollModal(false);
      setSelectedUser(null);
      setSelectedCourses([]);
    }
  };

  const openEnrollModal = (user) => {
    setSelectedUser(user);
    setSelectedCourses([]);
    setShowEnrollModal(true);
  };

  const openUserCoursesModal = (user) => {
    setSelectedUser(user);
    setShowUserCoursesModal(true);
  };

  const handleCourseToggle = (courseId) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const getEnrolledCourses = (user) => {
    return courses.filter(course => user.enrolledCourses?.includes(course.id));
  };

  const getAvailableCourses = (user) => {
    return courses.filter(course => !user.enrolledCourses?.includes(course.id));
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
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
                    <UsersIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                      User Management
                    </h1>
                    <p className="text-lg text-gray-600 mt-1">Manage students and administrators</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 shadow-lg font-semibold"
              >
                <Plus className="h-5 w-5" />
                <span>Add User</span>
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
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Enrolled Courses
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const enrolledCourses = getEnrolledCourses(user);
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                              <User className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full border ${
                          user.role === 'admin' 
                            ? 'bg-violet-100 text-violet-700 border-violet-200' 
                            : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900 font-medium">{enrolledCourses.length} courses</span>
                          {user.role === 'student' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openUserCoursesModal(user)}
                                className="text-blue-600 hover:text-blue-800 text-xs bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                              >
                                View Courses
                              </button>
                              <button
                                onClick={() => openEnrollModal(user)}
                                className="text-emerald-600 hover:text-emerald-800 text-xs bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
                              >
                                Enroll More
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit User Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="relative overflow-hidden bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl max-w-md w-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/20 to-purple-200/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/20 to-blue-200/20 rounded-full blur-xl"></div>
              
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingUser(null);
                      setFormData({ name: '', email: '', password: '', role: 'student' });
                      setShowPassword(false);
                    }}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                      placeholder="Enter email address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password {!editingUser && <span className="text-red-500">*</span>}
                      {editingUser && <span className="text-gray-500 text-xs">(leave blank to keep current)</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required={!editingUser}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-3 pr-20 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                        placeholder={editingUser ? "Enter new password" : "Enter password"}
                        minLength="6"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="px-3 py-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">Minimum 6 characters</p>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg"
                    >
                      {editingUser ? 'Update User' : 'Create User'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingUser(null);
                        setFormData({ name: '', email: '', password: '', role: 'student' });
                        setShowPassword(false);
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
        )}

        {/* Enroll Courses Modal */}
        {showEnrollModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="relative overflow-hidden bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-200/20 to-teal-200/20 rounded-full blur-2xl"></div>
              
              <div className="relative">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Enroll {selectedUser.name} in Courses
                    </h2>
                    <button
                      onClick={() => {
                        setShowEnrollModal(false);
                        setSelectedUser(null);
                        setSelectedCourses([]);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Select courses to enroll {selectedUser.name}. Currently enrolled in {getEnrolledCourses(selectedUser).length} courses.
                    </p>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {getAvailableCourses(selectedUser).map((course) => (
                      <div key={course.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedCourses.includes(course.id)}
                            onChange={() => handleCourseToggle(course.id)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <img
                                src={course.image}
                                alt={course.title}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                              <div>
                                <h3 className="font-medium text-gray-900">{course.title}</h3>
                                <p className="text-sm text-gray-600">By {course.instructor}</p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>{course.duration}</span>
                              <span className={`px-2 py-1 rounded-full border ${
                                course.level === 'Beginner' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                course.level === 'Intermediate' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                'bg-red-100 text-red-700 border-red-200'
                              }`}>
                                {course.level}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {getAvailableCourses(selectedUser).length === 0 && (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">All Courses Enrolled</h3>
                      <p className="text-gray-500">{selectedUser.name} is already enrolled in all available courses</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
                    <div className="text-sm text-gray-600">
                      {selectedCourses.length} course(s) selected
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setShowEnrollModal(false);
                          setSelectedUser(null);
                          setSelectedCourses([]);
                        }}
                        className="px-6 py-2 border-2 border-gray-200 rounded-xl text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleEnrollCourses}
                        disabled={selectedCourses.length === 0}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
                      >
                        Enroll Selected Courses
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View User Courses Modal */}
        {showUserCoursesModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="relative overflow-hidden bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-200/20 to-teal-200/20 rounded-full blur-2xl"></div>
              
              <div className="relative">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedUser.name}'s Enrolled Courses
                    </h2>
                    <button
                      onClick={() => {
                        setShowUserCoursesModal(false);
                        setSelectedUser(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {getEnrolledCourses(selectedUser).length > 0 ? (
                    <div className="space-y-4">
                      {getEnrolledCourses(selectedUser).map((course) => (
                        <div key={course.id} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex items-start space-x-4">
                            <img
                              src={course.image}
                              alt={course.title}
                              className="h-16 w-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 mb-1">{course.title}</h3>
                              <p className="text-sm text-gray-600 mb-2">By {course.instructor}</p>
                              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{course.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>{course.duration}</span>
                                <span className={`px-2 py-1 rounded-full border ${
                                  course.level === 'Beginner' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                  course.level === 'Intermediate' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                  'bg-red-100 text-red-700 border-red-200'
                                }`}>
                                  {course.level}
                                </span>
                                <span className="flex items-center text-emerald-600">
                                  <Check className="h-3 w-3 mr-1" />
                                  Enrolled
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Enrolled</h3>
                      <p className="text-gray-500">{selectedUser.name} is not enrolled in any courses yet</p>
                      <button
                        onClick={() => {
                          setShowUserCoursesModal(false);
                          openEnrollModal(selectedUser);
                        }}
                        className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg"
                      >
                        Enroll in Courses
                      </button>
                    </div>
                  )}

                  <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
                    <button
                      onClick={() => {
                        setShowUserCoursesModal(false);
                        setSelectedUser(null);
                      }}
                      className="px-6 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminUsers;