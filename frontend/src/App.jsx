import { Route, Routes, useLocation, Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import Pricing from './pages/Pricing';
import Settings from './pages/Settings';
import SyncStatus from './pages/SyncStatus';
import DataUsage from './pages/DataUsage';
import ParentPortal from './pages/ParentPortal';
import ClassManagement from './pages/ClassManagement';
// New Feature Pages
import CommunityHome from './pages/community/CommunityHome';
import Exams from './pages/assessments/Exams';
import AttemptExam from './pages/assessments/AttemptExam';
import Results from './pages/assessments/Results';
import Certificates from './pages/certification/Certificates';
import Notifications from './pages/notifications/Notifications';
import Insights from './pages/analytics/Insights';
import GettingStarted from './pages/onboarding/GettingStarted';
import Reports from './pages/reports/Reports';

import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import { AuthProvider } from './context/AuthContext';
import { useSettings, SettingsProvider } from './context/SettingsContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { OfflineProvider } from './context/OfflineContext';
import { CommunityProvider } from './context/CommunityContext';
import { ExamProvider } from './context/ExamContext';
import { ProgressProvider } from './context/ProgressContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import MainLayout from './components/Layout/MainLayout';
import AskDoubt from './pages/community/AskDoubt';
import Discussions from './pages/community/Discussions';

// --- Wednesday Addams Effects Component ---
const WednesdayEffects = () => {
  const { settings } = useSettings();
  const isWednesday = settings.themeAccessibility.theme === 'WEDNESDAY';
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [spiders, setSpiders] = useState([]);
  const nextSpiderId = useRef(0);

  useEffect(() => {
    if (!isWednesday) return;

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const spawnSpider = () => {
      if (spiders.length >= 3) return; // Keep it elegant, max 3

      const id = nextSpiderId.current++;
      const type = Math.random() > 0.5 ? 'descend' : 'crawl';
      const duration = 10000 + Math.random() * 5000;

      const newSpider = {
        id,
        type,
        style: type === 'descend' ? {
          left: `${10 + Math.random() * 80}%`,
          top: 0,
          animation: `spiderDescend ${duration}ms linear forwards`
        } : {
          left: '-50px',
          top: `${20 + Math.random() * 60}%`,
          animation: `crawlOnEdge ${duration}ms linear forwards`,
          offsetPath: `path('M 0 0 L ${window.innerWidth + 100} ${Math.random() * 200 - 100}')`
        }
      };

      setSpiders((prev) => [...prev, newSpider]);
      setTimeout(() => {
        setSpiders((prev) => prev.filter((s) => s.id !== id));
      }, duration);
    };

    const timer = setInterval(() => {
      if (Math.random() > 0.6) spawnSpider();
    }, 12000);

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(timer);
    };
  }, [isWednesday, spiders.length]);

  useEffect(() => {
    const root = document.documentElement;
    if (isWednesday) {
      root.classList.add('theme-wednesday');
      document.body.classList.add('theme-wednesday');
    } else {
      root.classList.remove('theme-wednesday');
      document.body.classList.remove('theme-wednesday');
    }
  }, [isWednesday]);

  return (
    <AnimatePresence>
      {isWednesday &&
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 2 }}
        className="fixed inset-0 pointer-events-none z-9999 overflow-hidden">
        
          {/* Web Strands in Corners */}
          <div className="wednesday-web-corner web-tl" />
          <div className="wednesday-web-corner web-tr" />
          <div className="wednesday-web-corner web-bl" />

          {/* Cinematic Overlay Layers */}
          <div className="wednesday-fog" />
          <div className="wednesday-rain" />
          <div className="wednesday-grain" />
          <div className="wednesday-vignette" />
          <div className="wednesday-flicker" />
          
          {/* Shadow Creatures passing by */}
          <div className="shadow-creature" style={{ animation: 'shadowPassHorizontal 40s linear infinite' }} />
          <div className="shadow-creature" style={{ animation: 'shadowPassHorizontal 60s linear infinite reverse', top: '40%' }} />

          {/* Spotlight that follows cursor */}
          <div
          className="fixed inset-0 pointer-events-none z-12"
          style={{
            background: `radial-gradient(circle 350px at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.035) 0%, transparent 100%)`
          }} />
        

          {/* Active Spiders */}
          {spiders.map((spider) =>
        <div key={spider.id} className="wednesday-spider-spawn" style={spider.style}>
              <div className="spider-body" style={{ animation: 'spiderWiggle 0.5s infinite' }} />
              {spider.type === 'descend' && <div className="silk-thread" />}
            </div>
        )}

          {/* Sparse Raven Feathers */}
          <div className="wednesday-feather" style={{ left: '15%', animationDelay: '0s' }} />
          <div className="wednesday-feather" style={{ left: '85%', animationDelay: '12s' }} />
        </motion.div>
      }
    </AnimatePresence>);

};
function AppContent() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  // Keep every page starting at the top when navigating between routes.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  const renderRoutes = () =>
  <Routes>
      <Route path="/" element={<Home />} />
      <Route
      path="/dashboard"
      element={
      <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
      } />
    
      <Route
      path="/lessons"
      element={
      <ProtectedRoute allowedRoles={['student', 'teacher', 'admin', 'user']}>
            <Lessons />
          </ProtectedRoute>
      } />
    
      <Route
      path="/lessons/:id"
      element={
      <ProtectedRoute allowedRoles={['student', 'teacher', 'admin', 'user']}>
            <LessonViewer />
          </ProtectedRoute>
      } />
    
      <Route
      path="/lessons/uploaded"
      element={
      <ProtectedRoute allowedRoles={['student', 'teacher', 'admin', 'user']}>
            <UploadedPdf />
          </ProtectedRoute>
      } />
    
      <Route
      path="/lessons/quiz"
      element={
      <ProtectedRoute allowedRoles={['student', 'teacher', 'admin', 'user']}>
            <PdfQuiz />
          </ProtectedRoute>
      } />
    
      <Route
      path="/assignments"
      element={
      <ProtectedRoute allowedRoles={['student', 'teacher', 'admin', 'user']}>
            <Assignments />
          </ProtectedRoute>
      } />
    
      <Route
      path="/ai-tutor"
      element={
      <ProtectedRoute allowedRoles={['student', 'teacher', 'admin', 'user']}>
            <AITutor />
          </ProtectedRoute>
      } />
    
      <Route
      path="/accessibility"
      element={<Accessibility />} />
    
      <Route
      path="/support"
      element={<Support />} />
    
      <Route
      path="/pricing"
      element={<Pricing />} />
    
      <Route
      path="/settings"
      element={
      <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
      } />
    
      <Route path="/sign-language/*" element={<ProtectedRoute><SignLanguage /></ProtectedRoute>} />
      <Route path="/captions" element={<ProtectedRoute><Captions /></ProtectedRoute>} />
      <Route path="/speech-assist" element={<ProtectedRoute><SpeechAssist /></ProtectedRoute>} />
      <Route path="/downloads" element={<ProtectedRoute allowedRoles={['student', 'teacher', 'admin', 'user']}><UploadedPdf /></ProtectedRoute>} />
      <Route path="/sync-status" element={<ProtectedRoute allowedRoles={['student', 'teacher', 'admin', 'user']}><SyncStatus /></ProtectedRoute>} />
      <Route path="/data-usage" element={<ProtectedRoute><DataUsage /></ProtectedRoute>} />
      <Route path="/parent-view" element={<ProtectedRoute allowedRoles={['parent', 'admin', 'teacher']}><ParentPortal /></ProtectedRoute>} />
      <Route path="/student-progress" element={<ProtectedRoute allowedRoles={['parent', 'admin', 'teacher']}><ParentPortal /></ProtectedRoute>} />
      <Route path="/class-management" element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><ClassManagement /></ProtectedRoute>} />
      <Route path="/assignments/create" element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><Assignments /></ProtectedRoute>} />
      
      {/* New Feature Routes */}
      <Route path="/community" element={<ProtectedRoute><CommunityHome /></ProtectedRoute>} />
      <Route path="/community/ask" element={<ProtectedRoute><AskDoubt /></ProtectedRoute>} />
      <Route path="/community/discussion/:id" element={<ProtectedRoute><Discussions /></ProtectedRoute>} />
      <Route path="/exams" element={<ProtectedRoute allowedRoles={['student', 'teacher', 'admin', 'user']}><Exams /></ProtectedRoute>} />
      <Route path="/exams/attempt/:examId" element={<ProtectedRoute allowedRoles={['student', 'teacher', 'admin', 'user']}><AttemptExam /></ProtectedRoute>} />
      <Route path="/exams/results" element={<ProtectedRoute allowedRoles={['student', 'teacher', 'admin', 'user']}><Results /></ProtectedRoute>} />
      <Route path="/certificates" element={<ProtectedRoute allowedRoles={['student', 'teacher', 'admin', 'user']}><Certificates /></ProtectedRoute>} />
      <Route path="/education" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/insights" element={<ProtectedRoute allowedRoles={['student', 'teacher', 'parent', 'admin', 'user']}><Insights /></ProtectedRoute>} />
      <Route path="/onboarding" element={<GettingStarted />} />
      <Route path="/reports" element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><Reports /></ProtectedRoute>} />
      <Route
      path="/admin"
      element={
      <ProtectedRoute allowedRoles={['admin']}>
            <Admin />
          </ProtectedRoute>
      } />
    
      <Route
      path="/login"
      element={
      <PublicRoute>
            <Login />
          </PublicRoute>
      } />
    
      <Route
      path="/register"
      element={
      <PublicRoute>
            <Register />
          </PublicRoute>
      } />
    
      <Route
        path="*"
        element={
          <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full bg-app-bg border border-app-border rounded-3xl p-8 text-center shadow-xl">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-5 font-black text-2xl">
                404
              </div>
              <h1 className="text-2xl font-black text-app-text-main tracking-tight mb-2">Page Not Found</h1>
              <p className="text-sm font-medium text-app-text-sub mb-6 leading-relaxed">
                The module or lesson you are looking for might have been moved or is currently unavailable offline.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  Dashboard
                </Link>
                <Link
                  to="/lessons"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-app-bg-alt border border-app-border text-app-text-main text-xs font-black uppercase tracking-wider hover:bg-app-border/40 transition-colors"
                >
                  Browse Lessons
                </Link>
              </div>
            </div>
          </div>
        }
      />
    
    </Routes>;


  return (
    <div className="min-h-screen bg-app-bg transition-colors duration-300">
      <WednesdayEffects />
      <OfflineBanner />
      {isAuthPage ?
      <main className="flex-1">
          {renderRoutes()}
        </main> :

      <MainLayout>
          {renderRoutes()}
        </MainLayout>
      }
      <VoiceControl />
    </div>);

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
    </AuthProvider>);

}

export default App;
