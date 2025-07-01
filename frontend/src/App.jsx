import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import ForceDataRefresh from './ForceDataRefresh';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCourses from './pages/admin/AdminCourses';
import AdminChapters from './pages/admin/AdminChapters';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminExams from './pages/admin/AdminExams';
import AdminMaterials from './pages/admin/AdminMaterials';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCourses from './pages/student/StudentCourses';
import StudentMaterials from './pages/student/StudentMaterials';
import StudentExams from './pages/student/StudentExams';
import StudentCertificates from './pages/student/StudentCertificates';
import StudentExam from './pages/student/StudentExam';
import StudentChapterExam from './pages/student/StudentChapterExam';
import CourseView from './pages/student/CourseView';
import ProtectedRoute from './components/ProtectedRoute';
import AdminSubmissions from './pages/admin/AdminSubmissions';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        {/* Force data refresh on app load */}
        <ForceDataRefresh />
        
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminUsers />
                </ProtectedRoute>
              } />
              <Route path="/admin/courses" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminCourses />
                </ProtectedRoute>
              } />
              <Route path="/admin/chapters" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminChapters />
                </ProtectedRoute>
              } />
              <Route path="/admin/questions" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminQuestions />
                </ProtectedRoute>
              } />
              <Route path="/admin/exams" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminExams />
                </ProtectedRoute>
              } />
              <Route path="/admin/materials" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminMaterials />
                </ProtectedRoute>
              } />
              <Route path="/admin/submissions" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminSubmissions />
                </ProtectedRoute>
              } />

              
              {/* Student Routes */}
              <Route path="/student" element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/student/courses" element={
                <ProtectedRoute requiredRole="student">
                  <StudentCourses />
                </ProtectedRoute>
              } />
              <Route path="/student/materials" element={
                <ProtectedRoute requiredRole="student">
                  <StudentMaterials />
                </ProtectedRoute>
              } />
              <Route path="/student/exams" element={
                <ProtectedRoute requiredRole="student">
                  <StudentExams />
                </ProtectedRoute>
              } />
              <Route path="/student/certificates" element={
                <ProtectedRoute requiredRole="student">
                  <StudentCertificates />
                </ProtectedRoute>
              } />
              <Route path="/student/course/:id" element={
                <ProtectedRoute requiredRole="student">
                  <CourseView />
                </ProtectedRoute>
              } />
              <Route path="/student/exam/:id" element={
                <ProtectedRoute requiredRole="student">
                  <StudentExam />
                </ProtectedRoute>
              } />
              <Route path="/student/chapter-exam/:courseId/:chapterId" element={
                <ProtectedRoute requiredRole="student">
                  <StudentChapterExam />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;