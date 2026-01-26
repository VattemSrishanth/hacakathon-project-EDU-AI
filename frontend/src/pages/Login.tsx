import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Globe, Languages, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { authAPI } from '../services/api';
import './login-animation.css';

import { auth as firebaseAuth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, continueAsGuest } = useAuth();
  const { settings, updateLearning, t } = useSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle message from ProtectedRoute redirection
  useEffect(() => {
    if (location.state?.message) {
      setErrorMessage(location.state.message);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await authAPI.login(email, password);
      if (response?.success) {
        login({ token: response?.token, user: response?.user });
        navigate('/', { replace: true });
      } else {
        setErrorMessage(response?.error || 'Login failed. Please try again.');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const message =
        err?.response?.data?.error ||
        err?.message ||
        'Login failed. Please try again.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    continueAsGuest();
    navigate('/', { replace: true });
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      // Calling REAL Firebase Google Sign-In
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const user = result.user;
      
      login({ 
        token: await user.getIdToken(), 
        user: { 
          name: user.displayName || 'Google User', 
          email: user.email || '',
          avatarUrl: user.photoURL || '',
          id: user.uid
        } 
      });

      navigate('/', { replace: true });
    } catch (error: any) {
      console.error("Auth Error:", error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Login cancelled.');
      } else if (error.code === 'auth/api-key-not-valid' || error.code === 'auth/invalid-api-key') {
        setErrorMessage('CRITICAL: You must provide a valid Firebase API Key in src/firebase.ts to use real Gmail accounts.');
      } else {
        setErrorMessage(`Google Login failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Illustration Side */}
      <div className="illustration-side">
        <div className="character-box">
          <div className="char-purple">
            <div className="eye eye-left"></div>
            <div className="eye eye-right"></div>
          </div>
          <div className="char-orange">
            <div className="eye eye-left"></div>
            <div className="eye eye-right"></div>
          </div>
          <div className="char-black">
            <div className="eye eye-left"></div>
            <div className="eye eye-right"></div>
          </div>
          <div className="char-yellow">
            <div className="eye eye-left" style={{ top: '30px' }}></div>
            <div className="eye eye-right" style={{ top: '30px' }}></div>
          </div>
        </div>
        <div className="absolute bottom-10 left-10">
          <h2 className="text-6xl font-black text-zinc-300 opacity-20 uppercase tracking-tighter">LearnBridge</h2>
        </div>
      </div>

      {/* Form Side */}
      <div className="form-side flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-app-text-main rounded-xl mx-auto mb-4 flex items-center justify-center rotate-12 transition-transform hover:rotate-0 cursor-pointer shadow-lg">
              <ShieldCheck className="w-6 h-6 text-app-bg" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">{t.auth.welcomeBack}!</h1>
            <p className="text-app-text-sub text-sm mt-1">{t.auth.signInToAccount}</p>
          </div>

          <div className="mb-6">
            <div className="relative group">
              <select
                value={settings.learning.language}
                onChange={(e) => updateLearning({ language: e.target.value as any })}
                className="w-full pl-10 pr-10 py-3 bg-app-bg-alt border border-app-border text-xs font-black uppercase tracking-widest rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
              >
                <option value="English">English</option>
                <option value="Telugu">తెలుగు (Telugu)</option>
                <option value="Hindi">हिन्दी (Hindi)</option>
                <option value="Spanish">Español (Spanish)</option>
                <option value="French">Français (French)</option>
              </select>
              <Languages className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text-muted" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text-muted" />
            </div>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 animate-shake text-center">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-black text-app-text-sub uppercase tracking-widest pl-1">{t.auth.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-1 py-3 bg-transparent border-b-2 border-app-border focus:border-app-text-main focus:outline-none transition-all font-bold placeholder:opacity-30"
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-app-text-sub uppercase tracking-widest pl-1">{t.auth.password}</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-app-text-muted hover:text-app-text-main transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-1 py-3 bg-transparent border-b-2 border-app-border focus:border-app-text-main focus:outline-none transition-all font-bold placeholder:opacity-30"
                required
              />
            </div>

            <button
              disabled={loading}
              className="w-full py-4 bg-zinc-900 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-zinc-900/20 disabled:opacity-50"
            >
              {loading ? t.auth.signingIn : 'Log In'}
            </button>
          </form>

          <div className="mt-4 space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-4 bg-white border border-zinc-200 rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-50 transition-all shadow-sm group"
            >
              <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" className="w-4 h-4 group-hover:scale-110 transition-transform" alt="G" />
              {t.auth.googleSignIn}
            </button>

            <button
              onClick={handleGuestMode}
              disabled={loading}
              className="w-full py-4 bg-white text-zinc-900 border border-zinc-200 rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:border-zinc-900 transition-all"
            >
              <Globe className="w-4 h-4 text-emerald-500" />
              {t.auth.guestSignIn}
            </button>
          </div>

          <div className="mt-10 text-center">
            <p className="text-xs font-bold text-app-text-sub uppercase tracking-wider">
              {t.auth.noAccount}{' '}
              <Link to="/register" className="text-app-text-main font-black underline decoration-2 underline-offset-4 hover:text-blue-600 transition-colors">
                {t.auth.signUp}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
