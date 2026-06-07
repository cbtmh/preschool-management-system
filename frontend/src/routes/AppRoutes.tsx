import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from '../pages/login/index'; // The Shadcn login page we built
import MainLayout from '../components/layout/MainLayout';
import Dashboard from '../pages/Dashboard';
import AcademicYears from '../pages/AcademicYears';
import SchoolClasses from '../pages/SchoolClasses';
import Teachers from '../pages/Teachers';
import Parents from '../pages/Parents';
import Children from '../pages/Children';
import Meals from '../pages/Operations/Meals';
import Incidents from '../pages/Operations/Incidents';
import AttendanceReports from '../pages/Operations/AttendanceReports';
import NewsManagement from '../pages/Dashboard/NewsManagement';
import NotificationManagement from '../pages/Dashboard/NotificationManagement';

import PublicLayout from '../components/layout/PublicLayout';
import Home from '../pages/public/Home';
import About from '../pages/public/About';
import News from '../pages/public/News';
import NewsDetail from '../pages/public/NewsDetail';
import Programs from '../pages/public/Programs';
import Contact from '../pages/public/Contact';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Admin Login */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes inside MainLayout */}
      <Route element={<MainLayout />}>
        {/* Dashboard and other pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/academic-years" element={<AcademicYears />} />
        <Route path="/classes" element={<SchoolClasses />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/parents" element={<Parents />} />
        <Route path="/students" element={<Children />} />
        <Route path="/meals" element={<Meals />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/reports" element={<AttendanceReports />} />
        <Route path="/manage-news" element={<NewsManagement />} />
        <Route path="/manage-notifications" element={<NotificationManagement />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;