import { Route, Routes, useLocation } from 'react-router-dom';
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

// --- Supernatural Effects Component for Stranger Things Theme ---
const SupernaturalEffects = () => {
  const { settings } = useSettings();
  const [isGlitching, setIsGlitching] = useState(false);
  const [rifts, setRifts] = useState<{ id: number; left: string; top: string; scale: number }[]>([]);
  const isStranger = settings.themeAccessibility.theme === 'STRANGER THINGS';
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isStranger) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const triggerGlitch = () => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 500 + Math.random() * 800);
      
      // Spawn a rift regularly
      if (Math.random() > 0.35) {
        const id = Date.now();
        setRifts(prev => [...prev, { 
          id, 
          left: `${10 + Math.random() * 80}%`, 
          top: `${10 + Math.random() * 80}%`,
          scale: 0.8 + Math.random() * 2.0
        }]);
        setTimeout(() => setRifts(prev => prev.filter(r => r.id !== id)), 12000);
      }

      const nextGlitch = 6000 + Math.random() * 7000; 
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

  useEffect(() => {
    const root = document.documentElement;
    if (isStranger) {
      root.classList.add('theme-stranger');
      document.body.classList.add('theme-stranger');
    } else {
      root.classList.remove('theme-stranger');
      document.body.classList.remove('theme-stranger');
    }
  }, [isStranger]);

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
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] will-change-[opacity]" />
          
          {/* VHS Noise Layer */}
          <div className="st-vhs-noise" />
          
          {/* Floating Spores */}
          <div className="st-spores" />
          
          {/* Fog Layers */}
          <div className="st-fog-layer" />

          {/* Creeping Tentacles & Veins */}
          <div className="st-tentacle" style={{ bottom: '-150px', left: '-100px', transform: 'translateZ(0)' }} />
          <div className="st-tentacle" style={{ top: '-150px', right: '-100px', animationDelay: '-8s', transform: 'translateZ(0)' }} />
          <div className="st-tentacle" style={{ bottom: '-150px', right: '-100px', animationDelay: '-15s', transform: 'scaleX(-1) translateZ(0)' }} />
          
          <div className="st-vein" style={{ top: '10%', animationDelay: '0s', transform: 'translateZ(0)' }} />
          <div className="st-vein" style={{ top: '40%', animationDelay: '5s', transform: 'translateZ(0)' }} />
          <div className="st-vein" style={{ top: '70%', animationDelay: '12s', transform: 'translateZ(0)' }} />
          <div className="st-vein" style={{ top: '85%', animationDelay: '18s', transform: 'translateZ(0)' }} />
          
          {/* Random Rifts */}
          {rifts.map(rift => (
            <div 
              key={rift.id} 
              className="st-rift" 
              style={{ left: rift.left, top: rift.top, transform: `scale(${rift.scale})` }} 
            />
          ))}

          {/* Moving Vignette */}
          <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Game of Thrones Winter Theme Effects ---
const ThronesEffects = () => {
    const { settings } = useSettings();
    const isThrones = settings.themeAccessibility.theme === 'GAME OF THRONES';
    
    // Stable random values for effects (generated once)
    const [embers] = useState(() => Array.from({ length: 30 }, () => ({
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${3 + Math.random() * 4}s`
    })));

    const [ravens] = useState(() => Array.from({ length: 5 }, () => ({
        top: `${10 + Math.random() * 40}%`,
        animationDelay: `${Math.random() * 15}s`,
        animationDuration: `${15 + Math.random() * 10}s`
    })));
  
    useEffect(() => {
      const root = document.documentElement;
      if (isThrones) {
        root.classList.add('theme-thrones-winter');
        document.body.classList.add('theme-thrones-winter');
      } else {
        root.classList.remove('theme-thrones-winter');
        document.body.classList.remove('theme-thrones-winter');
      }
    }, [isThrones]);
  
    return (
      <AnimatePresence>
        {isThrones && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
          >
            {/* Dark Medieval Atmosphere Layers */}
            <div className="got-vignette" />
            
            {/* Raven Flocks */}
            {ravens.map((raven, i) => (
                <div 
                    key={`raven-${i}`}
                    className="got-raven"
                    style={{
                        top: raven.top,
                        animationDelay: raven.animationDelay,
                        animationDuration: raven.animationDuration
                    }}
                />
            ))}

            {/* Snowfall Layers - Multiple depths */}
            <div className="got-snow-layer layer-1" style={{ opacity: 0.15 }} />
            <div className="got-snow-layer layer-2" style={{ opacity: 0.1 }} />
  
            {/* Drifting Smoke - Bottom heavy */}
            <div className="got-smoke-layer" style={{ height: '50%', bottom: 0, top: 'auto' }} />
  
            {/* Floating Embers - Bottom heavy (Fire) */}
            <div className="got-embers-container" style={{ height: '40%', top: 'auto', bottom: 0 }}>
              {embers.map((ember, i) => (
                <div 
                  key={i} 
                  className="got-ember-particle" 
                  style={{
                    left: ember.left,
                    animationDelay: ember.animationDelay,
                    animationDuration: ember.animationDuration,
                    background: i % 2 === 0 ? '#b91c1c' : '#f59e0b' // Mix red and orange
                  }} 
                />
              ))}
            </div>
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
  const [spiders, setSpiders] = useState<{ id: number; style: React.CSSProperties; type: string }[]>([]);
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
      <Route path="/sign-language/*" element={<ProtectedRoute><SignLanguage /></ProtectedRoute>} />
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
      <SupernaturalEffects />
      <WednesdayEffects />
      <ThronesEffects />
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
