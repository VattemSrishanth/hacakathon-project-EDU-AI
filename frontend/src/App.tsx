import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import OfflineBanner from './components/OfflineBanner';
import VoiceControl from './components/VoiceControl';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Lessons from './pages/Lessons';
import LessonViewer from './pages/LessonViewer';
import AITutor from './pages/AITutor';
import Assignments from './pages/Assignments';
import Accessibility from './pages/Accessibility';
import Support from './pages/Support';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <OfflineBanner />
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
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
                <ProtectedRoute>
                  <Accessibility />
                </ProtectedRoute>
              }
            />
            <Route
              path="/support"
              element={
                <ProtectedRoute>
                  <Support />
                </ProtectedRoute>
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
        <Footer />
        <VoiceControl />
      </div>
    </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
