import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
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
import { SettingsProvider, useSettings } from './context/SettingsContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PublicRoute from './components/PublicRoute';
import { motion, AnimatePresence } from 'framer-motion';

// --- Supernatural Effects Component for Stranger Things Theme ---
const SupernaturalEffects = () => {
  const { settings } = useSettings();
  const [isGlitching, setIsGlitching] = useState(false);
  const isStranger = settings.themeAccessibility.theme === 'STRANGER THINGS';
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!isStranger) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const triggerGlitch = () => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 300 + Math.random() * 400);
      
      const nextGlitch = 12000 + Math.random() * 10000; // 12-22 seconds
      timerRef.current = setTimeout(triggerGlitch, nextGlitch);
    };

    timerRef.current = setTimeout(triggerGlitch, 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isStranger]);

  useEffect(() => {
    if (isStranger && isGlitching) {
      document.body.classList.add('glitch-active');
    } else {
      document.body.classList.remove('glitch-active');
    }
    return () => document.body.classList.remove('glitch-active');
  }, [isGlitching, isStranger]);

  return (
    <AnimatePresence>
      {isStranger && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="fixed inset-0 pointer-events-none z-9999 overflow-hidden"
        >
          {/* Cinematic Grain/Noise */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          
          {/* Floating Spores */}
          <div className="st-spores" />
          
          {/* Fog Layers */}
          <div className="st-fog-layer" />
          
          {/* Moving Vignette */}
          <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Wednesday Addams Effects Component ---
const WednesdayEffects = () => {
  const { settings } = useSettings();
  const isWednesday = settings.themeAccessibility.theme === 'WEDNESDAY';
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [spiders, setSpiders] = useState<{ id: number; style: any; type: string }[]>([]);
  const nextSpiderId = useRef(0);

  useEffect(() => {
    if (!isWednesday) return;

    const handleMouseMove = (e: MouseEvent) => {
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
          animation: `spiderDescend ${duration}ms linear forwards`,
        } : {
          left: '-50px',
          top: `${20 + Math.random() * 60}%`,
          animation: `crawlOnEdge ${duration}ms linear forwards`,
          offsetPath: `path('M 0 0 L ${window.innerWidth + 100} ${Math.random() * 200 - 100}')`
        }
      };

      setSpiders(prev => [...prev, newSpider]);
      setTimeout(() => {
        setSpiders(prev => prev.filter(s => s.id !== id));
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
      {isWednesday && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="fixed inset-0 pointer-events-none z-9999 overflow-hidden"
        >
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
            }}
          />

          {/* Active Spiders */}
          {spiders.map(spider => (
            <div key={spider.id} className="wednesday-spider-spawn" style={spider.style}>
              <div className="spider-body" style={{ animation: 'spiderWiggle 0.5s infinite' }} />
              {spider.type === 'descend' && <div className="silk-thread" />}
            </div>
          ))}

          {/* Sparse Raven Feathers */}
          <div className="wednesday-feather" style={{ left: '15%', animationDelay: '0s' }} />
          <div className="wednesday-feather" style={{ left: '85%', animationDelay: '12s' }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

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
      <SupernaturalEffects />
      <WednesdayEffects />
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
                  <h1 className="text-3xl font-bold text-app-text-main">Page Not Found</h1>
                  <p className="text-app-text-sub mt-2">The page you are looking for does not exist.</p>
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
