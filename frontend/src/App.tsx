import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
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
import SignLanguage from './pages/SignLanguage';
import Captions from './pages/Captions';
import SpeechAssist from './pages/SpeechAssist';
import Support from './pages/Support';
import Settings from './pages/Settings';
import ComingSoon from './pages/ComingSoon';
// New Feature Pages
import CommunityHome from './pages/community/CommunityHome';
import Exams from './pages/assessments/Exams';
import Certificates from './pages/certification/Certificates';
import Notifications from './pages/notifications/Notifications';
import Insights from './pages/analytics/Insights';
import GettingStarted from './pages/onboarding/GettingStarted';
import Reports from './pages/reports/Reports';

import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { OfflineProvider } from './context/OfflineContext';
import { CommunityProvider } from './context/CommunityContext';
import { ExamProvider } from './context/ExamContext';
import { ProgressProvider } from './context/ProgressContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import MainLayout from './components/Layout/MainLayout';
import AskDoubt from './pages/community/AskDoubt';

function AppContent() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  // Keep every page starting at the top when navigating between routes.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  const renderRoutes = () => (
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
          <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
            <Lessons />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lessons/:id"
        element={
          <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
            <LessonViewer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lessons/uploaded"
        element={
          <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
            <UploadedPdf />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lessons/quiz"
        element={
          <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
            <PdfQuiz />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assignments"
        element={
          <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
            <Assignments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-tutor"
        element={
          <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
            <AITutor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/accessibility"
        element={<Accessibility />}
      />
      <Route
        path="/support"
        element={<Support />}
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route path="/sign-language" element={<ProtectedRoute><SignLanguage /></ProtectedRoute>} />
      <Route path="/captions" element={<ProtectedRoute><Captions /></ProtectedRoute>} />
      <Route path="/speech-assist" element={<ProtectedRoute><SpeechAssist /></ProtectedRoute>} />
      <Route path="/downloads" element={<ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}><UploadedPdf /></ProtectedRoute>} />
      <Route path="/sync-status" element={<ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}><ComingSoon title="Sync Status" /></ProtectedRoute>} />
      <Route path="/data-usage" element={<ProtectedRoute><ComingSoon title="Data Usage" /></ProtectedRoute>} />
      <Route path="/parent-view" element={<ProtectedRoute allowedRoles={['parent', 'admin']}><ComingSoon title="Parent View" /></ProtectedRoute>} />
      
      {/* New Feature Routes */}
      <Route path="/community" element={<ProtectedRoute><CommunityHome /></ProtectedRoute>} />
      <Route path="/community/ask" element={<ProtectedRoute><AskDoubt /></ProtectedRoute>} />
      <Route path="/exams" element={<ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}><Exams /></ProtectedRoute>} />
      <Route path="/certificates" element={<ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}><Certificates /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/insights" element={<ProtectedRoute allowedRoles={['student', 'teacher', 'parent', 'admin']}><Insights /></ProtectedRoute>} />
      <Route path="/onboarding" element={<GettingStarted />} />
      <Route path="/reports" element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><Reports /></ProtectedRoute>} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Admin />
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
              <h1 className="text-3xl font-bold text-app-text-main">Page Not Found</h1>
              <p className="text-app-text-sub mt-2">The page you are looking for does not exist.</p>
            </div>
          </div>
        }
      />
    </Routes>
  );

  return (
    <div className="min-h-screen bg-app-bg transition-colors duration-300">
      <OfflineBanner />
      {isAuthPage ? (
        <main className="flex-1">
          {renderRoutes()}
        </main>
      ) : (
        <MainLayout>
          {renderRoutes()}
        </MainLayout>
      )}
      <VoiceControl />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AccessibilityProvider>
          <OfflineProvider>
            <CommunityProvider>
              <ExamProvider>
                <ProgressProvider>
                  <AppContent />
                </ProgressProvider>
              </ExamProvider>
            </CommunityProvider>
          </OfflineProvider>
        </AccessibilityProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
