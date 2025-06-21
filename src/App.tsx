import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import BookieChatbot from '@/components/BookieChatbot';

// Pages
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import CalendarView from '@/pages/CalendarView';
import MyBookings from '@/pages/MyBookings';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import Resources from '@/pages/Resources';
import Footer from '@/components/Footer';

function App() {
  return (
        <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
              }
            />
            <Route
              path="/calendar/:resourceId"
              element={
              <ProtectedRoute>
                <CalendarView />
              </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
              }
            />
            <Route
              path="/resources"
              element={
                <ProtectedRoute>
                  <Resources />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Bookie AI Chatbot - Available on all pages */}
          <BookieChatbot />
          <Footer />
          <Toaster />
        </div>
      </Router>
        </AuthProvider>
);
}

export default App;
