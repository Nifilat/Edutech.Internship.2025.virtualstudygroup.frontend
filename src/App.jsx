import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import CreateGroup from '@/pages/CreateGroup';
import JoinGroup from '@/pages/JoinGroup';
import Layout from '@/components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <Layout pageTitle="Dashboard" activeNavItem="dashboard">
              <Dashboard />
            </Layout>
          }
        />

        {/* Create Group */}
        <Route
          path="/create-group"
          element={
            <Layout pageTitle="Create Group" activeNavItem="create-group">
              <CreateGroup />
            </Layout>
          }
        />

        {/* Join Group */}
        <Route
          path="/join-group"
          element={
            <Layout pageTitle="Join Group" activeNavItem="join-group">
              <JoinGroup />
            </Layout>
          }
        />

        {/* Chatroom */}
        <Route
          path="/chatroom"
          element={
            <Layout pageTitle="Chatroom" activeNavItem="chatroom">
              <div className="p-6">
                <h1 className="text-2xl font-bold">Chatroom - Coming Soon</h1>
              </div>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
