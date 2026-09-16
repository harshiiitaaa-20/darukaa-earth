import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Dashboard from './pages/Dashboard';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import SiteDetailPage from './pages/SiteDetailPage';
import MapViewPage from './pages/MapViewPage';
import Login from './pages/Login';
import Register from './pages/Register';

function ProtectedLayout() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center text-slate-400">
        Loading Darukaa.Earth Platform...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark text-slate-100">
      <Navbar />
      <div className="app-container flex-1">
        <Sidebar />
        <main className="main-content page-body">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/sites/:id" element={<SiteDetailPage />} />
            <Route path="/map" element={<MapViewPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}
