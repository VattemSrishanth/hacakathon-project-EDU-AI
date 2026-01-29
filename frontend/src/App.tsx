import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import OfflineBanner from './components/OfflineBanner';
import VoiceControl from './components/VoiceControl';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Lessons from './pages/Lessons';
import LessonViewer from './pages/LessonViewer';
import UploadedPdf from './pages/UploadedPdf';
import PdfQuiz from './pages/PdfQuiz';
import AITutor from './pages/AITutor';
import Assignments from './pages/Assignments';
import Accessibility from './pages/Accessibility';
import Support from './pages/Support';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PublicRoute from './components/PublicRoute';

// New component to handle the mandatory selection between Login/Guest
const RequireSelection = ({ children }: { children: React.ReactElement }) => {
  const { auth } = useAuth();
  if (!auth) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppContent() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  // Keep every page starting at the top when navigating between routes.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-app-bg transition-colors duration-300">
      <OfflineBanner />
      {!isAuthPage && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<RequireSelection><Home /></RequireSelection>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons"
            element={
              <ProtectedRoute>
                <Lessons />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons/:id"
            element={
              <ProtectedRoute>
                <LessonViewer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons/uploaded"
            element={
              <ProtectedRoute>
                <UploadedPdf />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons/quiz"
            element={
              <ProtectedRoute>
                <PdfQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignments"
            element={
              <ProtectedRoute>
                <Assignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-tutor"
            element={
              <ProtectedRoute>
                <AITutor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accessibility"
            element={
              <RequireSelection>
                <Accessibility />
              </RequireSelection>
            }
          />
          <Route
            path="/support"
            element={
              <RequireSelection>
                <Support />
              </RequireSelection>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
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
          <Route
            path="*"
            element={
              <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-gray-900">Page Not Found</h1>
                  <p className="text-gray-600 mt-2">The page you are looking for does not exist.</p>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
      <VoiceControl />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
