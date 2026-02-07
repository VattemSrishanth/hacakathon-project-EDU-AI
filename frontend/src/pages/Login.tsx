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
  GraduationCap,
  Users,
  UserCheck,
  ShieldAlert
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { useOffline } from "../context/OfflineContext";
import Button from "../components/Button";
import { authAPI } from "../services/api";
import type { UserRole } from "../context/AuthContext";

import { auth as firebaseAuth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, continueAsGuest } = useAuth();
  const { isOffline } = useOffline();
  const { settings, updateLearning } = useSettings();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const roles = [
    { id: "student", label: "Student", icon: GraduationCap, color: "from-cyan-400 to-blue-500", shadow: "shadow-cyan-500/50" },
    { id: "teacher", label: "Teacher", icon: Users, color: "from-purple-400 to-pink-500", shadow: "shadow-purple-500/50" },
    { id: "parent", label: "Parent", icon: UserCheck, color: "from-emerald-400 to-teal-500", shadow: "shadow-emerald-500/50" },
    { id: "admin", label: "Admin", icon: ShieldAlert, color: "from-orange-400 to-red-500", shadow: "shadow-orange-500/50" }
  ];

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
      // Backend should return role, or we use the selected one if backend doesn't support it yet
      if (response?.success) {
        login({ 
          token: response?.token, 
          user: { ...response?.user, role: response?.user?.role || role } 
        });
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
          id: user.uid,
          role: role // Use the selected role for Google Login
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
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center py-12 px-4 transition-colors duration-300 font-sans relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      
      <div className="w-full max-w-xl relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-black border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)] mb-8 transition-transform hover:scale-110">
            <ShieldCheck size={48} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
            WELCOME BACK
          </h1>
          <p className="text-cyan-400 mt-3 font-black underline decoration-cyan-500/50 underline-offset-8 uppercase text-xs tracking-[0.3em]">
            SIGN IN TO YOUR ACCOUNT
          </p>
        </div>

        <div className="bg-[#111] border-2 border-white/5 rounded-[2.5rem] overflow-hidden p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
          {/* Neon Border Effect */}
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
          
          <div className="mb-8 overflow-x-auto pb-4 scrollbar-none">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-1">Select Access Portal</p>
            <div className="flex gap-4 min-w-max">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id as UserRole)}
                  className={`
                    flex flex-col items-center gap-3 px-6 py-5 rounded-3xl transition-all duration-300 border-2
                    ${role === r.id 
                      ? `bg-linear-to-br ${r.color} border-transparent text-white shadow-lg ${r.shadow} scale-105` 
                      : 'bg-black/40 border-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300'}
                  `}
                >
                  <r.icon size={24} className={role === r.id ? 'animate-bounce' : ''} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <div className="relative group">
              <select
                value={settings.learning.language}
                onChange={(e) => updateLearning({ language: e.target.value as any })}
                className="w-full pl-12 pr-10 py-4 bg-black border-2 border-white/5 text-[11px] font-black text-white uppercase tracking-widest rounded-2xl focus:outline-none focus:border-cyan-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="English">English</option>
                <option value="Telugu">Telugu</option>
                <option value="Hindi">Hindi</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Globe size={18} className="text-cyan-500" />
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform group-focus-within:rotate-180">
                <ChevronDown size={18} className="text-gray-600" />
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-8 rounded-2xl border-2 border-red-500/20 bg-red-500/10 px-6 py-4 text-xs text-red-500 font-black uppercase tracking-widest flex items-center gap-4 animate-shake">
              <AlertCircle size={20} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-gray-500 ml-1 uppercase tracking-[0.2em]">
                Identity Handle (Email)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Mail size={20} className="text-cyan-500 group-focus-within:animate-pulse" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@nexus.ai"
                  className="w-full pl-14 pr-6 py-5 bg-black border-2 border-white/5 text-white rounded-2xl focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all font-bold placeholder:text-gray-700"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end mb-1">
                <label className="block text-[10px] font-black text-gray-500 ml-1 uppercase tracking-[0.2em]">
                  Security Protocol (Password)
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock size={20} className="text-cyan-500 group-focus-within:animate-pulse" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  className="w-full pl-14 pr-14 py-5 bg-black border-2 border-white/5 text-white rounded-2xl focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all font-bold placeholder:text-gray-700"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-600 hover:text-cyan-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="text-right">
                <Link to="/forgot-password" virtual-link="true" className="text-[10px] font-black uppercase tracking-widest text-cyan-500/60 hover:text-cyan-400 transition-colors hover:underline">
                  Reset Credentials
                </Link>
              </div>
            </div>

            <Button 
              type="submit" 
              className={`
                w-full py-6 rounded-2xl text-xs font-black uppercase tracking-[0.3em] transition-all
                bg-black border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]
                disabled:opacity-30 disabled:pointer-events-none
              `} 
              disabled={loading || isOffline}
            >
              {loading ? "INITIALIZING..." : isOffline ? "NETWORK OFFLINE" : "AUTHORIZE ACCESS"}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t-2 border-white/5 flex flex-col gap-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-5 bg-black border-2 border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-4 hover:border-white/20 transition-all text-white active:scale-95"
            >
              <FcGoogle size={20} />
              Secure Sync with Google
            </button>

            <button
              type="button"
              onClick={handleGuestMode}
              className="w-full py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
            >
              Proceed as Anonymous Guest
            </button>
          </div>

          <div className="mt-10 text-center">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              New to the Nexus?{" "}
              <Link to="/register" className="text-cyan-500 font-black hover:underline ml-2">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
