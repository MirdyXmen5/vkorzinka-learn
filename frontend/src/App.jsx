import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Header from './components/Header';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import TestView from './pages/TestView';
import Profile from './pages/Profile';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserList from './pages/AdminUserList';
import AdminCourseList from './pages/AdminCourseList';
import AdminCourseForm from './pages/AdminCourseForm';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Layout for regular user pages
const UserLayout = () => (
  <div className="min-h-screen bg-gray-100">
    <Header />
    <main>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Outlet />
        </div>
      </div>
    </main>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Regular User Routes */}
          <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
            <Route path="/" element={<CourseList />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/courses/:id/test" element={<TestView />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUserList />} />
            <Route path="courses" element={<AdminCourseList />} />
            <Route path="courses/new" element={<AdminCourseForm />} />
            <Route path="courses/edit/:id" element={<AdminCourseForm />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
