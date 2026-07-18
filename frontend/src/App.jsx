import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/layouts/AppLayout';
import { CenteredSpinner } from '@/components/ui/Misc';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ModulesPage = lazy(() => import('@/pages/ModulesPage'));
const ModuleDetailPage = lazy(() => import('@/pages/ModuleDetailPage'));
const ActivitiesPage = lazy(() => import('@/pages/ActivitiesPage'));
const TasksPage = lazy(() => import('@/pages/TasksPage'));
const UsersPage = lazy(() => import('@/pages/UsersPage'));

export default function App() {
  return (
    <Suspense fallback={<CenteredSpinner />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/modules" element={<ModulesPage />} />
          <Route path="/modules/:id" element={<ModuleDetailPage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route
            path="/users"
            element={
              <ProtectedRoute adminOnly>
                <UsersPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
