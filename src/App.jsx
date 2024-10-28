import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { RoomList } from './components/lobby/RoomList';
import { RoomCreation } from './components/lobby/RoomCreation';
import { WaitingRoom } from './components/lobby/WaitingRoom';
import { GameBoard } from './components/game/GameBoard';
import { useAuth } from './hooks/useAuth';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Public Route Component (redirects to lobby if already logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/lobby" replace />;
  }

  return children;
}

// App Layout Component
function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <GameProvider>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/lobby"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <RoomList />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-room"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <RoomCreation />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/room/:roomId"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <WaitingRoom />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/game/:roomId"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <GameBoard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Redirect root to login or lobby */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navigate to="/lobby" replace />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route
              path="*"
              element={
                <AppLayout>
                  <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">404</h1>
                    <p className="text-gray-400 mb-8">Page not found</p>
                    <button
                      onClick={() => window.history.back()}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Go Back
                    </button>
                  </div>
                </AppLayout>
              }
            />
          </Routes>
        </GameProvider>
      </AuthProvider>
    </Router>
  );
}