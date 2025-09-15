import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Dashboard from '@/pages/Dashboard';
import CreateGroup from '@/pages/CreateGroup';
import JoinGroup from '@/pages/JoinGroup';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import { Toaster } from '@/components/ui/sonner';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout pageTitle="Dashboard" activeNavItem="dashboard">
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-group"
            element={
              <ProtectedRoute>
                <Layout pageTitle="Create Group" activeNavItem="create-group">
                  <CreateGroup />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/join-group"
            element={
              <ProtectedRoute>
                <Layout pageTitle="Join Group" activeNavItem="join-group">
                  <JoinGroup />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/chatroom"
            element={
              <ProtectedRoute>
                <Layout pageTitle="Chatroom" activeNavItem="chatroom">
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Chatroom - Coming Soon</h1>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster />
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
