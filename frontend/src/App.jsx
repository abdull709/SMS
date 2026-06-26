import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { AssignmentsPage } from './pages/AssignmentsPage.jsx';
import { AttendancePage } from './pages/AttendancePage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { FeesPage } from './pages/FeesPage.jsx';
import { GradesPage } from './pages/GradesPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { PerformancePage } from './pages/PerformancePage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { ReportCardsPage } from './pages/ReportCardsPage.jsx';
import { ResourcePage } from './pages/ResourcePage.jsx';
import { TeacherAssignmentsPage } from './pages/TeacherAssignmentsPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin/students" element={<ResourcePage type="students" />} />
              <Route path="/admin/teachers" element={<ResourcePage type="teachers" />} />
              <Route path="/admin/parents" element={<ResourcePage type="parents" />} />
              <Route path="/admin/classes" element={<ResourcePage type="classes" />} />
              <Route path="/admin/subjects" element={<ResourcePage type="subjects" />} />
              <Route path="/admin/teacher-assignments" element={<TeacherAssignmentsPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={['teacher']} />}>
              <Route path="/teacher/classes" element={<ResourcePage type="classes" readOnly titleOverride="My Classes" descriptionOverride="Assigned class groups." />} />
              <Route path="/teacher/performance" element={<PerformancePage />} />
            </Route>

            <Route element={<ProtectedRoute roles={['student']} />}>
              <Route path="/student/profile" element={<ProfilePage />} />
            </Route>

            <Route element={<ProtectedRoute roles={['parent']} />}>
              <Route path="/parent/children" element={<ResourcePage type="students" readOnly titleOverride="Children" descriptionOverride="Linked children and class placements." />} />
            </Route>

            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/grades" element={<GradesPage />} />
            <Route path="/assignments" element={<AssignmentsPage />} />
            <Route path="/announcements" element={<ResourcePage type="announcements" />} />
            <Route path="/calendar" element={<ResourcePage type="calendar" />} />
            <Route path="/report-cards" element={<ReportCardsPage />} />
            <Route path="/fees" element={<FeesPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
