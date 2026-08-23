import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StudentRoute, AdminRoute, RootRedirect } from './ProtectedRoute';
import { MainLayout } from '../components/layout/MainLayout';
import { AdminLayout } from '../components/layout/AdminLayout';

import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Dashboard } from '../pages/Dashboard';
import { Aptitude } from '../pages/Aptitude';
import { ChapterDetail } from '../pages/ChapterDetail';
import { TestEnvironment } from '../pages/TestEnvironment';
import { TestResult } from '../pages/TestResult';
import { TestHistory } from '../pages/TestHistory';
import { ProgressAnalytics } from '../pages/ProgressAnalytics';
import { CsFundamentals } from '../pages/CsFundamentals';
import { DsaTracker } from '../pages/DsaTracker';

import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminStudents } from '../pages/admin/AdminStudents';
import { AdminStudentDetail } from '../pages/admin/AdminStudentDetail';
import { AdminQuestionBank } from '../pages/admin/AdminQuestionBank';
import { AdminDsaProblems } from '../pages/admin/AdminDsaProblems';
import { AdminCurriculum } from '../pages/admin/AdminCurriculum';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student / learning platform — admins are bounced to /admin by StudentRoute */}
      <Route element={<StudentRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/aptitude" element={<Aptitude />} />
          <Route path="/chapter/:chapterId" element={<ChapterDetail />} />
          <Route path="/test/:testId" element={<TestEnvironment />} />
          <Route path="/test/:testId/result" element={<TestResult />} />
          <Route path="/history" element={<TestHistory />} />
          <Route path="/progress" element={<ProgressAnalytics />} />
          <Route path="/cs-fundamentals" element={<CsFundamentals />} />
          <Route path="/dsa" element={<DsaTracker />} />
        </Route>
      </Route>

      {/* Admin panel — completely separate shell; students are bounced to /dashboard by AdminRoute */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/students/:id" element={<AdminStudentDetail />} />
          <Route path="/admin/questions" element={<AdminQuestionBank />} />
          <Route path="/admin/dsa-problems" element={<AdminDsaProblems />} />
          <Route path="/admin/curriculum" element={<AdminCurriculum />} />
        </Route>
      </Route>

      {/* Role-aware landing + catch-all */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};
