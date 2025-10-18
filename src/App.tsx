import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import './i18n'
import DashboardLayout from './layouts/DashboardLayout'
import AuthLayout from './layouts/AuthLayout'
import Home from './pages/Home'
import StudentLogin from './pages/auth/StudentLogin'
import Login from './pages/auth/Login'
import TeacherCallback from './pages/auth/TeacherCallback'
import TeacherLogin from './pages/auth/TeacherLogin'
import ParentLogin from './pages/auth/ParentLogin'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Notifications from './pages/Notifications'
import Assignments from './pages/Assignments'
import Attendance from './pages/StudentAttendance'
import Report from './pages/Report'
import Assistant from './pages/Assistant'
import ProtectedRoute from './layouts/ProtectedRoute'
import StudentGrades from './pages/StudentGrades'

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: 'notifications', element: <Notifications /> },
          { path: 'grades', element: <StudentGrades /> },
          { path: 'assignments', element: <Assignments /> },
          { path: 'attendance', element: <Attendance /> },
          { path: 'report', element: <Report /> },
          { path: 'assistant', element: <Assistant /> },
          { path: 'reports', element: <Reports /> },
          { path: 'settings', element: <Settings /> },
        ],
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Login /> },
      { path: 'teacher', element: <TeacherLogin /> },
      { path: 'teacher/callback', element: <TeacherCallback /> },
      { path: 'parent', element: <ParentLogin /> },
      { path: 'student', element: <StudentLogin /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

function App(): JSX.Element {
  return <RouterProvider router={router} />;
}

export default App;

