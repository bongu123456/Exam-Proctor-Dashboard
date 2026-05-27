import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';

// Page Views
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import ExamSession from './pages/ExamSession';
import AdminDashboard from './pages/AdminDashboard';
import SubmissionDetails from './pages/SubmissionDetails';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          {/* Universal Navbar: handles hiding itself if unauthenticated */}
          <Navbar />
          
          <div style={{ flex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Student Secured Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/exam/:id" 
                element={
                  <ProtectedRoute>
                    <ExamSession />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/submission/:id" 
                element={
                  <ProtectedRoute>
                    <SubmissionDetails />
                  </ProtectedRoute>
                } 
              />

              {/* Administrator Secured Routes */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />

              {/* Fallback Directives */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
