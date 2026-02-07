import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  AlertCircle, 
  Globe, 
  ChevronDown, 
  Eye,
  EyeOff,
  UserCircle
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { useOffline } from "../context/OfflineContext";
import Card from "../components/Card";
import Button from "../components/Button";
import { authAPI } from "../services/api";

import { auth as firebaseAuth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, continueAsGuest } = useAuth();
  const { isOffline } = useOffline();
  const { settings, updateLearning, t } = useSettings();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (location.state?.message) {
      setErrorMessage(location.state.message);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      if (isOffline) {
        setErrorMessage("Internet connection required for login. Please check your connection.");
        setLoading(false);
        return;
      }
      const response = await authAPI.login(email, password);
      if (response?.success) {
        login({ token: response?.token, user: response?.user });
        navigate("/", { replace: true });
      } else {
        setErrorMessage(response?.error || "Login failed. Please try again.");
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Login failed. Please try again.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    continueAsGuest();
    navigate("/", { replace: true });
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const user = result.user;
      
      login({ 
        token: await user.getIdToken(), 
        user: { 
          name: user.displayName || "Google User", 
          email: user.email || "",
          avatarUrl: user.photoURL || "",
          id: user.uid
        } 
      });

      navigate("/", { replace: true });
    } catch (error: any) {
      console.error("Auth Error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        setErrorMessage("Login cancelled.");
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 mb-6 shadow-sm ring-1 ring-primary/20 shadow-primary/10 transition-transform hover:scale-105">
            <ShieldCheck size={40} className="text-primary" />
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
                className="w-full pl-10 pr-10 py-3 bg-app-bg border border-app-border text-[10px] font-bold uppercase tracking-widest rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
              >
                <option value="English">English</option>
                <option value="Telugu">?????? (Telugu)</option>
                <option value="Hindi">?????? (Hindi)</option>
                <option value="Spanish">Espa�ol (Spanish)</option>
                <option value="French">Fran�ais (French)</option>
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Globe size={18} className="text-primary" />
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform group-focus-within:rotate-180">
                <ChevronDown size={18} className="text-app-text-sub" />
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-2xl border-2 border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-600 font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="shrink-0">
                <AlertCircle size={20} />
              </div>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-black text-app-text-sub ml-1 uppercase tracking-widest">
                {t.auth.email}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={20} className="text-primary transition-colors group-focus-within:text-blue-600" />
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
              <div className="flex justify-between items-end mb-1">
                <label className="block text-xs font-black text-app-text-sub ml-1 uppercase tracking-widest">
                  {t.auth.password}
                </label>
                <Link to="/forgot-password" className="text-[10px] font-black uppercase tracking-wider text-blue-600 hover:text-blue-700 decoration-2 underline-offset-4 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={20} className="text-primary transition-colors group-focus-within:text-blue-600" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="��������"
                  className="w-full pl-12 pr-12 py-4 bg-app-bg border border-app-border text-app-text-main rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold shadow-sm placeholder:opacity-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-app-text-muted hover:text-blue-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full py-5 rounded-2xl shadow-xl shadow-blue-500/20 text-sm font-black uppercase tracking-widest disabled:grayscale disabled:opacity-50" 
              disabled={loading || isOffline}
            >
              {loading ? t.auth.signingIn : isOffline ? "Offline - Check Connection" : "Sign In Now"}
            </Button>
          </form>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading || isOffline}
              className="col-span-2 px-6 py-4 bg-[#0a0f18] border border-white/5 rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#111827] transition-all shadow-xl active:scale-95 text-white disabled:grayscale disabled:opacity-50"
            >
              <FcGoogle size={22} />
              Sign in with Google
            </button>

            <button
              type="button"
              onClick={handleGuestMode}
              disabled={loading}
              className="col-span-2 px-6 py-4 bg-app-bg border border-app-border rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-app-bg-alt transition-all shadow-sm active:scale-95 text-app-text-main"
            >
              <UserCircle size={20} className="text-primary" />
              Continue as Guest
            </button>
          </div>

          <div className="mt-10 pt-8 border-t border-app-border text-center">
            <p className="text-app-text-sub text-xs font-bold uppercase tracking-widest">
              {t.auth.noAccount}{" "}
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
