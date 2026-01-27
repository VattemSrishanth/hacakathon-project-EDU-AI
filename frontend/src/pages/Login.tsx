import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, Languages, ChevronDown, Eye, EyeOff, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { authAPI } from '../services/api';

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
      } else {
        setErrorMessage(`Google Login failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-text-main flex items-center justify-center py-12 px-4 transition-colors duration-300 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-500/10 text-blue-600 mb-6 shadow-sm ring-1 ring-blue-500/20 shadow-blue-500/10 transition-transform hover:scale-105">
            <LogIn className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-app-text-main tracking-tight uppercase">
            {t.auth.welcomeBack}
          </h1>
          <p className="text-app-text-sub mt-3 font-bold uppercase text-xs tracking-widest">
            {t.auth.signInToAccount}
          </p>
        </div>

        <Card className="shadow-2xl border-app-border bg-app-bg-alt rounded-3xl overflow-hidden p-8 animate-in fade-in zoom-in duration-500">
          <div className="mb-6">
            <div className="relative group">
              <select
                value={settings.learning.language}
                onChange={(e) => updateLearning({ language: e.target.value as any })}
                className="w-full pl-10 pr-10 py-3 bg-app-bg border border-app-border text-[10px] font-black uppercase tracking-widest rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
              >
                <option value="English">English</option>
                <option value="Telugu">తెలుగు (Telugu)</option>
                <option value="Hindi">हिन्दी (Hindi)</option>
                <option value="Spanish">Español (Spanish)</option>
                <option value="French">Français (French)</option>
              </select>
              <Languages className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text-muted" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text-muted transition-transform group-focus-within:rotate-180" />
            </div>
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-2xl border-2 border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-600 font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-black text-app-text-sub ml-1 uppercase tracking-widest">
                {t.auth.email}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-app-text-muted group-focus-within:text-blue-500 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-4 bg-app-bg border border-app-border text-app-text-main rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold shadow-sm placeholder:opacity-50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-app-text-sub ml-1 uppercase tracking-widest">
                {t.auth.password}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-app-text-muted group-focus-within:text-blue-500 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-10 py-4 bg-app-bg border border-app-border text-app-text-main rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold shadow-sm placeholder:opacity-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-app-text-muted hover:text-blue-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full py-5 rounded-2xl shadow-xl shadow-blue-500/20 text-sm font-black uppercase tracking-widest" disabled={loading}>
              {loading ? t.auth.signingIn : 'Sign In Now'}
            </Button>
          </form>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="px-4 py-3 bg-app-bg border border-app-border rounded-2xl font-black text-[10px] uppercase tracking-tighter flex items-center justify-center gap-2 hover:bg-app-bg-alt transition-all shadow-sm active:scale-95 text-app-text-main"
            >
              <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" className="w-4 h-4" alt="G" />
              Google
            </button>

            <button
              type="button"
              onClick={handleGuestMode}
              disabled={loading}
              className="px-4 py-3 bg-app-bg border border-app-border rounded-2xl font-black text-[10px] uppercase tracking-tighter flex items-center justify-center gap-2 hover:bg-app-bg-alt transition-all shadow-sm active:scale-95 text-app-text-main"
            >
              <Globe className="w-4 h-4 text-emerald-500" />
               Guest
            </button>
          </div>

          <div className="mt-10 pt-8 border-t border-app-border text-center">
            <p className="text-app-text-sub text-xs font-bold uppercase tracking-widest">
              {t.auth.noAccount}{' '}
              <Link to="/register" className="text-blue-600 font-black hover:text-blue-700 transition-colors ml-1 underline decoration-2 underline-offset-4">
                {t.auth.signUp}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
